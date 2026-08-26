import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export const FEED_RAIL_WIDTH = 32;
/** Nested replies indent; L-branch connects back to the main track spine. */
export const FEED_NESTED_OFFSET = 20;
/**
 * Feed row. Root rows sit on FeedTimelineTrack's continuous spine.
 * Nested rows keep the L-branch connector + a short nested rail for question threads.
 */
export function FeedTimelineRow({ node, nested = false, density = "comment", children, className = "", }) {
    const bottomPad = density === "activity" ? "pb-[6px]" : "pb-[12px]";
    const nodeCenter = density === "activity" ? 12 : 13;
    const mainSpineX = FEED_RAIL_WIDTH / 2 - FEED_NESTED_OFFSET;
    const branchWidth = FEED_RAIL_WIDTH / 2 - mainSpineX;
    return (_jsxs("div", { className: `relative grid ${bottomPad} ${className}`, style: {
            gridTemplateColumns: `${FEED_RAIL_WIDTH}px minmax(0, 1fr)`,
            marginLeft: nested ? FEED_NESTED_OFFSET : undefined,
        }, children: [_jsxs("div", { className: "relative flex justify-center self-stretch", children: [nested ? (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": true, className: "absolute bg-[var(--adaptive-black300)]", style: {
                                    left: mainSpineX,
                                    top: nodeCenter,
                                    width: branchWidth,
                                    height: 1,
                                } }), _jsx("span", { "aria-hidden": true, className: "absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[var(--adaptive-black300)]" })] })) : null, _jsx("div", { className: "relative z-[1] flex shrink-0 items-start bg-[var(--adaptive-black50)] py-[1px]", children: node })] }), _jsx("div", { className: `min-w-0 ${nested ? "pl-[8px]" : "pl-[10px]"}`, children: children })] }));
}
/** Thin icon on the spine — no circular chip (avoids flowchart look). */
export function FeedSpineIcon({ children }) {
    return (_jsx("span", { className: "mt-[2px] inline-flex h-[16px] w-[16px] items-center justify-center text-[var(--adaptive-black500)]", children: children }));
}
export function FeedSpineDot({ className = "" }) {
    return _jsx("span", { "aria-hidden": true, className: `mt-[6px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-black400)] ${className}` });
}
//# sourceMappingURL=FeedTimelineRow.js.map