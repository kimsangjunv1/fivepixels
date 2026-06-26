import type { ReportFeedback, ReportStatus } from "@/types/report.js";
export declare function hasReply(report: ReportFeedback): boolean;
export declare function getReplyStatusTone(hasCompletedReply: boolean): {
    backgroundColor: string;
    color: string;
};
export declare function getMarkerColor(report: ReportFeedback): string;
export declare function getStatusTone(status: ReportStatus): {
    backgroundColor: string;
    color: string;
};
//# sourceMappingURL=reportVisual.d.ts.map