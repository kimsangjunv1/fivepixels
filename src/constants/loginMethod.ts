export const FIVE_PIXELS_SYNC_VALUES = ["local", "api", "artemis"] as const;
export type FivePixelsSync = (typeof FIVE_PIXELS_SYNC_VALUES)[number];

/** @deprecated Prefer `FIVE_PIXELS_SYNC_VALUES` / `FivePixelsSync`. */
export const LOGIN_METHOD_VALUES = FIVE_PIXELS_SYNC_VALUES;
/** @deprecated Prefer `FivePixelsSync`. */
export type LoginMethod = FivePixelsSync;

export function isRemoteLoginMethod(method: FivePixelsSync | null | undefined): method is "api" | "artemis" {
    return method === "api" || method === "artemis";
}

export function resolveFivePixelsSync(sync: FivePixelsSync | null | undefined): FivePixelsSync {
    return sync && FIVE_PIXELS_SYNC_VALUES.includes(sync) ? sync : "local";
}
