export const REPORTS_STORAGE_KEY = "stitchable:reports:v1";

export function getReportsStorageKey(projectId: string, environment?: string) {
    const base = `${REPORTS_STORAGE_KEY}:${projectId}`;

    return environment ? `${base}:${environment}` : base;
}
