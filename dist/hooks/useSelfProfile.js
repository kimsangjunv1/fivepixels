import { useCallback, useEffect, useState } from "react";
import { getSelfProfileStorageKey } from "../constants/storageKeys.js";
export function readSelfProfile(projectId, environment) {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(getSelfProfileStorageKey(projectId, environment));
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (typeof parsed.completed !== "boolean") {
            return null;
        }
        return {
            name: typeof parsed.name === "string" ? parsed.name : "",
            authorId: typeof parsed.authorId === "string" ? parsed.authorId : "",
            completed: parsed.completed,
        };
    }
    catch {
        return null;
    }
}
function persistSelfProfile(projectId, environment, profile) {
    try {
        window.localStorage.setItem(getSelfProfileStorageKey(projectId, environment), JSON.stringify(profile));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function useSelfProfile(projectId, environment) {
    const [selfProfile, setSelfProfileState] = useState(() => readSelfProfile(projectId, environment));
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
    const saveSelfProfile = useCallback((profile) => {
        setSelfProfileState(profile);
        persistSelfProfile(projectId, environment, profile);
    }, [environment, projectId]);
    const markOnboardingComplete = useCallback(() => {
        const next = { name: selfProfile?.name ?? "", authorId: selfProfile?.authorId ?? "", completed: true };
        setSelfProfileState(next);
        persistSelfProfile(projectId, environment, next);
    }, [environment, projectId, selfProfile?.authorId, selfProfile?.name]);
    return {
        selfProfile,
        saveSelfProfile,
        markOnboardingComplete,
    };
}
//# sourceMappingURL=useSelfProfile.js.map