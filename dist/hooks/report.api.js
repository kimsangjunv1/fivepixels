export async function listReports(adapter, pathname) {
    return adapter.list({ pathname });
}
export async function createReport(adapter, payload) {
    return adapter.create(payload);
}
export async function updateReport(adapter, id, payload) {
    return adapter.update(id, payload);
}
export async function deleteReport(adapter, id) {
    if (!adapter.remove) {
        throw new Error("onDelete가 없어서 삭제할 수 없어요.");
    }
    await adapter.remove(id);
}
//# sourceMappingURL=report.api.js.map