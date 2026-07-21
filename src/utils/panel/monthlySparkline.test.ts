import { describe, expect, it } from "vitest";
import type { ReportFeedback } from "@/types/report.js";
import { buildMonthlySparkline, resolveSparklineBarHeight, resolveSparklineBarTone } from "./monthlySparkline.js";

function createFeedback(overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "created_at">): ReportFeedback {
    return {
        id: "feedback-1",
        report_id: "report-1",
        report_type: "item",
        pathname: "/edgecase",
        status: "open",
        created_at: overrides.created_at,
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

describe("monthlySparkline", () => {
    it("builds daily buckets for the current month", () => {
        const referenceDate = new Date(2026, 6, 7);
        const dayKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}-${String(referenceDate.getDate()).padStart(2, "0")}`;
        const createdAt = new Date(2026, 6, 7, 12, 0, 0).toISOString();
        const sparkline = buildMonthlySparkline(
            [createFeedback({ created_at: createdAt }), createFeedback({ id: "feedback-2", created_at: createdAt })],
            referenceDate,
        );

        const targetDay = sparkline.buckets.find((bucket) => bucket.dateKey === dayKey);

        expect(sparkline.buckets).toHaveLength(31);
        expect(targetDay?.count).toBe(2);
        expect(targetDay?.stats.found).toBe(2);
        expect(sparkline.maxCount).toBe(2);
    });

    it("resolves bar height and tone", () => {
        expect(resolveSparklineBarHeight(0, 5)).toBe(0);
        expect(resolveSparklineBarHeight(2, 5)).toBeGreaterThanOrEqual(20);
        expect(resolveSparklineBarTone(5, 5)).toBe("peak");
        expect(resolveSparklineBarTone(2, 5)).toBe("muted");
    });
});
