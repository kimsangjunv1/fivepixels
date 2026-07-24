import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportSession } from "../../providers/reportContext.js";
import { PickTargetContextMenu } from "./PickTargetContextMenu.js";
import { PickTargetProbePanel } from "./PickTargetProbePanel.js";
import { PickTargetSavedBadges } from "./PickTargetSavedBadges.js";
import { TargetHighlights } from "./TargetHighlights.js";
export function ReportOverlayLayer({ children }) {
    const { overlayRef, mode, draft, hoveredTarget, selectedTarget, pickProbeOpen, pickProbeHasEdits, pickTargetContextMenu, contextMenuElementKey, savedProbeEdits, selectableTargets, showTargetPreview, markerPreviewTargets, activeMarkerTarget, mentionHighlightTarget, handleOverlayMove, handleOverlayContextMenu, handleOverlayClick, closePickTargetContextMenu } = useReportSession();
    const isReportMode = mode === "report";
    const isViewMode = mode === "view";
    const isPreviewMode = showTargetPreview && mode === "idle";
    const showHoverInspect = isReportMode && !draft && !pickProbeOpen && Boolean(hoveredTarget) && !activeMarkerTarget && !mentionHighlightTarget;
    const showSelectionHighlight = isReportMode && Boolean(selectedTarget) && (Boolean(draft) || pickProbeOpen);
    const showPickProbeCompare = pickProbeOpen && pickProbeHasEdits;
    const showActiveMarkerInspect = isReportMode && Boolean(activeMarkerTarget);
    const overlayClassName = isReportMode
        ? "pointer-events-auto fixed inset-0 z-[999999] cursor-crosshair"
        : "pointer-events-none fixed inset-0 z-[999999]";
    return (_jsxs("div", { ref: overlayRef, onMouseMove: isReportMode ? handleOverlayMove : undefined, onContextMenu: isReportMode ? handleOverlayContextMenu : undefined, onClick: isReportMode
            ? (event) => {
                if (pickTargetContextMenu) {
                    closePickTargetContextMenu();
                    return;
                }
                handleOverlayClick(event);
            }
            : undefined, className: overlayClassName, "data-overlay-mode": isReportMode ? "report" : isViewMode ? "view" : isPreviewMode ? "preview" : "idle", children: [_jsx(TargetHighlights, { hoveredTarget: hoveredTarget, selectedTarget: selectedTarget, showHoverInspect: showHoverInspect, showSelectionHighlight: showSelectionHighlight, showPickProbeCompare: showPickProbeCompare, showActiveMarkerInspect: showActiveMarkerInspect, previewTargets: isPreviewMode ? selectableTargets : undefined, markerPreviewTargets: markerPreviewTargets, activeMarkerTarget: activeMarkerTarget, mentionHighlightTarget: mentionHighlightTarget }), _jsx(PickTargetProbePanel, {}), _jsx(PickTargetSavedBadges, {}), pickTargetContextMenu ? (_jsx(PickTargetContextMenu, { clientX: pickTargetContextMenu.clientX, clientY: pickTargetContextMenu.clientY, showRevert: Boolean(contextMenuElementKey && savedProbeEdits[contextMenuElementKey]) })) : null, children] }));
}
//# sourceMappingURL=ReportOverlayLayer.js.map