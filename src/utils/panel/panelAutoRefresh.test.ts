import { describe, expect, it } from "vitest";
import {
    formatPanelAutoRefreshCountdown,
    isPanelAutoRefreshCycleDue,
    resolvePanelAutoRefreshProgress,
    resolvePanelAutoRefreshRemainingMs,
    resolvePanelAutoRefreshVisibilityAction,
} from "@/utils/panel/panelAutoRefresh.js";

describe("resolvePanelAutoRefreshVisibilityAction", () => {
    it("continues the timer when returning within the threshold and the cycle is not due", () => {
        expect(resolvePanelAutoRefreshVisibilityAction(10_000, false)).toBe("continue");
    });

    it("refetches and resets when returning within the threshold after the cycle is due", () => {
        expect(resolvePanelAutoRefreshVisibilityAction(10_000, true)).toBe("refetch-and-reset");
    });

    it("refetches and resets when returning after the hidden threshold", () => {
        expect(resolvePanelAutoRefreshVisibilityAction(30_000, false)).toBe("refetch-and-reset");
        expect(resolvePanelAutoRefreshVisibilityAction(45_000, true)).toBe("refetch-and-reset");
    });
});

describe("resolvePanelAutoRefreshProgress", () => {
    it("returns elapsed ratio clamped between 0 and 1", () => {
        const startedAt = 1_000;

        expect(resolvePanelAutoRefreshProgress(startedAt, 60_000, 1_000)).toBe(0);
        expect(resolvePanelAutoRefreshProgress(startedAt, 60_000, 31_000)).toBeCloseTo(0.5);
        expect(resolvePanelAutoRefreshProgress(startedAt, 60_000, 100_000)).toBe(1);
        expect(resolvePanelAutoRefreshProgress(startedAt, 0, 2_000)).toBe(0);
    });
});

describe("resolvePanelAutoRefreshRemainingMs", () => {
    it("returns remaining wall-clock time clamped at zero", () => {
        expect(resolvePanelAutoRefreshRemainingMs(1_000, 60_000, 1_000)).toBe(60_000);
        expect(resolvePanelAutoRefreshRemainingMs(1_000, 60_000, 41_000)).toBe(20_000);
        expect(resolvePanelAutoRefreshRemainingMs(1_000, 60_000, 100_000)).toBe(0);
    });
});

describe("formatPanelAutoRefreshCountdown", () => {
    it("formats remaining milliseconds as MM:SS", () => {
        expect(formatPanelAutoRefreshCountdown(200_000)).toBe("03:20");
        expect(formatPanelAutoRefreshCountdown(60_000)).toBe("01:00");
        expect(formatPanelAutoRefreshCountdown(999)).toBe("00:01");
        expect(formatPanelAutoRefreshCountdown(0)).toBe("00:00");
    });
});

describe("isPanelAutoRefreshCycleDue", () => {
    it("detects when the wall-clock cycle has elapsed", () => {
        expect(isPanelAutoRefreshCycleDue(1_000, 60_000, 60_999)).toBe(false);
        expect(isPanelAutoRefreshCycleDue(1_000, 60_000, 61_000)).toBe(true);
        expect(isPanelAutoRefreshCycleDue(1_000, 0, 61_000)).toBe(false);
    });
});
