import type { ReactNode } from "react";
import { useReport } from "../../providers/reportContext.js";
import { TargetHighlights } from "./TargetHighlights.js";
import { reportStyles } from "../report/styles.js";

type ReportOverlayLayerProps = {
    children?: ReactNode;
};

export function ReportOverlayLayer({ children }: ReportOverlayLayerProps) {
    const { overlayRef, mode, palette, hoveredTarget, selectedTarget, handleOverlayMove, handleOverlayClick } = useReport();

    return (
        <div
            ref={overlayRef}
            onMouseMove={handleOverlayMove}
            onClick={handleOverlayClick}
            style={{
                ...reportStyles.overlay,
                backgroundColor: mode === "report" ? palette.overlay : "transparent",
                pointerEvents: "auto",
                cursor: mode === "report" ? "crosshair" : "default",
            }}
        >
            <TargetHighlights
                hoveredTarget={hoveredTarget}
                selectedTarget={selectedTarget}
            />
            {children}
        </div>
    );
}
