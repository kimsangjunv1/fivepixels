import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR } from "../../constants/report.js";
import { reportStyles } from "../report/styles.js";
function HighlightBox({ target, showLabel }) {
    return (_jsx("div", { style: {
            ...reportStyles.highlightBox,
            left: target.rect.left,
            top: target.rect.top,
            width: target.rect.width,
            height: target.rect.height,
            outline: `2px solid ${TARGET_COLOR[target.type]}`,
            backgroundColor: `${TARGET_COLOR[target.type]}15`,
        }, children: showLabel ? (_jsxs("span", { style: {
                ...reportStyles.highlightLabel,
                backgroundColor: TARGET_COLOR[target.type],
            }, children: [target.type, " \u00B7 ", target.id] })) : null }));
}
export function TargetHighlights({ hoveredTarget, previewTargets = [], selectedTarget }) {
    return (_jsxs(_Fragment, { children: [previewTargets.map((target) => (_jsx(HighlightBox, { target: target, showLabel: true }, `${target.type}-${target.id}`))), hoveredTarget ? _jsx(HighlightBox, { target: hoveredTarget, showLabel: true }) : null, selectedTarget ? (_jsx("div", { style: {
                    ...reportStyles.highlightBox,
                    left: selectedTarget.rect.left,
                    top: selectedTarget.rect.top,
                    width: selectedTarget.rect.width,
                    height: selectedTarget.rect.height,
                    boxShadow: `0 0 0 3px ${TARGET_COLOR[selectedTarget.type]}`,
                } })) : null] }));
}
//# sourceMappingURL=TargetHighlights.js.map