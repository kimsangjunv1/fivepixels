import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { TooltipLayer } from "@/tooltip/TooltipLayer.js";
import { DevicePreview } from "@/preview/DevicePreview.js";
import { NotificationCenter } from "@/modal/NotificationCenter.js";
import { Panel } from "@/panel/Panel.js";
import { DraftTooltip } from "@/tooltip/DraftTooltip.js";
import { DraftMarker } from "@/marker/DraftMarker.js";
import { MarkerLayer } from "@/marker/MarkerLayer.js";
import { WindowLayer } from "@/window/WindowLayer.js";
import { DotWaveOverlay } from "@/core/DotWaveOverlay.js";
import { useOverlayChrome } from "@/hooks/useOverlayChrome.js";
import { MobilePreviewWindow } from "@/window/MobilePreviewWindow.js";
import { isInsidePreviewGuestFrame } from "@/preview/previewGuestFrame.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
import { ThemeScope } from "./ThemeScope.js";

const FEEDBACK_ERROR_DOT_COLOR = "#ef4444";

export function ReportView() {
    const {
        showMarkerTargetPreview,
        mobilePreviewUiOpen,
        devicePreviewUiOpen,
        resolvedPanelAppearance,
        resolvedTooltipAppearance,
        markerAppearance,
    } = useReportPreferences();
    const { mode, showTargetPreview, savedProbeEdits, draft, errorMessage, openReplyReportIds, notificationUiOpen } = useReportSession();
    const hasSavedProbeEdits = Object.keys(savedProbeEdits).length > 0;
    const hasOpenWindows = openReplyReportIds.length > 0;
    const showOverlay = mode !== "idle" || showTargetPreview || showMarkerTargetPreview || hasSavedProbeEdits || hasOpenWindows;
    const feedbackModeDotColor = markerAppearance.feedbackModeDotColors[resolvedPanelAppearance];
    const hasDraftContentError = mode === "report" && Boolean(draft) && Boolean(errorMessage);
    const resolvedFeedbackModeDotColor = hasDraftContentError ? FEEDBACK_ERROR_DOT_COLOR : feedbackModeDotColor;
    const isPreviewGuest = isInsidePreviewGuestFrame();
    const showHostDevicePreview = devicePreviewUiOpen && !isPreviewGuest;
    const showMobilePreviewWindow = mobilePreviewUiOpen && !isPreviewGuest;

    useOverlayChrome({
        mode,
    });

    if (isPreviewGuest) {
        return null;
    }

    return (
        <ShadowReportRoot tooltipAppearance={resolvedTooltipAppearance}>
            {showHostDevicePreview ? (
                <ThemeScope appearance={resolvedPanelAppearance}>
                    <DevicePreview />
                </ThemeScope>
            ) : null}

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
                <Panel />
            </ThemeScope>

            {showMobilePreviewWindow ? (
                <ThemeScope appearance={resolvedPanelAppearance}>
                    <MobilePreviewWindow />
                </ThemeScope>
            ) : null}

            {notificationUiOpen ? (
                <ThemeScope appearance={resolvedPanelAppearance}>
                    <NotificationCenter />
                </ThemeScope>
            ) : null}

            {showOverlay ? (
                <ThemeScope appearance={resolvedTooltipAppearance}>
                    <TooltipLayer>
                        {mode !== "idle" ? (
                            <>
                                <MarkerLayer />
                                <DraftMarker />
                                <DraftTooltip />
                            </>
                        ) : null}
                        <WindowLayer />
                    </TooltipLayer>
                </ThemeScope>
            ) : null}
        </ShadowReportRoot>
    );
}
