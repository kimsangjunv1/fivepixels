import type { ReportFeedback } from "../types/report.js";
export declare function formatFeedbackCaseId(fcNumber: number): string;
export declare function getFeedbackCaseId(report: Pick<ReportFeedback, "fc_number">): string | null;
export declare function getMaxFcNumber(reports: Array<Pick<ReportFeedback, "fc_number">>): number;
export declare function allocateNextFcNumber(reports: Array<Pick<ReportFeedback, "fc_number">>): number;
export declare function backfillFcNumbers(reports: ReportFeedback[]): ReportFeedback[];
//# sourceMappingURL=feedbackCaseId.d.ts.map