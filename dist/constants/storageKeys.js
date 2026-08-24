export const REPORTS_STORAGE_KEY = "fivepixels:reports:v1";
export const PERSONAL_KEY_STORAGE_KEY = "fivepixels:personal-key:v1";
export const SELF_PROFILE_STORAGE_KEY = "fivepixels:self-profile:v1";
export const LOGIN_METHOD_STORAGE_KEY = "fivepixels:login-method:v1";
export const REMOTE_AUTH_SESSION_STORAGE_KEY = "fivepixels:remote-auth:v1";
export const MINIMIZED_WINDOW_ALIAS_STORAGE_KEY = "fivepixels:minimized-window-alias:v1";
export const ELEMENT_MEMOS_STORAGE_KEY = "fivepixels:element-memos:v1";
export function getReportsStorageKey(projectId, environment, appVersion) {
    const segments = [REPORTS_STORAGE_KEY, projectId];
    if (environment) {
        segments.push(environment);
    }
    if (appVersion) {
        segments.push(appVersion);
    }
    return segments.join(":");
}
export function getPersonalKeyStorageKey(projectId, environment) {
    return [PERSONAL_KEY_STORAGE_KEY, projectId, environment].filter(Boolean).join(":");
}
export function getSelfProfileStorageKey(projectId, environment) {
    return [SELF_PROFILE_STORAGE_KEY, projectId, environment].filter(Boolean).join(":");
}
export function getLoginMethodStorageKey(projectId, environment) {
    return [LOGIN_METHOD_STORAGE_KEY, projectId, environment].filter(Boolean).join(":");
}
export function getRemoteAuthSessionStorageKey(projectId, environment) {
    return [REMOTE_AUTH_SESSION_STORAGE_KEY, projectId, environment].filter(Boolean).join(":");
}
export function getMinimizedWindowAliasStorageKey(projectId) {
    return [MINIMIZED_WINDOW_ALIAS_STORAGE_KEY, projectId].join(":");
}
export function getElementMemosStorageKey(projectId, pathname) {
    return [ELEMENT_MEMOS_STORAGE_KEY, projectId, pathname].join(":");
}
//# sourceMappingURL=storageKeys.js.map