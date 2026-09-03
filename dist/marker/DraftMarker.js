import { jsx as _jsx } from "react/jsx-runtime";
import { DOT_SIZE, FEEDBACK_HIGHLIGHT } from "../constants/report.js";
import { getMarkerScaleFactor } from "../constants/markerAppearance.js";
import { useReportPreferences, useReportSession } from "../providers/reportContext.js";
import { getDraftMarkerPosition } from "../utils/marker/coordinates.js";
const DRAFT_MARKER_CLASS = "pointer-events-none fixed z-[1000000000] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-lg";
export function DraftMarker() {
    const { draft, selectedTarget, editingReportId } = useReportSession();
    const { markerAppearance } = useReportPreferences();
    // Edit mode reuses the existing report marker — do not paint a second "create" draft dot.
    if (!draft || editingReportId) {
        return null;
    }
    const { left, top, clampedEdge } = getDraftMarkerPosition(draft, selectedTarget);
    const markerColor = FEEDBACK_HIGHLIGHT.outline;
    const dotSize = DOT_SIZE * getMarkerScaleFactor(markerAppearance.size);
    if (clampedEdge !== null) {
        return null;
    }
    return (_jsx("div", { "aria-hidden": true, className: DRAFT_MARKER_CLASS, style: {
            left,
            top,
            width: dotSize,
            height: dotSize,
            backgroundColor: markerColor,
        } }));
}
//# sourceMappingURL=DraftMarker.js.map