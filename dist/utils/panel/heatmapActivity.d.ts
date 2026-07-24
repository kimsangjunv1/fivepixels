import type { ReportLocale } from "../../i18n/types.js";
import type { ReportActivitySummaryParams, ReportActivitySummaryResult, ReportFeedback } from "../../types/report.js";
import type { HeatmapActorScope, HeatmapMetric, HeatmapViewMode } from "../../types/report-ui.js";
export type HeatmapCell = {
    dateKey: string | null;
    weekIndex: number;
    dayOfWeek: number;
    count: number;
    inRange: boolean;
};
export type HeatmapWeekLabel = {
    weekIndex: number;
    label: string;
};
export type HeatmapYearMonthBucket = {
    monthKey: string;
    monthIndex: number;
    count: number;
};
export type HeatmapYearSummary = {
    buckets: HeatmapYearMonthBucket[];
    maxCount: number;
    totalCount: number;
};
export type HeatmapGrid = {
    cells: HeatmapCell[];
    weekLabels: HeatmapWeekLabel[];
    totalWeeks: number;
    maxCount: number;
    totalCount: number;
};
export declare function toDateKey(date: Date): string;
export declare function toMonthKey(date: Date): string;
export declare function parseMonthKey(monthKey: string): {
    year: number;
    month: number;
};
export declare function shiftMonthKey(monthKey: string, delta: number): string;
export declare function compareMonthKeys(left: string, right: string): number;
export declare function formatHeatmapMonthLabel(monthKey: string, locale: ReportLocale): string;
export declare function startOfLocalDay(date: Date): Date;
export declare function getHeatmapCellDelay(weekIndex: number, dayOfWeek: number, _totalWeeks: number, staggerMs?: number): number;
export declare function getHeatmapCellMaxDelay(totalWeeks: number, staggerMs?: number): number;
export declare function getHeatmapEntranceDuration(totalWeeks: number, staggerMs?: number, cellDurationMs?: number): number;
export declare function countHeatmapActivity(reports: ReportFeedback[], options: {
    actorScope: HeatmapActorScope;
    metric: HeatmapMetric;
    actorName?: string | null;
}): Map<string, number>;
export declare function buildHeatmapGrid(reports: ReportFeedback[], options: {
    monthKey: string;
    actorScope: HeatmapActorScope;
    metric: HeatmapMetric;
    viewMode: HeatmapViewMode;
    actorName?: string | null;
}): HeatmapGrid;
export declare function formatShortMonthLabel(monthIndex: number, locale: ReportLocale): string;
export declare function buildYearMonthSummary(reports: ReportFeedback[], options: {
    year: number;
    actorScope: HeatmapActorScope;
    metric: HeatmapMetric;
    actorName?: string | null;
}): HeatmapYearSummary;
export declare function buildActivitySummaryFromReports(reports: ReportFeedback[], params: ReportActivitySummaryParams): ReportActivitySummaryResult;
export declare function getYearMonthCellDelay(monthIndex: number, staggerMs?: number): number;
export declare function getYearEntranceDuration(staggerMs?: number, cellDurationMs?: number): number;
export declare function resolveHeatmapLevel(count: number, maxCount: number): 2 | 0 | 1 | 3 | 4;
//# sourceMappingURL=heatmapActivity.d.ts.map