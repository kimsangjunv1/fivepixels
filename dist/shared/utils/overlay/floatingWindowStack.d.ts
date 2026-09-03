/** Always above floating pin/device windows so the control panel is never covered. */
export declare const PANEL_LAYER_Z_INDEX = 1001000;
/** Bump global layer so the latest focused floating window sits above peers. */
export declare function claimFloatingWindowZIndex(base?: number): number;
export declare function getFloatingWindowZBase(): number;
//# sourceMappingURL=floatingWindowStack.d.ts.map