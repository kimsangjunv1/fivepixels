import { useReport } from "../../providers/reportContext.js";
import { ReportOverlayLayer } from "../overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "../panel/ReportControlPanel.js";
import { ReportDraftForm } from "../panel/ReportDraftForm.js";
import { ReportFeedbackList } from "../panel/ReportFeedbackList.js";
import { ReportMarkersLayer } from "../point/ReportMarkersLayer.js";

export function ReportView() {
    const { mode, showFeedbackList, showTargetPreview } = useReport();

    const showOverlay = mode !== "idle" || showTargetPreview;

    return (
        <>
            <ReportControlPanel />

            {showOverlay ? (
                <ReportOverlayLayer>
                    {mode !== "idle" ? (
                        <>
                            <ReportMarkersLayer />
                            <ReportDraftForm />
                        </>
                    ) : null}
                </ReportOverlayLayer>
            ) : null}

            {mode === "view" && showFeedbackList ? <ReportFeedbackList /> : null}
        </>
    );
}
