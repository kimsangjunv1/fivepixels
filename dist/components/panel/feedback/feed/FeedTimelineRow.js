import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const FEED_RAIL_WIDTH = 32;
/**
 * Continuous-spine row for the feed thread layout.
 * One full-height rail line; the node sits on top with a surface fill so the spine reads unbroken.
 */
export function FeedTimelineRow({ node, nested = false, hideLineBelow = false, hideLineAbove = false, density = "comment", children, className = "", }) {
    const bottomPad = density === "activity" ? "pb-[6px]" : "pb-[12px]";
    const nodeCenter = density === "activity" ? 12 : 13;
    return (_jsxs("div", { className: `relative grid ${nested ? "ml-[20px]" : ""} ${bottomPad} ${className}`, style: { gridTemplateColumns: `${FEED_RAIL_WIDTH}px minmax(0, 1fr)` }, children: [_jsxs("div", { className: "relative flex justify-center self-stretch", children: [_jsx("span", { "aria-hidden": true, className: "absolute left-1/2 w-px -translate-x-1/2 bg-[var(--adaptive-black300)]", style: {
                            top: hideLineAbove ? nodeCenter : 0,
                            bottom: hideLineBelow ? undefined : 0,
                            height: hideLineBelow ? nodeCenter : undefined,
                        } }), nested ? (_jsx("span", { "aria-hidden": true, className: "absolute left-[-20px] w-[20px] bg-[var(--adaptive-black300)]", style: { top: nodeCenter, height: 1 } })) : null, _jsx("div", { className: "relative z-[1] flex shrink-0 items-start bg-[var(--adaptive-black50)] py-[1px]", children: node })] }), _jsx("div", { className: `min-w-0 ${nested ? "pl-[8px]" : "pl-[10px]"}`, children: children })] }));
}
/** Thin icon on the spine — no circular chip (avoids flowchart look). */
export function FeedSpineIcon({ children }) {
    return (_jsx("span", { className: "mt-[2px] inline-flex h-[16px] w-[16px] items-center justify-center text-[var(--adaptive-black500)]", children: children }));
}
export function FeedSpineDot({ className = "" }) {
    return _jsx("span", { "aria-hidden": true, className: `mt-[6px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-black400)] ${className}` });
}
//# sourceMappingURL=FeedTimelineRow.js.map