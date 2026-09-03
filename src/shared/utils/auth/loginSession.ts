import { FIVE_PIXELS_SYNC_VALUES, type FivePixelsSync } from "@/shared/constants/loginMethod.js";
import { getLoginMethodStorageKey, getRemoteAuthSessionStorageKey } from "@/shared/constants/storageKeys.js";
import type { ReportAuthUser } from "@/shared/types/report.js";

export type RemoteAuthSession = {
    method: "api" | "artemis";
    user: ReportAuthUser;
};

function readJson(key: string): unknown {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeJson(key: string, value: unknown) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

function removeKey(key: string) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.removeItem(key);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function readLoginMethod(projectId: string, environment?: string): FivePixelsSync | null {
    const value = readJson(getLoginMethodStorageKey(projectId, environment));

    return typeof value === "string" && FIVE_PIXELS_SYNC_VALUES.includes(value as FivePixelsSync) ? (value as FivePixelsSync) : null;
}

export function saveLoginMethod(projectId: string, environment: string | undefined, method: FivePixelsSync) {
    writeJson(getLoginMethodStorageKey(projectId, environment), method);
}

export function readRemoteAuthSession(projectId: string, environment?: string): RemoteAuthSession | null {
    const parsed = readJson(getRemoteAuthSessionStorageKey(projectId, environment));

    if (!parsed || typeof parsed !== "object") {
        return null;
    }

    const session = parsed as Partial<RemoteAuthSession>;
    const method = session.method;
    const user = session.user;

    if ((method !== "api" && method !== "artemis") || !user || typeof user !== "object") {
        return null;
    }

    if (typeof user.id !== "string" || typeof user.name !== "string") {
        return null;
    }

    return {
        method,
        user: {
            id: user.id,
            name: user.name,
            email: typeof user.email === "string" ? user.email : undefined,
        },
    };
}

export function saveRemoteAuthSession(projectId: string, environment: string | undefined, session: RemoteAuthSession) {
    writeJson(getRemoteAuthSessionStorageKey(projectId, environment), session);
}

export function clearRemoteAuthSession(projectId: string, environment?: string) {
    removeKey(getRemoteAuthSessionStorageKey(projectId, environment));
}
