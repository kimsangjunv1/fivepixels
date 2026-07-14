import { describe, expect, it } from "vitest";
import type { ReportFeedback } from "@/types/report.js";
import { buildHourlyCompareSparkline, formatHourLabel, resolveHourlyBarHeightPx } from "./hourlyCompareSparkline.js";

function createFeedback(overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "created_at" | "id">): ReportFeedback {
    return {
        report_id: "report-1",
        report_type: "item",
        pathname: "/settings",
        status: "open",
        field_values: {},
        cases: [],
        replies: [],
        position: {
            viewport: { width: 1, height: 1 },
            ratio: { x: 0.5, y: 0.5 },
            anchor: null,
        },
        ...overrides,
    };
}

describe("hourlyCompareSparkline", () => {
    it("builds 24 hourly buckets for today and yesterday", () => {
        const referenceDate = new Date(2026, 6, 13, 14, 30, 0);
        const sparkline = buildHourlyCompareSparkline(
            [
                createFeedback({ id: "t1", created_at: new Date(2026, 6, 13, 14, 10, 0).toISOString() }),
                createFeedback({ id: "t2", created_at: new Date(2026, 6, 13, 14, 20, 0).toISOString() }),
                createFeedback({ id: "t3", created_at: new Date(2026, 6, 13, 9, 0, 0).toISOString() }),
                createFeedback({ id: "y1", created_at: new Date(2026, 6, 12, 14, 5, 0).toISOString() }),
                createFeedback({ id: "y2", created_at: new Date(2026, 6, 11, 14, 5, 0).toISOString() }),
            ],
            referenceDate,
        );

        expect(sparkline.buckets).toHaveLength(24);
        expect(sparkline.todayDateKey).toBe("2026-07-13");
        expect(sparkline.yesterdayDateKey).toBe("2026-07-12");
        expect(sparkline.currentHour).toBe(14);
        expect(sparkline.buckets[14]).toEqual({ hour: 14, todayCount: 2, yesterdayCount: 1 });
        expect(sparkline.buckets[9]).toEqual({ hour: 9, todayCount: 1, yesterdayCount: 0 });
        expect(sparkline.todayTotal).toBe(3);
        expect(sparkline.yesterdayTotal).toBe(1);
        expect(sparkline.maxCount).toBe(2);
    });

    it("formats hour labels and bar heights", () => {
        expect(formatHourLabel(0)).toBe("00:00");
        expect(formatHourLabel(14)).toBe("14:00");
        expect(resolveHourlyBarHeightPx(0, 10)).toBe(0);
        expect(resolveHourlyBarHeightPx(5, 10, 40, 3)).toBe(20);
        expect(resolveHourlyBarHeightPx(1, 100, 40, 3)).toBe(3);
    });
});
