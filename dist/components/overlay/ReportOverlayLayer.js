import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { TargetHighlights } from "./TargetHighlights.js";
import { reportStyles } from "../report/styles.js";
export function ReportOverlayLayer({ children }) {
    const { overlayRef, mode, palette, hoveredTarget, selectedTarget, handleOverlayMove, handleOverlayClick } = useReport();
    return (_jsxs("div", { ref: overlayRef, onMouseMove: handleOverlayMove, onClick: handleOverlayClick, style: {
            ...reportStyles.overlay,
            backgroundColor: mode === "report" ? palette.overlay : "transparent",
            pointerEvents: "auto",
            cursor: mode === "report" ? "crosshair" : "default",
        }, children: [_jsx(TargetHighlights, { hoveredTarget: hoveredTarget, selectedTarget: selectedTarget }), children] }));
}
//# sourceMappingURL=ReportOverlayLayer.js.map