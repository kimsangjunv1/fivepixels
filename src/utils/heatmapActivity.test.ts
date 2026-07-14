import { describe, expect, it } from "vitest";
import type { ReportFeedback } from "@/types/report.js";
import {
    buildHeatmapGrid,
    buildYearMonthSummary,
    compareMonthKeys,
    countHeatmapActivity,
    formatHeatmapMonthLabel,
    getHeatmapCellDelay,
    resolveHeatmapLevel,
    shiftMonthKey,
    toDateKey,
    toMonthKey,
} from "./heatmapActivity.js";

function createFeedback(overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "created_at">): ReportFeedback {
    return {
        id: overrides.id ?? "feedback-1",
        pathname: overrides.pathname ?? "/dashboard",
        report_id: overrides.report_id ?? "report-1",
        report_type: overrides.report_type ?? "item",
        cases: overrides.cases ?? [],
        status: overrides.status ?? "open",
        field_values: overrides.field_values ?? {},
        position: overrides.position ?? {
            target: null,
            viewport: { x: 0, y: 0, width: 100, height: 100 },
            scrollY: 0,
            anchor: null,
        },
        created_at: overrides.created_at,
        author_name: overrides.author_name,
        replies: overrides.replies,
    };
}

describe("heatmapActivity", () => {
    it("groups created feedback by local date", () => {
        const counts = countHeatmapActivity(
            [
                createFeedback({ created_at: "2026-05-28T01:00:00.000Z" }),
                createFeedback({ id: "feedback-2", created_at: "2026-05-28T12:00:00.000Z" }),
                createFeedback({ id: "feedback-3", created_at: "2026-05-29T12:00:00.000Z" }),
            ],
            { actorScope: "team", metric: "created" },
        );

        expect(counts.get("2026-05-28")).toBe(2);
        expect(counts.get("2026-05-29")).toBe(1);
    });

    it("filters personal created activity", () => {
        const counts = countHeatmapActivity(
            [
                createFeedback({ created_at: "2026-05-28T12:00:00.000Z", author_name: "Kim" }),
                createFeedback({ id: "feedback-2", created_at: "2026-05-28T13:00:00.000Z", author_name: "Lee" }),
            ],
            { actorScope: "me", metric: "created", actorName: "Kim" },
        );

        expect(counts.get("2026-05-28")).toBe(1);
    });

    it("delays animation as a diagonal wave from top-left to bottom-right", () => {
        expect(getHeatmapCellDelay(0, 0, 11, 16)).toBe(0);
        expect(getHeatmapCellDelay(1, 0, 11, 16)).toBe(getHeatmapCellDelay(0, 1, 11, 16));
        expect(getHeatmapCellDelay(10, 6, 11, 16)).toBeGreaterThan(getHeatmapCellDelay(0, 0, 11, 16));
    });

    it("builds a monthly grid with cumulative totals", () => {
        const grid = buildHeatmapGrid(
            [createFeedback({ created_at: "2026-05-28T12:00:00.000Z" }), createFeedback({ id: "feedback-2", created_at: "2026-05-29T12:00:00.000Z" })],
            {
                monthKey: "2026-05",
                actorScope: "team",
                metric: "created",
                viewMode: "cumulative",
            },
        );

        const may28 = grid.cells.find((cell) => cell.dateKey === "2026-05-28");
        const may29 = grid.cells.find((cell) => cell.dateKey === "2026-05-29");

        expect(may28?.count).toBe(1);
        expect(may29?.count).toBe(2);
        expect(grid.totalCount).toBe(2);
        expect(grid.totalWeeks).toBeGreaterThanOrEqual(4);
        expect(grid.totalWeeks).toBeLessThanOrEqual(6);
    });

    it("builds a yearly month summary", () => {
        const summary = buildYearMonthSummary(
            [
                createFeedback({ created_at: "2026-05-28T12:00:00.000Z" }),
                createFeedback({ id: "feedback-2", created_at: "2026-07-01T12:00:00.000Z" }),
            ],
            {
                year: 2026,
                actorScope: "team",
                metric: "created",
            },
        );

        expect(summary.buckets.find((bucket) => bucket.monthKey === "2026-05")?.count).toBe(1);
        expect(summary.buckets.find((bucket) => bucket.monthKey === "2026-07")?.count).toBe(1);
        expect(summary.totalCount).toBe(2);
    });

    it("only counts activity inside the selected month", () => {
        const grid = buildHeatmapGrid([createFeedback({ created_at: "2026-07-01T12:00:00.000Z" })], {
            monthKey: "2026-07",
            actorScope: "team",
            metric: "created",
            viewMode: "daily",
        });

        const julyCell = grid.cells.find((cell) => cell.dateKey === "2026-07-01");
        const paddingCell = grid.cells.find((cell) => cell.dateKey === "2026-06-30");

        expect(julyCell?.inRange).toBe(true);
        expect(julyCell?.count).toBe(1);
        expect(paddingCell?.inRange).toBe(false);
        expect(paddingCell?.count).toBe(0);
    });

    it("shifts and compares month keys", () => {
        expect(shiftMonthKey("2026-07", -1)).toBe("2026-06");
        expect(shiftMonthKey("2026-12", 1)).toBe("2027-01");
        expect(compareMonthKeys("2026-06", "2026-07")).toBeLessThan(0);
    });

    it("formats month navigation labels", () => {
        expect(formatHeatmapMonthLabel("2026-07", "ko")).toBe("2026년 7월");
        expect(formatHeatmapMonthLabel("2026-07", "en")).toBe("July 2026");
    });

    it("maps intensity levels from relative counts", () => {
        expect(resolveHeatmapLevel(0, 10)).toBe(0);
        expect(resolveHeatmapLevel(2, 10)).toBe(1);
        expect(resolveHeatmapLevel(10, 10)).toBe(4);
    });

    it("formats stable date keys", () => {
        expect(toDateKey(new Date("2026-01-05T15:00:00"))).toBe("2026-01-05");
        expect(toMonthKey(new Date("2026-01-05T15:00:00"))).toBe("2026-01");
    });
});
