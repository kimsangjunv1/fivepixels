import { useCallback, useState } from "react";
import type { QuestionThreadDisplay } from "@/types/report.js";

const STORAGE_KEY = "fivepixels:question-thread-preference";

function isQuestionThreadDisplay(value: unknown): value is QuestionThreadDisplay {
    return value === "expanded" || value === "collapsed";
}

function readStoredQuestionThreadDisplay(fallback: QuestionThreadDisplay): QuestionThreadDisplay {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);

        if (isQuestionThreadDisplay(stored)) {
            return stored;
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return fallback;
}

function persistQuestionThreadDisplay(display: QuestionThreadDisplay) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, display);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useQuestionThreadPreference(initialDisplay: QuestionThreadDisplay) {
    const [questionThreadDisplay, setQuestionThreadDisplayState] = useState<QuestionThreadDisplay>(() => readStoredQuestionThreadDisplay(initialDisplay));

    const setQuestionThreadDisplay = useCallback((nextDisplay: QuestionThreadDisplay) => {
        setQuestionThreadDisplayState(nextDisplay);
        persistQuestionThreadDisplay(nextDisplay);
    }, []);

    return {
        questionThreadDisplay,
        setQuestionThreadDisplay,
    };
}
