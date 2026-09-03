export declare const FIVE_PIXELS_SYNC_VALUES: readonly ["local", "api", "artemis"];
export type FivePixelsSync = (typeof FIVE_PIXELS_SYNC_VALUES)[number];
export declare function isRemoteLoginMethod(method: FivePixelsSync | null | undefined): method is "api" | "artemis";
export declare function resolveFivePixelsSync(sync: FivePixelsSync | null | undefined): FivePixelsSync;
/**
 * Whether the panel requires company/SSO login before use.
 * - `local`: always false
 * - `api` / `artemis`: defaults to true (backward compatible); pass `false` for personal-key identity with remote storage
 */
export declare function resolveRequireAuth(sync: FivePixelsSync, requireAuth?: boolean): boolean;
/** Remote storage sync that still uses the server login onboarding path. */
export declare function usesRemoteAuthLogin(sync: FivePixelsSync | null | undefined, requireAuth: boolean): boolean;
//# sourceMappingURL=loginMethod.d.ts.map