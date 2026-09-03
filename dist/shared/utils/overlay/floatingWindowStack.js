const FLOATING_WINDOW_Z_BASE = 1000002;
const FLOATING_WINDOW_Z_CEILING = 1000900;
/** Always above floating pin/device windows so the control panel is never covered. */
export const PANEL_LAYER_Z_INDEX = 1001000;
let nextFloatingWindowZIndex = FLOATING_WINDOW_Z_BASE;
/** Bump global layer so the latest focused floating window sits above peers. */
export function claimFloatingWindowZIndex(base = FLOATING_WINDOW_Z_BASE) {
    nextFloatingWindowZIndex += 1;
    if (nextFloatingWindowZIndex > FLOATING_WINDOW_Z_CEILING) {
        nextFloatingWindowZIndex = base + 1;
    }
    return Math.max(base, nextFloatingWindowZIndex);
}
export function getFloatingWindowZBase() {
    return FLOATING_WINDOW_Z_BASE;
}
//# sourceMappingURL=floatingWindowStack.js.map