export const FIVE_PIXELS_SYNC_VALUES = ["local", "api", "artemis"];
/** @deprecated Prefer `FIVE_PIXELS_SYNC_VALUES` / `FivePixelsSync`. */
export const LOGIN_METHOD_VALUES = FIVE_PIXELS_SYNC_VALUES;
export function isRemoteLoginMethod(method) {
    return method === "api" || method === "artemis";
}
export function resolveFivePixelsSync(sync) {
    return sync && FIVE_PIXELS_SYNC_VALUES.includes(sync) ? sync : "local";
}
//# sourceMappingURL=loginMethod.js.map