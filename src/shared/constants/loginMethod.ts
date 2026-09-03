export const FIVE_PIXELS_SYNC_VALUES = ["local", "api", "artemis"] as const;
export type FivePixelsSync = (typeof FIVE_PIXELS_SYNC_VALUES)[number];

export function isRemoteLoginMethod(method: FivePixelsSync | null | undefined): method is "api" | "artemis" {
    return method === "api" || method === "artemis";
}

export function resolveFivePixelsSync(sync: FivePixelsSync | null | undefined): FivePixelsSync {
    return sync && FIVE_PIXELS_SYNC_VALUES.includes(sync) ? sync : "local";
}

/**
 * Whether the panel requires company/SSO login before use.
 * - `local`: always false
 * - `api` / `artemis`: defaults to true (backward compatible); pass `false` for personal-key identity with remote storage
 */
export function resolveRequireAuth(sync: FivePixelsSync, requireAuth?: boolean): boolean {
    if (sync === "local") {
        return false;
    }

    if (typeof requireAuth === "boolean") {
        return requireAuth;
    }

    return true;
}

/** Remote storage sync that still uses the server login onboarding path. */
export function usesRemoteAuthLogin(sync: FivePixelsSync | null | undefined, requireAuth: boolean): boolean {
    return isRemoteLoginMethod(sync) && requireAuth;
}
