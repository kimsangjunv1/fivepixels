import { FIVE_PIXELS_SYNC_VALUES } from "../../../shared/constants/loginMethod.js";
import { getLoginMethodStorageKey, getRemoteAuthSessionStorageKey } from "../../../shared/constants/storageKeys.js";
function readJson(key) {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function writeJson(key, value) {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
function removeKey(key) {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.removeItem(key);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function readLoginMethod(projectId, environment) {
    const value = readJson(getLoginMethodStorageKey(projectId, environment));
    return typeof value === "string" && FIVE_PIXELS_SYNC_VALUES.includes(value) ? value : null;
}
export function saveLoginMethod(projectId, environment, method) {
    writeJson(getLoginMethodStorageKey(projectId, environment), method);
}
export function readRemoteAuthSession(projectId, environment) {
    const parsed = readJson(getRemoteAuthSessionStorageKey(projectId, environment));
    if (!parsed || typeof parsed !== "object") {
        return null;
    }
    const session = parsed;
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
export function saveRemoteAuthSession(projectId, environment, session) {
    writeJson(getRemoteAuthSessionStorageKey(projectId, environment), session);
}
export function clearRemoteAuthSession(projectId, environment) {
    removeKey(getRemoteAuthSessionStorageKey(projectId, environment));
}
//# sourceMappingURL=loginSession.js.map