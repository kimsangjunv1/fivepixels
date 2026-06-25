import { TARGET_COLOR } from "@/constants/report.js";
import { useReport } from "@/providers/reportContext.js";
import { getDraftMarkerPosition } from "@/utils/coordinates.js";

const DRAFT_MARKER_CLASS = "pointer-events-none fixed z-[1000000000] flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-lg";

export function ReportDraftMarker() {
    const { mode, draft, selectedTarget } = useReport();

    if (mode !== "report" || !draft) {
        return null;
    }

    const { left, top, clampedEdge } = getDraftMarkerPosition(draft, selectedTarget);
    const markerColor = TARGET_COLOR[draft.reportType];

    if (clampedEdge !== null) {
        return null;
    }

    return (
        <>
            {selectedTarget ? (
                <div
                    // className="pointer-events-none fixed rounded-[3px] border border-sky-400/70 bg-sky-200/20 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                    className="pointer-events-none fixed"
                    style={{
                        left: selectedTarget.rect.left,
                        top: selectedTarget.rect.top,
                        width: selectedTarget.rect.width,
                        height: selectedTarget.rect.height,
                        // outline: `1px solid ${markerColor}`,
                        // backgroundColor: TARGET_SURFACE[draft.reportType],
                    }}
                />
            ) : null}

            <div
                aria-hidden
                className={DRAFT_MARKER_CLASS}
                style={{
                    left,
                    top,
                    backgroundColor: markerColor,
                }}
            />
        </>
    );
}
