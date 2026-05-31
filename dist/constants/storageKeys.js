export const REPORTS_STORAGE_KEY = "stitchable:reports:v1";
export function getReportsStorageKey(projectId, environment) {
    const base = `${REPORTS_STORAGE_KEY}:${projectId}`;
    return environment ? `${base}:${environment}` : base;
}
//# sourceMappingURL=storageKeys.js.map