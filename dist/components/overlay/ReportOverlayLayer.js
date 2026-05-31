import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { stitchablePartProps } from "../report/parts.js";
import { TargetHighlights } from "./TargetHighlights.js";
export function ReportOverlayLayer({ children }) {
    const { overlayRef, mode, hoveredTarget, selectableTargets, selectedTarget, showTargetPreview, handleOverlayMove, handleOverlayClick, } = useReport();
    const isReportMode = mode === "report";
    const isViewMode = mode === "view";
    const isPreviewMode = showTargetPreview && mode === "idle";
    const overlayMode = isReportMode ? "report" : isViewMode ? "view" : isPreviewMode ? "preview" : "idle";
    return (_jsxs("div", { ref: overlayRef, onMouseMove: isReportMode ? handleOverlayMove : undefined, onClick: isReportMode ? handleOverlayClick : undefined, ...stitchablePartProps("overlay"), "data-overlay-mode": overlayMode, children: [_jsx(TargetHighlights, { hoveredTarget: hoveredTarget, previewTargets: isPreviewMode ? selectableTargets : undefined, selectedTarget: selectedTarget }), children] }));
}
//# sourceMappingURL=ReportOverlayLayer.js.map