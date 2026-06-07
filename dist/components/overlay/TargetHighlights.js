import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { AnimatedPresence, motion } from "../../components/motion/index.js";
const HIGHLIGHT_MOTION = {
    group: {
        fade: { duration: 0.14, ease: "ease-out" },
        layout: { duration: 0.5, ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
    item: {
        fade: { duration: 0.14, ease: "ease-out" },
        layout: { duration: 0.44, ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
};
function highlightPresenceKey(type) {
    return `hover-${type}`;
}
function HighlightMotionBox({ target, showLabel }) {
    const motionPreset = HIGHLIGHT_MOTION[target.type];
    return (_jsx(motion.div, { layout: true, layoutTransition: motionPreset.layout, transition: motionPreset.fade, className: "pointer-events-none fixed box-border", style: {
            left: target.rect.left,
            top: target.rect.top,
            width: target.rect.width,
            height: target.rect.height,
            outline: `2px solid ${TARGET_COLOR[target.type]}`,
            backgroundColor: TARGET_SURFACE[target.type],
        }, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: showLabel ? (_jsxs("span", { className: "absolute left-0 top-0 -translate-y-full px-1 py-0.5 font-[var(--coding-font)] text-[12px] font-medium text-white", style: { backgroundColor: TARGET_COLOR[target.type] }, children: [target.type, " \u00B7 ", target.id] })) : null }));
}
export function TargetHighlights({ hoveredTarget, previewTargets = [], selectedTarget }) {
    return (_jsxs(_Fragment, { children: [_jsxs(AnimatedPresence, { children: [previewTargets.map((target) => (_jsx(HighlightMotionBox, { target: target, showLabel: true }, `${target.type}-${target.id}`))), hoveredTarget ? (_jsx(HighlightMotionBox, { target: hoveredTarget, showLabel: true }, highlightPresenceKey(hoveredTarget.type))) : null] }), selectedTarget ? (_jsx("div", { className: "pointer-events-none fixed box-border rounded-sm", style: {
                    left: selectedTarget.rect.left,
                    top: selectedTarget.rect.top,
                    width: selectedTarget.rect.width,
                    height: selectedTarget.rect.height,
                    boxShadow: `0 0 0 3px ${TARGET_COLOR[selectedTarget.type]}`,
                } })) : null] }));
}
//# sourceMappingURL=TargetHighlights.js.map