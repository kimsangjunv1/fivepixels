import type { ReactNode } from "react";
import { useReport } from "../../providers/reportContext.js";
import { TargetHighlights } from "./TargetHighlights.js";

type ReportOverlayLayerProps = {
    children?: ReactNode;
};

export function ReportOverlayLayer({ children }: ReportOverlayLayerProps) {
    const {
        overlayRef,
        mode,
        hoveredTarget,
        selectableTargets,
        selectedTarget,
        showTargetPreview,
        handleOverlayMove,
        handleOverlayClick,
    } = useReport();

    const isReportMode = mode === "report";
    const isViewMode = mode === "view";
    const isPreviewMode = showTargetPreview && mode === "idle";
    const overlayClassName = isReportMode
        ? "pointer-events-auto fixed inset-0 z-[999999] cursor-crosshair bg-[var(--st-overlay)]"
        : "pointer-events-none fixed inset-0 z-[999999]";

    return (
        <div
            ref={overlayRef}
            onMouseMove={isReportMode ? handleOverlayMove : undefined}
            onClick={isReportMode ? handleOverlayClick : undefined}
            className={overlayClassName}
            data-overlay-mode={isReportMode ? "report" : isViewMode ? "view" : isPreviewMode ? "preview" : "idle"}
        >
            <TargetHighlights hoveredTarget={hoveredTarget} previewTargets={isPreviewMode ? selectableTargets : undefined} selectedTarget={selectedTarget} />
            {children}
        </div>
    );
}
