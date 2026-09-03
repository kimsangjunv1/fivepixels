import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowReturnRightIcon } from "../components/icons/Icons.js";
/** Fixed width of the left time-rail column shared across every thread entry. */
export const TIMELINE_RAIL_WIDTH = 46;
export const TIMELINE_REPLY_RAIL_WIDTH = 58;
export function ThreadTimelineRow({ time, replyIndicator = false, children, className = "" }) {
    const railWidth = replyIndicator ? TIMELINE_REPLY_RAIL_WIDTH : TIMELINE_RAIL_WIDTH;
    return (_jsxs("div", { className: `grid ${className}`, style: { gridTemplateColumns: `${railWidth}px minmax(0, 1fr)` }, children: [_jsxs("div", { className: `flex items-start ${replyIndicator ? "justify-end gap-[2px]" : "justify-center"}`, children: [replyIndicator ? (_jsx(ArrowReturnRightIcon, { className: "mt-[3px] h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black400)]", fill: "currentColor" })) : null, time ? (_jsx("p", { className: "rounded-full bg-[var(--adaptive-black200)] px-[4px] py-[2px] text-center text-[12px] tabular-nums text-[var(--adaptive-black500)]", children: time })) : null] }), _jsx("div", { className: "flex min-w-0 flex-col gap-[4px] pb-[16px] pl-[14px]", children: children })] }));
}
//# sourceMappingURL=ThreadTimelineRow.js.map