export declare const FIVE_PIXELS_SYNC_VALUES: readonly ["local", "api", "artemis"];
export type FivePixelsSync = (typeof FIVE_PIXELS_SYNC_VALUES)[number];
export declare function isRemoteLoginMethod(method: FivePixelsSync | null | undefined): method is "api" | "artemis";
export declare function resolveFivePixelsSync(sync: FivePixelsSync | null | undefined): FivePixelsSync;
//# sourceMappingURL=loginMethod.d.ts.map