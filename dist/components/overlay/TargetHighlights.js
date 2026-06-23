import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR } from "../../constants/report.js";
function highlightPresenceKey(type) {
    return `hover-${type}`;
}
function HighlightBox({ target, showLabel }) {
    return (_jsx("div", { className: "fivepixels-target-highlight pointer-events-none fixed box-border", style: {
            left: target.rect.left,
            top: target.rect.top,
            width: target.rect.width,
            height: target.rect.height,
            outline: `2px solid #0ed1b4`,
            backgroundColor: "#0ed1b41c",
        }, children: showLabel ? (_jsxs("span", { className: "absolute left-0 top-0 -translate-y-full px-1 py-0.5 font-[var(--coding-font)] text-[12px] font-medium text-white", style: { backgroundColor: TARGET_COLOR[target.type] }, children: [target.type, " \u00B7 ", target.id] })) : null }));
}
export function TargetHighlights({ hoveredTarget, previewTargets = [], selectedTarget }) {
    return (_jsxs(_Fragment, { children: [previewTargets.map((target) => (_jsx(HighlightBox, { target: target, showLabel: true }, `${target.type}-${target.id}`))), hoveredTarget ? (_jsx(HighlightBox, { target: hoveredTarget, showLabel: true }, highlightPresenceKey(hoveredTarget.type))) : null, selectedTarget ? (_jsx("div", { className: "pointer-events-none fixed box-border rounded-sm", style: {
                    left: selectedTarget.rect.left,
                    top: selectedTarget.rect.top,
                    width: selectedTarget.rect.width,
                    height: selectedTarget.rect.height,
                } })) : null] }));
}
//# sourceMappingURL=TargetHighlights.js.map