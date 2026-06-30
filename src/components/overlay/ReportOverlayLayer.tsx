import type { ReactNode } from "react";
import { useReport } from "@/providers/reportContext.js";
import { PickTargetProbePanel } from "./PickTargetProbePanel.js";
import { TargetHighlights } from "./TargetHighlights.js";

type ReportOverlayLayerProps = {
    children?: ReactNode;
};

export function ReportOverlayLayer({ children }: ReportOverlayLayerProps) {
    const {
        overlayRef,
        mode,
        draft,
        hoveredTarget,
        selectedTarget,
        pickProbeOpen,
        pickProbeHasEdits,
        selectableTargets,
        showTargetPreview,
        markerPreviewTargets,
        activeMarkerTarget,
        handleOverlayMove,
        handleOverlayClick,
    } = useReport();

    const isReportMode = mode === "report";
    const isViewMode = mode === "view";
    const isPreviewMode = showTargetPreview && mode === "idle";
    const showHoverInspect = isReportMode && !draft && Boolean(hoveredTarget) && !activeMarkerTarget;
    const showSelectionHighlight = isReportMode && Boolean(draft) && Boolean(selectedTarget);
    const showPickProbeCompare = pickProbeOpen && pickProbeHasEdits;
    const overlayClassName = isReportMode
        ? "pointer-events-auto fixed inset-0 z-[999999] cursor-crosshair"
        : "pointer-events-none fixed inset-0 z-[999999]";

    return (
        <div
            ref={overlayRef}
            onMouseMove={isReportMode ? handleOverlayMove : undefined}
            onClick={isReportMode ? handleOverlayClick : undefined}
            className={overlayClassName}
            data-overlay-mode={isReportMode ? "report" : isViewMode ? "view" : isPreviewMode ? "preview" : "idle"}
        >
            <TargetHighlights
                hoveredTarget={hoveredTarget}
                selectedTarget={selectedTarget}
                showHoverInspect={showHoverInspect}
                showSelectionHighlight={showSelectionHighlight}
                showPickProbeCompare={showPickProbeCompare}
                previewTargets={isPreviewMode ? selectableTargets : undefined}
                markerPreviewTargets={markerPreviewTargets}
                activeMarkerTarget={activeMarkerTarget}
            />
            <PickTargetProbePanel />
            {children}
        </div>
    );
}
