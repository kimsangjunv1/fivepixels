import type { ReportFeedback } from "../types/report.js";
import type { ReportPanelStats } from "../types/report.js";
export type DailySparklineBucket = {
    dateKey: string;
    day: number;
    count: number;
    stats: ReportPanelStats;
};
export type MonthlySparkline = {
    monthKey: string;
    monthLabel: string;
    buckets: DailySparklineBucket[];
    maxCount: number;
};
export declare function buildMonthlySparkline(reports: ReportFeedback[], referenceDate?: Date): MonthlySparkline;
export declare function resolveSparklineBarHeight(count: number, maxCount: number): number;
export declare function resolveSparklineBarTone(count: number, maxCount: number): "empty" | "peak" | "muted";
//# sourceMappingURL=monthlySparkline.d.ts.map