import { getActiveReportMessages } from "../i18n/index.js";
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
        throw new Error(getActiveReportMessages().errors.deleteHandlerMissing);
    }
    await adapter.remove(id);
}
//# sourceMappingURL=report.api.js.map