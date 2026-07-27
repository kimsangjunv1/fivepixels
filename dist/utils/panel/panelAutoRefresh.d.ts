export type PanelAutoRefreshVisibilityAction = "continue" | "refetch-and-reset";
export declare function resolvePanelAutoRefreshVisibilityAction(hiddenDurationMs: number, cycleDue: boolean, resetThresholdMs?: number): PanelAutoRefreshVisibilityAction;
/** Elapsed ratio toward the next refresh (0–1). Uses wall-clock from cycle start. */
export declare function resolvePanelAutoRefreshProgress(cycleStartedAt: number, intervalMs: number, now?: number): number;
export declare function resolvePanelAutoRefreshRemainingMs(cycleStartedAt: number, intervalMs: number, now?: number): number;
/** Formats remaining time as `MM:SS` for the auto-refresh pill. */
export declare function formatPanelAutoRefreshCountdown(remainingMs: number): string;
export declare function isPanelAutoRefreshCycleDue(cycleStartedAt: number, intervalMs: number, now?: number): boolean;
//# sourceMappingURL=panelAutoRefresh.d.ts.map