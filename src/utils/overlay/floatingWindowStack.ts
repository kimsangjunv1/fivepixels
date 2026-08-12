const FLOATING_WINDOW_Z_BASE = 1_000_002;
const FLOATING_WINDOW_Z_CEILING = 1_000_900;

let nextFloatingWindowZIndex = FLOATING_WINDOW_Z_BASE;

/** Bump global layer so the latest focused floating window sits above peers. */
export function claimFloatingWindowZIndex(base = FLOATING_WINDOW_Z_BASE): number {
    nextFloatingWindowZIndex += 1;

    if (nextFloatingWindowZIndex > FLOATING_WINDOW_Z_CEILING) {
        nextFloatingWindowZIndex = base + 1;
    }

    return Math.max(base, nextFloatingWindowZIndex);
}

export function getFloatingWindowZBase() {
    return FLOATING_WINDOW_Z_BASE;
}
