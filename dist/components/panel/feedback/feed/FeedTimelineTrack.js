import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FEED_RAIL_WIDTH } from "./FeedTimelineRow.js";
/**
 * Continuous main spine for the feed layout.
 * Nested L-branches stay on each nested row; this track keeps the root rail unbroken
 * through comments, questions, assignee events, and the final history item.
 */
export function FeedTimelineTrack({ children, className = "" }) {
    return (_jsxs("div", { className: `relative ${className}`, children: [_jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute bottom-0 top-0 w-px bg-[var(--adaptive-black300)]", style: { left: FEED_RAIL_WIDTH / 2, transform: "translateX(-50%)" } }), children] }));
}
//# sourceMappingURL=FeedTimelineTrack.js.map