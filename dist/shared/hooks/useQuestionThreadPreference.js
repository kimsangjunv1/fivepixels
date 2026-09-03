import { useCallback, useState } from "react";
const STORAGE_KEY = "fivepixels:question-thread-preference";
function isQuestionThreadDisplay(value) {
    return value === "expanded" || value === "collapsed";
}
function readStoredQuestionThreadDisplay(fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (isQuestionThreadDisplay(stored)) {
            return stored;
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return fallback;
}
function persistQuestionThreadDisplay(display) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, display);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useQuestionThreadPreference(initialDisplay) {
    const [questionThreadDisplay, setQuestionThreadDisplayState] = useState(() => readStoredQuestionThreadDisplay(initialDisplay));
    const setQuestionThreadDisplay = useCallback((nextDisplay) => {
        setQuestionThreadDisplayState(nextDisplay);
        persistQuestionThreadDisplay(nextDisplay);
    }, []);
    return {
        questionThreadDisplay,
        setQuestionThreadDisplay,
    };
}
//# sourceMappingURL=useQuestionThreadPreference.js.map