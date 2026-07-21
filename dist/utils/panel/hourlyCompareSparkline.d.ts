import type { ReportFeedback } from "../../types/report.js";
export type HourlyCompareBucket = {
    hour: number;
    todayCount: number;
    yesterdayCount: number;
};
export type HourlyCompareSparkline = {
    todayDateKey: string;
    yesterdayDateKey: string;
    currentHour: number;
    buckets: HourlyCompareBucket[];
    maxCount: number;
    todayTotal: number;
    yesterdayTotal: number;
};
export declare function resolveHourlyBarHeightPx(count: number, maxCount: number, maxHeightPx?: number, minHeightPx?: number): number;
export declare function formatHourLabel(hour: number): string;
export declare function buildHourlyCompareSparkline(reports: ReportFeedback[], referenceDate?: Date): HourlyCompareSparkline;
//# sourceMappingURL=hourlyCompareSparkline.d.ts.map