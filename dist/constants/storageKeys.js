export const REPORTS_STORAGE_KEY = "stitchable:reports:v1";
export const PERSONAL_KEY_STORAGE_KEY = "stitchable:personal-key:v1";
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
//# sourceMappingURL=storageKeys.js.map