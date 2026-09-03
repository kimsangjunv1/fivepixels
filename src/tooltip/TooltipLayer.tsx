import { type ReactNode } from "react";
import { useReportSession } from "@/providers/reportContext.js";
import { ContextMenuTooltip } from "./ContextMenuTooltip.js";
import { ProbeTooltip } from "./ProbeTooltip.js";
import { PickTargetSavedBadges } from "./PickTargetSavedBadges.js";
import { TargetHighlights } from "./TargetHighlights.js";

type TooltipLayerProps = {
    children?: ReactNode;
};

export function TooltipLayer({ children }: TooltipLayerProps) {
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
        mentionHighlightTarget,
        handleOverlayMove,
        handleOverlayContextMenu,
        handleOverlayClick,
        closeContextMenuTooltip,
    } = useReportSession();

    const isReportMode = mode === "report";
    const isViewMode = mode === "view";
    const isPreviewMode = showTargetPreview && mode === "idle";
    const showHoverInspect =
        isReportMode &&
        !draft &&
        !pickProbeOpen &&
        Boolean(hoveredTarget) &&
        !activeMarkerTarget &&
        !mentionHighlightTarget;
    const showSelectionHighlight = isReportMode && Boolean(selectedTarget) && Boolean(draft) && !pickProbeOpen;
    const showPickProbeCompare = pickProbeOpen && pickProbeHasEdits;
    const showActiveMarkerInspect = isReportMode && Boolean(activeMarkerTarget);
    const probeFocusTarget = pickProbeOpen ? selectedTarget : null;
    const overlayClassName = isReportMode
        ? pickProbeOpen
            ? "pointer-events-none fixed inset-0 z-[999999]"
            : "pointer-events-auto fixed inset-0 z-[999999] cursor-crosshair"
        : "pointer-events-none fixed inset-0 z-[999999]";

    return (
        <div
            ref={overlayRef}
            onMouseMove={isReportMode && !pickProbeOpen ? handleOverlayMove : undefined}
            onContextMenu={isReportMode ? handleOverlayContextMenu : undefined}
            onClick={
                isReportMode && !pickProbeOpen
                    ? (event) => {
                          if (pickTargetContextMenu) {
                              closeContextMenuTooltip();
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
                contextMenuTarget={pickTargetContextMenu?.target ?? probeFocusTarget}
                showHoverInspect={showHoverInspect}
                showSelectionHighlight={showSelectionHighlight}
                showPickProbeCompare={showPickProbeCompare}
                showActiveMarkerInspect={showActiveMarkerInspect}
                previewTargets={isPreviewMode ? selectableTargets : undefined}
                markerPreviewTargets={markerPreviewTargets}
                activeMarkerTarget={activeMarkerTarget}
                mentionHighlightTarget={mentionHighlightTarget}
            />
            <ProbeTooltip />
            <PickTargetSavedBadges />
            {pickTargetContextMenu ? (
                <ContextMenuTooltip
                    clientX={pickTargetContextMenu.clientX}
                    clientY={pickTargetContextMenu.clientY}
                    showRevert={Boolean(contextMenuElementKey && savedProbeEdits[contextMenuElementKey])}
                />
            ) : null}
            {children}
        </div>
    );
}
