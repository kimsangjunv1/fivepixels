export const PANEL_AUTO_REFRESH_INTERVAL_MINUTES = [0, 1, 3, 5, 10] as const;

export type PanelAutoRefreshIntervalMinutes = (typeof PANEL_AUTO_REFRESH_INTERVAL_MINUTES)[number];

export const DEFAULT_PANEL_AUTO_REFRESH_INTERVAL_MINUTES: PanelAutoRefreshIntervalMinutes = 0;

export const PANEL_AUTO_REFRESH_HIDDEN_RESET_MS = 30_000;

export const PANEL_AUTO_REFRESH_STORAGE_KEY = "fivepixels:panel-auto-refresh-interval";

export function isPanelAutoRefreshIntervalMinutes(value: unknown): value is PanelAutoRefreshIntervalMinutes {
    return typeof value === "number" && (PANEL_AUTO_REFRESH_INTERVAL_MINUTES as readonly number[]).includes(value);
}
