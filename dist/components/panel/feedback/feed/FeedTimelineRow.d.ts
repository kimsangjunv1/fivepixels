import type { ReactNode } from "react";
export declare const FEED_RAIL_WIDTH = 32;
export type FeedRowDensity = "comment" | "activity";
type FeedTimelineRowProps = {
    /** Visual node on the vertical spine (avatar or thin icon). */
    node?: ReactNode;
    /** Indent as a nested reply under a parent comment. */
    nested?: boolean;
    /** Hide the continuing spine below this row (e.g. last item). */
    hideLineBelow?: boolean;
    /** Hide the spine above this row (e.g. first item). */
    hideLineAbove?: boolean;
    /** Activity rows stay tight; comments breathe a bit more. */
    density?: FeedRowDensity;
    children: ReactNode;
    className?: string;
};
/**
 * Continuous-spine row for the feed thread layout.
 * One full-height rail line; the node sits on top with a surface fill so the spine reads unbroken.
 */
export declare function FeedTimelineRow({ node, nested, hideLineBelow, hideLineAbove, density, children, className, }: FeedTimelineRowProps): import("react").JSX.Element;
/** Thin icon on the spine — no circular chip (avoids flowchart look). */
export declare function FeedSpineIcon({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function FeedSpineDot({ className }: {
    className?: string;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedTimelineRow.d.ts.map