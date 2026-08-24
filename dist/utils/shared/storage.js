import { createUnavailableReportAdapter, hasCustomAdapter, resolveAdapterMissingHandlers, resolveAdapterPersistenceStatus, resolveStorageAdapterFromAdapter, } from "../../utils/adapter/resolveAdapter.js";
export function hasCustomPersistenceAdapter(adapter) {
    return hasCustomAdapter(adapter);
}
export function resolvePersistenceStatus(options) {
    return resolveAdapterPersistenceStatus(options.adapter, options.sync ?? "local");
}
export { createUnavailableReportAdapter };
export function resolveStorageAdapter(options) {
    return resolveStorageAdapterFromAdapter(options);
}
export function resolvePersistenceMissingHandlers(adapter) {
    return resolveAdapterMissingHandlers(adapter);
}
//# sourceMappingURL=storage.js.map