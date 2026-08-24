export const FIVE_PIXELS_SYNC_VALUES = ["local", "api", "artemis"];
export function isRemoteLoginMethod(method) {
    return method === "api" || method === "artemis";
}
export function resolveFivePixelsSync(sync) {
    return sync && FIVE_PIXELS_SYNC_VALUES.includes(sync) ? sync : "local";
}
//# sourceMappingURL=loginMethod.js.map