import type { ReportFeedback } from "../../types/report.js";
import { getFeedbackDisplayStatus } from "../../utils/feedback/feedbackThread.js";
/** Prefer all-page reports when list scope is "all" or an all-page list is already loaded. */
export declare function resolveExperimentalListSource(reports: ReportFeedback[], allPageReports: ReportFeedback[], listScope: string): ReportFeedback[];
export declare function getCaseCount(report: ReportFeedback): number;
export declare function filterMyTasks(reports: ReportFeedback[], actorName: string | null): ReportFeedback[];
export declare function filterNeedsAttention(reports: ReportFeedback[]): ReportFeedback[];
export declare function filterTodayDigest(reports: ReportFeedback[], now?: Date): ReportFeedback[];
export type PageBriefSummary = {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    topStatuses: {
        status: ReturnType<typeof getFeedbackDisplayStatus>;
        count: number;
    }[];
};
export declare function buildPageBriefSummary(reports: ReportFeedback[]): PageBriefSummary;
export type ProjectHealthSummary = {
    total: number;
    open: number;
    resolved: number;
    completionRate: number | null;
    todayNew: number;
    gitIssued: number;
    errors: number;
    recheck: number;
};
export declare function buildProjectHealthSummary(reports: ReportFeedback[], now?: Date): ProjectHealthSummary;
//# sourceMappingURL=experimentalPanelTabs.d.ts.map