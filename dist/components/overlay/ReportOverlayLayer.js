import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { TargetHighlights } from "./TargetHighlights.js";
export function ReportOverlayLayer({ children }) {
    const { overlayRef, mode, hoveredTarget, selectableTargets, selectedTarget, showTargetPreview, handleOverlayMove, handleOverlayClick, } = useReport();
    const isReportMode = mode === "report";
    const isViewMode = mode === "view";
    const isPreviewMode = showTargetPreview && mode === "idle";
    const overlayClassName = isReportMode
        ? "pointer-events-auto fixed inset-0 z-[999999] cursor-crosshair bg-[var(--st-overlay)]"
        : "pointer-events-none fixed inset-0 z-[999999]";
    return (_jsxs("div", { ref: overlayRef, onMouseMove: isReportMode ? handleOverlayMove : undefined, onClick: isReportMode ? handleOverlayClick : undefined, className: overlayClassName, "data-overlay-mode": isReportMode ? "report" : isViewMode ? "view" : isPreviewMode ? "preview" : "idle", children: [_jsx(TargetHighlights, { hoveredTarget: hoveredTarget, previewTargets: isPreviewMode ? selectableTargets : undefined, selectedTarget: selectedTarget }), children] }));
}
//# sourceMappingURL=ReportOverlayLayer.js.map