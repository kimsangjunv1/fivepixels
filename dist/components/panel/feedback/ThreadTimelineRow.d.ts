import type { ReactNode } from "react";
/** Fixed width of the left time-rail column shared across every thread entry. */
export declare const TIMELINE_RAIL_WIDTH = 46;
type ThreadTimelineRowProps = {
    time?: string;
    children: ReactNode;
    className?: string;
};
export declare function ThreadTimelineRow({ time, children, className }: ThreadTimelineRowProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ThreadTimelineRow.d.ts.map