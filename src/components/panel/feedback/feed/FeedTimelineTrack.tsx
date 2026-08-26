import type { ReactNode } from "react";
import { FEED_RAIL_WIDTH } from "./FeedTimelineRow.js";

type FeedTimelineTrackProps = {
    children: ReactNode;
    className?: string;
};

/**
 * Continuous main spine for the feed layout.
 * Nested L-branches stay on each nested row; this track keeps the root rail unbroken
 * through comments, questions, assignee events, and the final history item.
 */
export function FeedTimelineTrack({ children, className = "" }: FeedTimelineTrackProps) {
    return (
        <div className={`relative ${className}`}>
            <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 top-0 w-px bg-[var(--adaptive-black300)]"
                style={{ left: FEED_RAIL_WIDTH / 2, transform: "translateX(-50%)" }}
            />
            {children}
        </div>
    );
}
