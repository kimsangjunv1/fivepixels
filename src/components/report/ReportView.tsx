import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { ReportOverlayLayer } from "@/components/overlay/ReportOverlayLayer.js";
import { DevicePreviewChrome } from "@/components/overlay/DevicePreviewChrome.js";
import { ReportControlPanel } from "@/components/panel/ReportControlPanel.js";
import { ReportDraftForm } from "@/components/panel/ReportDraftForm.js";
import { ReportDraftMarker } from "@/components/point/ReportDraftMarker.js";
import { ReportMarkersLayer } from "@/components/point/ReportMarkersLayer.js";
import { DotWaveOverlay } from "@/components/overlay/DotWaveOverlay.js";
import { FloatingPinRail } from "@/components/overlay/FloatingPinRail.js";
import { useOverlayChrome } from "@/hooks/useOverlayChrome.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
import { ThemeScope } from "./ThemeScope.js";

const FEEDBACK_ERROR_DOT_COLOR = "#ef4444";

export function ReportView() {
    const {
        showMarkerTargetPreview,
        devicePreviewUiOpen,
        resolvedPanelAppearance,
        resolvedTooltipAppearance,
        markerAppearance,
        pinnedFeedbackItems,
        pinRailCollapsed,
        setPinRailCollapsed,
    } = useReportPreferences();
    const { mode, showTargetPreview, savedProbeEdits, draft, errorMessage, panelCollapsed, setPanelCollapsed } = useReportSession();
    const hasSavedProbeEdits = Object.keys(savedProbeEdits).length > 0;
    const showOverlay = mode !== "idle" || showTargetPreview || showMarkerTargetPreview || hasSavedProbeEdits;
    const feedbackModeDotColor = markerAppearance.feedbackModeDotColors[resolvedPanelAppearance];
    const hasDraftContentError = mode === "report" && Boolean(draft) && Boolean(errorMessage);
    const resolvedFeedbackModeDotColor = hasDraftContentError ? FEEDBACK_ERROR_DOT_COLOR : feedbackModeDotColor;

    useOverlayChrome({
        mode,
        panelCollapsed,
        setPanelCollapsed,
        pinRailCollapsed,
        setPinRailCollapsed,
        hasPins: pinnedFeedbackItems.length > 0,
    });

    return (
        <ShadowReportRoot panelAppearance={resolvedPanelAppearance}>
            <ThemeScope
                appearance={resolvedPanelAppearance}
                className="pointer-events-none fixed inset-0 z-[999998]"
            >
                <DotWaveOverlay
                    active={mode === "report"}
                    color={resolvedFeedbackModeDotColor}
                />
            </ThemeScope>

            <ThemeScope appearance={resolvedPanelAppearance}>
                <ReportControlPanel />
                <FloatingPinRail />
            </ThemeScope>

            {devicePreviewUiOpen ? (
                <ThemeScope appearance={resolvedPanelAppearance}>
                    <DevicePreviewChrome />
                </ThemeScope>
            ) : null}

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
