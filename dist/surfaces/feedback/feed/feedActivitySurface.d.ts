import type { ReportReplyStatus } from "../../../shared/types/report.js";
export type FeedActivityTone = "resolved" | "denied" | "assignee" | "recheck" | "suggested" | "neutral";
export declare function getFeedActivitySurfaceClass(tone: FeedActivityTone): string;
export declare function getFeedSpineNodeSurfaceClass(tone: FeedActivityTone): string;
export declare function resolveFeedActivityTone(status: ReportReplyStatus | "detached"): FeedActivityTone;
//# sourceMappingURL=feedActivitySurface.d.ts.map