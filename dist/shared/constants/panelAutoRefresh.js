export const PANEL_AUTO_REFRESH_INTERVAL_MINUTES = [0, 1, 3, 5, 10];
export const DEFAULT_PANEL_AUTO_REFRESH_INTERVAL_MINUTES = 0;
export const PANEL_AUTO_REFRESH_HIDDEN_RESET_MS = 30000;
export const PANEL_AUTO_REFRESH_STORAGE_KEY = "fivepixels:panel-auto-refresh-interval";
export function isPanelAutoRefreshIntervalMinutes(value) {
    return typeof value === "number" && PANEL_AUTO_REFRESH_INTERVAL_MINUTES.includes(value);
}
//# sourceMappingURL=panelAutoRefresh.js.map