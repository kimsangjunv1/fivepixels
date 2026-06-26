import type { ReportFeedback } from "../types/report.js";
export { isFeedbackTargetVisible } from "./dom.js";
export declare const LOCATE_PULSE_DURATION_MS = 2400;
export declare const TARGET_REVEAL_RESYNC_DELAY_MS = 50;
export declare function getFeedbackTargetElement(report: Pick<ReportFeedback, "report_id" | "report_type">): HTMLElement | null;
export declare function getFeedbackAnchorElement(report: Pick<ReportFeedback, "position">): HTMLElement | null;
export declare function isFeedbackTargetDetached(report: Pick<ReportFeedback, "report_id" | "report_type">): boolean;
export declare function waitForTargetRevealResync(): Promise<void>;
export declare function scrollToFeedbackTarget(report: Pick<ReportFeedback, "report_id" | "report_type" | "position">): {
    foundElement: true;
    targetElement: HTMLElement;
} | {
    foundElement: false;
    targetElement: null;
};
//# sourceMappingURL=locateFeedback.d.ts.map