export const FIVE_PIXELS_SYNC_VALUES = ["local", "api", "artemis"];
export function isRemoteLoginMethod(method) {
    return method === "api" || method === "artemis";
}
export function resolveFivePixelsSync(sync) {
    return sync && FIVE_PIXELS_SYNC_VALUES.includes(sync) ? sync : "local";
}
/**
 * Whether the panel requires company/SSO login before use.
 * - `local`: always false
 * - `api` / `artemis`: defaults to true (backward compatible); pass `false` for personal-key identity with remote storage
 */
export function resolveRequireAuth(sync, requireAuth) {
    if (sync === "local") {
        return false;
    }
    if (typeof requireAuth === "boolean") {
        return requireAuth;
    }
    return true;
}
/** Remote storage sync that still uses the server login onboarding path. */
export function usesRemoteAuthLogin(sync, requireAuth) {
    return isRemoteLoginMethod(sync) && requireAuth;
}
//# sourceMappingURL=loginMethod.js.map