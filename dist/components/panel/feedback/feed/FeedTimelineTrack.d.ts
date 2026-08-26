import type { ReactNode } from "react";
type FeedTimelineTrackProps = {
    children: ReactNode;
    className?: string;
};
/**
 * Continuous main spine for the feed layout.
 * Nested L-branches stay on each nested row; this track keeps the root rail unbroken
 * through comments, questions, assignee events, and the final history item.
 */
export declare function FeedTimelineTrack({ children, className }: FeedTimelineTrackProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedTimelineTrack.d.ts.map