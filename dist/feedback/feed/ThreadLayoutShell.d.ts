import type { ReactNode } from "react";
import { type FeedRowDensity } from "./FeedTimelineRow.js";
type ThreadLayoutShellProps = {
    classicTime?: string;
    classicReplyIndicator?: boolean;
    feedNode?: ReactNode;
    nested?: boolean;
    density?: FeedRowDensity;
    children: ReactNode;
    className?: string;
};
/** Picks classic time-rail vs feed spine based on Settings → Appearance → Thread layout. */
export declare function ThreadLayoutShell({ classicTime, classicReplyIndicator, feedNode, nested, density, children, className, }: ThreadLayoutShellProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ThreadLayoutShell.d.ts.map