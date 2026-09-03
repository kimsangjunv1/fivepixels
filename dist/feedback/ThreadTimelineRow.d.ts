import type { ReactNode } from "react";
/** Fixed width of the left time-rail column shared across every thread entry. */
export declare const TIMELINE_RAIL_WIDTH = 46;
export declare const TIMELINE_REPLY_RAIL_WIDTH = 58;
type ThreadTimelineRowProps = {
    time?: string;
    /** Ask / nested replies — show return-right arrow to the left of the clock. */
    replyIndicator?: boolean;
    children: ReactNode;
    className?: string;
};
export declare function ThreadTimelineRow({ time, replyIndicator, children, className }: ThreadTimelineRowProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ThreadTimelineRow.d.ts.map