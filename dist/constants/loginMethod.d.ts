export declare const FIVE_PIXELS_SYNC_VALUES: readonly ["local", "api", "artemis"];
export type FivePixelsSync = (typeof FIVE_PIXELS_SYNC_VALUES)[number];
/** @deprecated Prefer `FIVE_PIXELS_SYNC_VALUES` / `FivePixelsSync`. */
export declare const LOGIN_METHOD_VALUES: readonly ["local", "api", "artemis"];
/** @deprecated Prefer `FivePixelsSync`. */
export type LoginMethod = FivePixelsSync;
export declare function isRemoteLoginMethod(method: FivePixelsSync | null | undefined): method is "api" | "artemis";
export declare function resolveFivePixelsSync(sync: FivePixelsSync | null | undefined): FivePixelsSync;
//# sourceMappingURL=loginMethod.d.ts.map