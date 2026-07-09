import type { ReportFeedback } from "../types/report.js";
export declare const FEEDBACK_DEEP_LINK_FLAG = "fivepixels";
export declare const FEEDBACK_DEEP_LINK_TARGET = "feedback";
export declare const FEEDBACK_DEEP_LINK_ID_PARAM = "idx";
export type FeedbackDeepLink = {
    feedbackId: string;
};
export declare function parseFeedbackDeepLink(search?: string): FeedbackDeepLink | null;
export declare function buildFeedbackShareUrl(report: Pick<ReportFeedback, "id" | "pathname">, origin?: string): string;
export declare function clearFeedbackDeepLinkFromUrl(): void;
//# sourceMappingURL=feedbackDeepLink.d.ts.map