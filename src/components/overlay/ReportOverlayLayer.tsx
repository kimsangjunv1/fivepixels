import type { ReactNode } from "react";
import { useReport } from "../../providers/reportContext.js";
import { stitchablePartProps } from "../report/parts.js";
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
    const overlayMode = isReportMode ? "report" : isViewMode ? "view" : isPreviewMode ? "preview" : "idle";

    return (
        <div
            ref={overlayRef}
            onMouseMove={isReportMode ? handleOverlayMove : undefined}
            onClick={isReportMode ? handleOverlayClick : undefined}
            {...stitchablePartProps("overlay")}
            data-overlay-mode={overlayMode}
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
