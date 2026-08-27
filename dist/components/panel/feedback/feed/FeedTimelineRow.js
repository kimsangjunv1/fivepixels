import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeedSpineNodeSurfaceClass } from "./feedActivitySurface.js";
export const FEED_RAIL_WIDTH = 32;
/** Nested replies indent; L-branch connects back to the main track spine. */
export const FEED_NESTED_OFFSET = 20;
/**
 * Feed row. Root rows sit on FeedTimelineTrack's continuous spine.
 * Nested rows keep only the L horizontal stem (no nested vertical rail).
 */
export function FeedTimelineRow({ node, nested = false, density = "comment", children, className = "", }) {
    const bottomPad = density === "activity" ? "pb-[6px]" : "pb-[12px]";
    const nodeCenter = density === "activity" ? 12 : 13;
    const mainSpineX = FEED_RAIL_WIDTH / 2 - FEED_NESTED_OFFSET;
    const branchWidth = FEED_RAIL_WIDTH / 2 - mainSpineX;
    return (_jsxs("div", { className: `relative grid ${bottomPad} ${className}`, style: {
            gridTemplateColumns: `${FEED_RAIL_WIDTH}px minmax(0, 1fr)`,
            marginLeft: nested ? FEED_NESTED_OFFSET : undefined,
        }, children: [_jsxs("div", { className: "relative flex items-start justify-center self-stretch", children: [nested ? (_jsx("span", { "aria-hidden": true, className: "absolute bg-[var(--adaptive-black300)]", style: {
                            left: mainSpineX,
                            top: nodeCenter,
                            width: branchWidth,
                            height: 1,
                        } })) : null, _jsx("div", { "data-feed-spine-node": "true", className: "relative z-[1] flex shrink-0 self-start", children: node })] }), _jsx("div", { className: `min-w-0 ${nested ? "pl-[8px]" : "pl-[10px]"}`, children: children })] }));
}
/** Spine status icon with the same soft tone fill as the activity chip. */
export function FeedSpineIcon({ children, tone = "neutral", className = "" }) {
    return (_jsx("span", { className: `mt-[1px] inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[8px] ${getFeedSpineNodeSurfaceClass(tone)} ${className}`, children: children }));
}
export function FeedSpineDot({ className = "" }) {
    return (_jsx("span", { "aria-hidden": true, className: `mt-[1px] inline-flex h-[22px] w-[22px] items-center justify-center rounded-[8px] bg-[var(--adaptive-black100)] ${className}`, children: _jsx("span", { className: "h-[6px] w-[6px] rounded-full bg-[var(--adaptive-black400)]" }) }));
}
//# sourceMappingURL=FeedTimelineRow.js.map