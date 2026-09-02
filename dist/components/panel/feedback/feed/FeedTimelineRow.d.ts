import type { ReactNode } from "react";
import type { FeedActivityTone } from "./feedActivitySurface.js";
export declare const FEED_RAIL_WIDTH = 32;
/** Nested replies indent; L-branch connects back to the main track spine. */
export declare const FEED_NESTED_OFFSET = 20;
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
export declare function FeedTimelineRow({ node, nested, density, children, className, }: FeedTimelineRowProps): import("react").JSX.Element;
type FeedSpineIconProps = {
    children: ReactNode;
    /** Matches the activity surface tone on the right. */
    tone?: FeedActivityTone;
    className?: string;
};
/** Spine status icon with the same soft tone fill as the activity chip. */
export declare function FeedSpineIcon({ children, tone, className }: FeedSpineIconProps): import("react").JSX.Element;
export declare function FeedSpineDot({ className }: {
    className?: string;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedTimelineRow.d.ts.map