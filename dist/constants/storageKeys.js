export const REPORTS_STORAGE_KEY = "stitchable:reports:v1";
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
//# sourceMappingURL=storageKeys.js.map