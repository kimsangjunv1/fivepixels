import type { ReactNode } from "react";
import { useReport } from "@/providers/reportContext.js";
import { PickTargetContextMenu } from "./PickTargetContextMenu.js";
import { PickTargetProbePanel } from "./PickTargetProbePanel.js";
import { PickTargetSavedBadges } from "./PickTargetSavedBadges.js";
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
        pickTargetContextMenu,
        contextMenuElementKey,
        savedProbeEdits,
        selectableTargets,
        showTargetPreview,
        markerPreviewTargets,
        activeMarkerTarget,
        handleOverlayMove,
        handleOverlayContextMenu,
        handleOverlayClick,
        closePickTargetContextMenu,
    } = useReport();

    const isReportMode = mode === "report";
    const isViewMode = mode === "view";
    const isPreviewMode = showTargetPreview && mode === "idle";
    const showHoverInspect = isReportMode && !draft && !pickProbeOpen && Boolean(hoveredTarget) && !activeMarkerTarget;
    const showSelectionHighlight = isReportMode && Boolean(selectedTarget) && (Boolean(draft) || pickProbeOpen);
    const showPickProbeCompare = pickProbeOpen && pickProbeHasEdits;
    const overlayClassName = isReportMode
        ? "pointer-events-auto fixed inset-0 z-[999999] cursor-crosshair"
        : "pointer-events-none fixed inset-0 z-[999999]";

    return (
        <div
            ref={overlayRef}
            onMouseMove={isReportMode ? handleOverlayMove : undefined}
            onContextMenu={isReportMode ? handleOverlayContextMenu : undefined}
            onClick={
                isReportMode
                    ? (event) => {
                          if (pickTargetContextMenu) {
                              closePickTargetContextMenu();
                              return;
                          }

                          handleOverlayClick(event);
                      }
                    : undefined
            }
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
            <PickTargetSavedBadges />
            {pickTargetContextMenu ? (
                <PickTargetContextMenu
                    clientX={pickTargetContextMenu.clientX}
                    clientY={pickTargetContextMenu.clientY}
                    showRevert={Boolean(contextMenuElementKey && savedProbeEdits[contextMenuElementKey])}
                />
            ) : null}
            {children}
        </div>
    );
}
