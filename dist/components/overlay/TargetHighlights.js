import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR } from "../../constants/report.js";
import { reportStyles } from "../report/styles.js";
export function TargetHighlights({ hoveredTarget, selectedTarget }) {
    return (_jsxs(_Fragment, { children: [hoveredTarget ? (_jsx("div", { style: {
                    ...reportStyles.highlightBox,
                    left: hoveredTarget.rect.left,
                    top: hoveredTarget.rect.top,
                    width: hoveredTarget.rect.width,
                    height: hoveredTarget.rect.height,
                    outline: `2px solid ${TARGET_COLOR[hoveredTarget.type]}`,
                    backgroundColor: `${TARGET_COLOR[hoveredTarget.type]}15`,
                }, children: _jsxs("span", { style: {
                        ...reportStyles.highlightLabel,
                        backgroundColor: TARGET_COLOR[hoveredTarget.type],
                    }, children: [hoveredTarget.type, " \u00B7 ", hoveredTarget.id] }) })) : null, selectedTarget ? (_jsx("div", { style: {
                    ...reportStyles.highlightBox,
                    left: selectedTarget.rect.left,
                    top: selectedTarget.rect.top,
                    width: selectedTarget.rect.width,
                    height: selectedTarget.rect.height,
                    boxShadow: `0 0 0 3px ${TARGET_COLOR[selectedTarget.type]}`,
                } })) : null] }));
}
//# sourceMappingURL=TargetHighlights.js.map