import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { ReportOverlayLayer } from "@/components/overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "@/components/panel/ReportControlPanel.js";
import { ReportDraftForm } from "@/components/panel/ReportDraftForm.js";
import { ReportDraftMarker } from "@/components/point/ReportDraftMarker.js";
import { ReportMarkersLayer } from "@/components/point/ReportMarkersLayer.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
import { ThemeScope } from "./ThemeScope.js";

export function ReportView() {
    const { showMarkerTargetPreview, resolvedPanelAppearance, resolvedTooltipAppearance } = useReportPreferences();
    const { mode, showTargetPreview, savedProbeEdits } = useReportSession();
    const hasSavedProbeEdits = Object.keys(savedProbeEdits).length > 0;
    const showOverlay = mode !== "idle" || showTargetPreview || showMarkerTargetPreview || hasSavedProbeEdits;

    return (
        <ShadowReportRoot panelAppearance={resolvedPanelAppearance}>
            <ThemeScope appearance={resolvedPanelAppearance}>
                <ReportControlPanel />
            </ThemeScope>

            {showOverlay ? (
                <ThemeScope appearance={resolvedTooltipAppearance}>
                    <ReportOverlayLayer>
                        {mode !== "idle" ? (
                            <>
                                <ReportMarkersLayer />
                                <ReportDraftMarker />
                                <ReportDraftForm />
                            </>
                        ) : null}
                    </ReportOverlayLayer>
                </ThemeScope>
            ) : null}
        </ShadowReportRoot>
    );
}
