import type { ReactNode } from "react";
import type { FeedActivityTone } from "./feedActivitySurface.js";
import { getFeedSpineNodeSurfaceClass } from "./feedActivitySurface.js";

export const FEED_RAIL_WIDTH = 32;
/** Nested replies indent; L-branch connects back to the main track spine. */
export const FEED_NESTED_OFFSET = 20;

export type FeedRowDensity = "comment" | "activity";

type FeedTimelineRowProps = {
    /** Visual node on the vertical spine (avatar or thin icon). */
    node?: ReactNode;
    /** Indent as a nested reply under a parent comment (keeps L-branch). */
    nested?: boolean;
    /** Activity rows stay tight; comments breathe a bit more. */
    density?: FeedRowDensity;
    children: ReactNode;
    className?: string;
};

/**
 * Feed row. Root rows sit on FeedTimelineTrack's continuous spine.
 * Nested rows keep only the L horizontal stem (no nested vertical rail).
 */
export function FeedTimelineRow({
    node,
    nested = false,
    density = "comment",
    children,
    className = "",
}: FeedTimelineRowProps) {
    const bottomPad = density === "activity" ? "pb-[6px]" : "pb-[12px]";
    const nodeCenter = density === "activity" ? 12 : 13;
    const mainSpineX = FEED_RAIL_WIDTH / 2 - FEED_NESTED_OFFSET;
    const branchWidth = FEED_RAIL_WIDTH / 2 - mainSpineX;

    return (
        <div
            className={`relative grid ${bottomPad} ${className}`}
            style={{
                gridTemplateColumns: `${FEED_RAIL_WIDTH}px minmax(0, 1fr)`,
                marginLeft: nested ? FEED_NESTED_OFFSET : undefined,
            }}
        >
            <div className="relative flex items-start justify-center self-stretch">
                {nested ? (
                    <span
                        aria-hidden
                        className="absolute bg-[var(--adaptive-black300)]"
                        style={{
                            left: mainSpineX,
                            top: nodeCenter,
                            width: branchWidth,
                            height: 1,
                        }}
                    />
                ) : null}
                <div
                    data-feed-spine-node="true"
                    className="relative z-[1] flex shrink-0 self-start"
                >
                    {node}
                </div>
            </div>
            <div className={`min-w-0 ${nested ? "pl-[8px]" : "pl-[10px]"}`}>{children}</div>
        </div>
    );
}

type FeedSpineIconProps = {
    children: ReactNode;
    /** Matches the activity surface tone on the right. */
    tone?: FeedActivityTone;
    className?: string;
};

/** Spine status icon with the same soft tone fill as the activity chip. */
export function FeedSpineIcon({ children, tone = "neutral", className = "" }: FeedSpineIconProps) {
    return (
        <span
            className={`mt-[1px] inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[8px] ${getFeedSpineNodeSurfaceClass(tone)} ${className}`}
        >
            {children}
        </span>
    );
}

export function FeedSpineDot({ className = "" }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={`mt-[1px] inline-flex h-[22px] w-[22px] items-center justify-center rounded-[8px] bg-[var(--adaptive-black100)] ${className}`}
        >
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--adaptive-black400)]" />
        </span>
    );
}
