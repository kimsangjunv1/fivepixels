import type { ReactNode } from "react";
export declare const FEED_RAIL_WIDTH = 32;
/** Nested replies indent; L-branch connects back to the main track spine. */
export declare const FEED_NESTED_OFFSET = 20;
export type FeedRowDensity = "comment" | "activity";
type FeedTimelineRowProps = {
    /** Visual node on the vertical spine (avatar or thin icon). */
    node?: ReactNode;
    /** Indent as a nested reply under a parent comment (keeps L-branch). */
    nested?: boolean;
    /** @deprecated Main spine is drawn by FeedTimelineTrack; kept for API compat. */
    hideLineBelow?: boolean;
    /** @deprecated Main spine is drawn by FeedTimelineTrack; kept for API compat. */
    hideLineAbove?: boolean;
    /** Activity rows stay tight; comments breathe a bit more. */
    density?: FeedRowDensity;
    children: ReactNode;
    className?: string;
};
/**
 * Feed row. Root rows sit on FeedTimelineTrack's continuous spine.
 * Nested rows keep the L-branch connector + a short nested rail for question threads.
 */
export declare function FeedTimelineRow({ node, nested, density, children, className, }: FeedTimelineRowProps): import("react").JSX.Element;
/** Thin icon on the spine — no circular chip (avoids flowchart look). */
export declare function FeedSpineIcon({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function FeedSpineDot({ className }: {
    className?: string;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedTimelineRow.d.ts.map