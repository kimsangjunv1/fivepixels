import type { ReactNode } from "react";
import { useReportPreferences } from "@/providers/reportContext.js";
import { ThreadTimelineRow } from "../ThreadTimelineRow.js";
import { FeedTimelineRow, type FeedRowDensity } from "./FeedTimelineRow.js";

type ThreadLayoutShellProps = {
    classicTime?: string;
    classicReplyIndicator?: boolean;
    feedNode?: ReactNode;
    nested?: boolean;
    hideLineBelow?: boolean;
    hideLineAbove?: boolean;
    density?: FeedRowDensity;
    children: ReactNode;
    className?: string;
};

/** Picks classic time-rail vs feed spine based on Settings → Appearance → Thread layout. */
export function ThreadLayoutShell({
    classicTime,
    classicReplyIndicator = false,
    feedNode,
    nested = false,
    hideLineBelow = false,
    hideLineAbove = false,
    density = "comment",
    children,
    className = "",
}: ThreadLayoutShellProps) {
    const { threadLayout } = useReportPreferences();

    if (threadLayout === "feed") {
        return (
            <FeedTimelineRow
                node={feedNode}
                nested={nested}
                hideLineBelow={hideLineBelow}
                hideLineAbove={hideLineAbove}
                density={density}
                className={className}
            >
                {children}
            </FeedTimelineRow>
        );
    }

    return (
        <ThreadTimelineRow
            time={classicTime}
            replyIndicator={classicReplyIndicator || nested}
            className={className}
        >
            {children}
        </ThreadTimelineRow>
    );
}
