export async function listReports(adapter, pathname) {
    return adapter.list({ pathname });
}
export async function createReport(adapter, payload) {
    return adapter.create(payload);
}
export async function updateReport(adapter, id, payload) {
    return adapter.update(id, payload);
}
//# sourceMappingURL=report.api.js.map