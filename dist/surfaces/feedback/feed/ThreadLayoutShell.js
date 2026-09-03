import { jsx as _jsx } from "react/jsx-runtime";
import { useReportPreferences } from "../../../shared/providers/reportContext.js";
import { ThreadTimelineRow } from "../ThreadTimelineRow.js";
import { FeedTimelineRow } from "./FeedTimelineRow.js";
/** Picks classic time-rail vs feed spine based on Settings → Appearance → Thread layout. */
export function ThreadLayoutShell({ classicTime, classicReplyIndicator = false, feedNode, nested = false, density = "comment", children, className = "", }) {
    const { threadLayout } = useReportPreferences();
    if (threadLayout === "feed") {
        return (_jsx(FeedTimelineRow, { node: feedNode, nested: nested, density: density, className: className, children: children }));
    }
    return (_jsx(ThreadTimelineRow, { time: classicTime, replyIndicator: classicReplyIndicator || nested, className: className, children: children }));
}
//# sourceMappingURL=ThreadLayoutShell.js.map