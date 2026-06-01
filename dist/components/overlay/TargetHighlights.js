import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { AnimatedPresence, motion } from "../motion/index.js";
const HIGHLIGHT_LAYOUT_TRANSITION = { duration: 0.22, ease: "ease-out" };
const HOVER_LAYOUT_ID = "stitchable-target-highlight-hover";
function HighlightMotionBox({ target, showLabel, layoutId }) {
    return (_jsx(motion.div, { layout: true, layoutId: layoutId, transition: HIGHLIGHT_LAYOUT_TRANSITION, className: "pointer-events-none fixed box-border rounded-sm", style: {
            left: target.rect.left,
            top: target.rect.top,
            width: target.rect.width,
            height: target.rect.height,
            outline: `2px solid ${TARGET_COLOR[target.type]}`,
            backgroundColor: TARGET_SURFACE[target.type],
        }, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: showLabel ? (_jsxs("span", { className: "absolute left-0 top-0 -translate-y-full rounded px-1 py-0.5 text-[11px] font-medium text-white", style: { backgroundColor: TARGET_COLOR[target.type] }, children: [target.type, " \u00B7 ", target.id] })) : null }));
}
export function TargetHighlights({ hoveredTarget, previewTargets = [], selectedTarget }) {
    return (_jsxs(_Fragment, { children: [_jsxs(AnimatedPresence, { children: [previewTargets.map((target) => (_jsx(HighlightMotionBox, { target: target, showLabel: true }, `${target.type}-${target.id}`))), hoveredTarget ? (_jsx(HighlightMotionBox, { target: hoveredTarget, showLabel: true, layoutId: HOVER_LAYOUT_ID }, "hover-highlight")) : null] }), selectedTarget ? (_jsx("div", { className: "pointer-events-none fixed box-border rounded-sm", style: {
                    left: selectedTarget.rect.left,
                    top: selectedTarget.rect.top,
                    width: selectedTarget.rect.width,
                    height: selectedTarget.rect.height,
                    boxShadow: `0 0 0 3px ${TARGET_COLOR[selectedTarget.type]}`,
                } })) : null] }));
}
//# sourceMappingURL=TargetHighlights.js.map