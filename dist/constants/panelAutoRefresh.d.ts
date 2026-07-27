export declare const PANEL_AUTO_REFRESH_INTERVAL_MINUTES: readonly [0, 1, 3, 5, 10];
export type PanelAutoRefreshIntervalMinutes = (typeof PANEL_AUTO_REFRESH_INTERVAL_MINUTES)[number];
export declare const DEFAULT_PANEL_AUTO_REFRESH_INTERVAL_MINUTES: PanelAutoRefreshIntervalMinutes;
export declare const PANEL_AUTO_REFRESH_HIDDEN_RESET_MS = 30000;
export declare const PANEL_AUTO_REFRESH_STORAGE_KEY = "fivepixels:panel-auto-refresh-interval";
export declare function isPanelAutoRefreshIntervalMinutes(value: unknown): value is PanelAutoRefreshIntervalMinutes;
//# sourceMappingURL=panelAutoRefresh.d.ts.map