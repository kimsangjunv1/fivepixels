import { PANEL_AUTO_REFRESH_HIDDEN_RESET_MS } from "../../../shared/constants/panelAutoRefresh.js";
export function resolvePanelAutoRefreshVisibilityAction(hiddenDurationMs, cycleDue, resetThresholdMs = PANEL_AUTO_REFRESH_HIDDEN_RESET_MS) {
    if (hiddenDurationMs >= resetThresholdMs) {
        return "refetch-and-reset";
    }
    if (cycleDue) {
        return "refetch-and-reset";
    }
    return "continue";
}
/** Elapsed ratio toward the next refresh (0–1). Uses wall-clock from cycle start. */
export function resolvePanelAutoRefreshProgress(cycleStartedAt, intervalMs, now = Date.now()) {
    if (intervalMs <= 0) {
        return 0;
    }
    return Math.min(1, Math.max(0, (now - cycleStartedAt) / intervalMs));
}
export function resolvePanelAutoRefreshRemainingMs(cycleStartedAt, intervalMs, now = Date.now()) {
    if (intervalMs <= 0) {
        return 0;
    }
    return Math.max(0, intervalMs - (now - cycleStartedAt));
}
/** Formats remaining time as `MM:SS` for the auto-refresh pill. */
export function formatPanelAutoRefreshCountdown(remainingMs) {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
export function isPanelAutoRefreshCycleDue(cycleStartedAt, intervalMs, now = Date.now()) {
    if (intervalMs <= 0) {
        return false;
    }
    return now - cycleStartedAt >= intervalMs;
}
//# sourceMappingURL=panelAutoRefresh.js.map