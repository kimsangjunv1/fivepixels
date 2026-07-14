import { useCallback, useEffect, useState } from "react";
import { getSelfProfileStorageKey } from "@/constants/storageKeys.js";

export type SelfProfile = {
    name: string;
    authorId: string;
    completed: boolean;
};

export function readSelfProfile(projectId: string, environment: string | undefined): SelfProfile | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(getSelfProfileStorageKey(projectId, environment));

        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<SelfProfile>;

        if (typeof parsed.completed !== "boolean") {
            return null;
        }

        return {
            name: typeof parsed.name === "string" ? parsed.name : "",
            authorId: typeof parsed.authorId === "string" ? parsed.authorId : "",
            completed: parsed.completed,
        };
    } catch {
        return null;
    }
}

function persistSelfProfile(projectId: string, environment: string | undefined, profile: SelfProfile) {
    try {
        window.localStorage.setItem(getSelfProfileStorageKey(projectId, environment), JSON.stringify(profile));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function useSelfProfile(projectId: string, environment: string | undefined) {
    const [selfProfile, setSelfProfileState] = useState<SelfProfile | null>(() => readSelfProfile(projectId, environment));

    useEffect(() => {
        const sync = () => {
            setSelfProfileState(readSelfProfile(projectId, environment));
        };

        sync();
        window.addEventListener("focus", sync);
        window.addEventListener("storage", sync);
        document.addEventListener("visibilitychange", sync);

        return () => {
            window.removeEventListener("focus", sync);
            window.removeEventListener("storage", sync);
            document.removeEventListener("visibilitychange", sync);
        };
    }, [environment, projectId]);

    const saveSelfProfile = useCallback(
        (profile: SelfProfile) => {
            setSelfProfileState(profile);
            persistSelfProfile(projectId, environment, profile);
        },
        [environment, projectId],
    );

    const markOnboardingComplete = useCallback(() => {
        const next: SelfProfile = { name: selfProfile?.name ?? "", authorId: selfProfile?.authorId ?? "", completed: true };
        setSelfProfileState(next);
        persistSelfProfile(projectId, environment, next);
    }, [environment, projectId, selfProfile?.authorId, selfProfile?.name]);

    return {
        selfProfile,
        saveSelfProfile,
        markOnboardingComplete,
    };
}
