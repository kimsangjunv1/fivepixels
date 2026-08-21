import { useReport } from "@/providers/reportContext.js";
import { MarkerFeedbackWindow } from "./MarkerFeedbackWindow.js";

const FALLBACK_STACK_OFFSET = 28;

export function ReportOpenWindowsLayer() {
    const { mode, markers, openReplyReports, activeReplyReportId } = useReport();

    if (mode !== "view" || openReplyReports.length === 0) {
        return null;
    }

    const viewportWidth = typeof window === "undefined" ? 1200 : window.innerWidth;
    const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
    const fallbackCenterLeft = Math.round(viewportWidth / 2);
    const fallbackCenterTop = Math.round(viewportHeight / 3);

    return (
        <>
            {openReplyReports.map((report, index) => {
                const markerAnchor = markers.find((marker) => marker.report.id === report.id);
                const anchor = markerAnchor ?? {
                    left: fallbackCenterLeft + index * FALLBACK_STACK_OFFSET,
                    top: fallbackCenterTop + index * FALLBACK_STACK_OFFSET,
                };

                return (
                    <MarkerFeedbackWindow
                        key={report.id}
                        report={report}
                        anchor={anchor}
                        isFocused={report.id === activeReplyReportId}
                    />
                );
            })}
        </>
    );
}
