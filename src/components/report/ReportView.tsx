import { useReport } from "../../providers/reportContext.js";
import { ReportOverlayLayer } from "../overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "../panel/ReportControlPanel.js";
import { ReportDraftForm } from "../panel/ReportDraftForm.js";
import { ReportDraftMarker } from "../point/ReportDraftMarker.js";
import { ReportMarkersLayer } from "../point/ReportMarkersLayer.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";

export function ReportView() {
    const { mode, showTargetPreview, resolvedAppearance } = useReport();
    const showOverlay = mode !== "idle" || showTargetPreview;

    return (
        <ShadowReportRoot appearance={resolvedAppearance}>
            <ReportControlPanel />

            {showOverlay ? (
                <ReportOverlayLayer>
                    {mode !== "idle" ? (
                        <>
                            <ReportMarkersLayer />
                            <ReportDraftMarker />
                            <ReportDraftForm />
                        </>
                    ) : null}
                </ReportOverlayLayer>
            ) : null}
        </ShadowReportRoot>
    );
}
