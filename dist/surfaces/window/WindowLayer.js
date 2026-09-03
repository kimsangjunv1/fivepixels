import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useReportSession } from "../../shared/providers/reportContext.js";
import { FeedbackWindow } from "./FeedbackWindow.js";
const FALLBACK_STACK_OFFSET = 28;
export function WindowLayer() {
    const { mode, markers, openReplyReports, activeReplyReportId } = useReportSession();
    if (mode !== "view" || openReplyReports.length === 0) {
        return null;
    }
    const viewportWidth = typeof window === "undefined" ? 1200 : window.innerWidth;
    const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
    const fallbackCenterLeft = Math.round(viewportWidth / 2);
    const fallbackCenterTop = Math.round(viewportHeight / 3);
    return (_jsx(_Fragment, { children: openReplyReports.map((report, index) => {
            const markerAnchor = markers.find((marker) => marker.report.id === report.id);
            const anchor = markerAnchor ?? {
                left: fallbackCenterLeft + index * FALLBACK_STACK_OFFSET,
                top: fallbackCenterTop + index * FALLBACK_STACK_OFFSET,
            };
            return (_jsx(FeedbackWindow, { report: report, anchor: anchor, isFocused: report.id === activeReplyReportId }, report.id));
        }) }));
}
//# sourceMappingURL=WindowLayer.js.map