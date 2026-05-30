import type { ReactNode } from "react";
import { useReport } from "../../providers/reportContext.js";
import { TargetHighlights } from "./TargetHighlights.js";
import { reportStyles } from "../report/styles.js";

type ReportOverlayLayerProps = {
    children?: ReactNode;
};

export function ReportOverlayLayer({ children }: ReportOverlayLayerProps) {
    const {
        overlayRef,
        mode,
        palette,
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

    return (
        <div
            ref={overlayRef}
            onMouseMove={isReportMode ? handleOverlayMove : undefined}
            onClick={isReportMode ? handleOverlayClick : undefined}
            style={{
                ...reportStyles.overlay,
                zIndex: isViewMode ? 1110 : reportStyles.overlay.zIndex,
                backgroundColor: isReportMode ? palette.overlay : "transparent",
                pointerEvents: isPreviewMode || isViewMode ? "none" : "auto",
                cursor: isReportMode ? "crosshair" : "default",
            }}
        >
            <TargetHighlights
                hoveredTarget={hoveredTarget}
                previewTargets={isPreviewMode ? selectableTargets : undefined}
                selectedTarget={selectedTarget}
            />
            {children}
        </div>
    );
}
