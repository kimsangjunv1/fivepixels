import type { FeedbackDisplayStatus } from "../constants/feedbackStatus.js";
import type { ReportFeedback, ReportField, ReportPanelBootstrapResult, ReportPanelStats } from "../types/report.js";
export type RouteDetailsFieldCount = {
    key: string;
    label: string;
    type: ReportField["type"];
    count: number;
};
export type RouteDetailsSummary = {
    pathname: string;
    statusRows: Array<{
        status: FeedbackDisplayStatus;
        all: number;
        today: number;
    }>;
    fieldCounts: RouteDetailsFieldCount[];
};
export declare function buildPanelStats(reports: ReportFeedback[]): ReportPanelStats;
export declare function buildRouteDetailsSummary(reports: ReportFeedback[], fields: ReportField[], pathname: string): RouteDetailsSummary;
export declare function buildPanelBootstrapFromReports(reports: ReportFeedback[], fields: ReportField[], pathname: string): ReportPanelBootstrapResult;
//# sourceMappingURL=panelBootstrap.d.ts.map