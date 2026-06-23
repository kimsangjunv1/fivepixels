import type { ReportFeedback } from "../types/report.js";
export declare const LOCATE_PULSE_DURATION_MS = 2400;
export declare function getFeedbackTargetElement(report: Pick<ReportFeedback, "report_id" | "report_type">): HTMLElement | null;
export declare function scrollToFeedbackTarget(report: Pick<ReportFeedback, "report_id" | "report_type" | "scroll_y">): {
    foundElement: true;
    targetElement: HTMLElement;
} | {
    foundElement: false;
    targetElement: null;
};
//# sourceMappingURL=locateFeedback.d.ts.map