import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { TargetHighlights } from "./TargetHighlights.js";
import { reportStyles } from "../report/styles.js";
export function ReportOverlayLayer({ children }) {
    const { overlayRef, mode, palette, hoveredTarget, selectableTargets, selectedTarget, showTargetPreview, handleOverlayMove, handleOverlayClick, } = useReport();
    const isReportMode = mode === "report";
    const isPreviewMode = showTargetPreview && mode === "idle";
    return (_jsxs("div", { ref: overlayRef, onMouseMove: isReportMode ? handleOverlayMove : undefined, onClick: isReportMode ? handleOverlayClick : undefined, style: {
            ...reportStyles.overlay,
            backgroundColor: isReportMode ? palette.overlay : "transparent",
            pointerEvents: isPreviewMode ? "none" : "auto",
            cursor: isReportMode ? "crosshair" : "default",
        }, children: [_jsx(TargetHighlights, { hoveredTarget: hoveredTarget, previewTargets: isPreviewMode ? selectableTargets : undefined, selectedTarget: selectedTarget }), children] }));
}
//# sourceMappingURL=ReportOverlayLayer.js.map