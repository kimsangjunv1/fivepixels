import type { MarkerColorPreferences } from "../../../shared/constants/markerAppearance.js";
import type { ReportFeedback, ReportStatus } from "../../../shared/types/report.js";
export declare function hasReply(report: ReportFeedback): boolean;
export declare function getReplyStatusTone(hasCompletedReply: boolean): {
    backgroundColor: string;
    color: string;
};
export declare function getMarkerColor(report: ReportFeedback, colors?: MarkerColorPreferences): string;
export declare function getMarkerDisplayLabel(report: ReportFeedback): string | null;
export declare function hasMarkerReplyIndicator(report: ReportFeedback, replyCount?: number): boolean;
export declare function getStatusTone(status: ReportStatus): {
    backgroundColor: string;
    color: string;
};
//# sourceMappingURL=reportVisual.d.ts.map