import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences, useReportSession } from "../shared/providers/reportContext.js";
import { TooltipLayer } from "../surfaces/tooltip/TooltipLayer.js";
import { DevicePreview } from "../surfaces/preview/DevicePreview.js";
import { NotificationCenter } from "../surfaces/window/NotificationCenter.js";
import { Panel } from "../surfaces/panel/Panel.js";
import { DraftTooltip } from "../surfaces/tooltip/DraftTooltip.js";
import { DraftMarker } from "../surfaces/marker/DraftMarker.js";
import { MarkerLayer } from "../surfaces/marker/MarkerLayer.js";
import { WindowLayer } from "../surfaces/window/WindowLayer.js";
import { DotWaveOverlay } from "../core/DotWaveOverlay.js";
import { useOverlayChrome } from "../shared/hooks/useOverlayChrome.js";
import { MobilePreviewWindow } from "../surfaces/window/MobilePreviewWindow.js";
import { isInsidePreviewGuestFrame } from "../surfaces/preview/previewGuestFrame.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
import { ThemeScope } from "./ThemeScope.js";
const FEEDBACK_ERROR_DOT_COLOR = "#ef4444";
export function ReportView() {
    const { showMarkerTargetPreview, mobilePreviewUiOpen, devicePreviewUiOpen, resolvedPanelAppearance, resolvedTooltipAppearance, markerAppearance, } = useReportPreferences();
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
    return (_jsxs(ShadowReportRoot, { tooltipAppearance: resolvedTooltipAppearance, children: [showHostDevicePreview ? (_jsx(ThemeScope, { appearance: resolvedPanelAppearance, children: _jsx(DevicePreview, {}) })) : null, _jsx(ThemeScope, { appearance: resolvedPanelAppearance, className: "pointer-events-none fixed inset-0 z-[999998]", children: _jsx(DotWaveOverlay, { active: mode === "report", color: resolvedFeedbackModeDotColor }) }), _jsx(ThemeScope, { appearance: resolvedPanelAppearance, children: _jsx(Panel, {}) }), showMobilePreviewWindow ? (_jsx(ThemeScope, { appearance: resolvedPanelAppearance, children: _jsx(MobilePreviewWindow, {}) })) : null, _jsx(ThemeScope, { appearance: resolvedPanelAppearance, children: _jsx(NotificationCenter, { open: notificationUiOpen }) }), showOverlay ? (_jsx(ThemeScope, { appearance: resolvedTooltipAppearance, children: _jsxs(TooltipLayer, { children: [mode !== "idle" ? (_jsxs(_Fragment, { children: [_jsx(MarkerLayer, {}), _jsx(DraftMarker, {}), _jsx(DraftTooltip, {})] })) : null, _jsx(WindowLayer, {})] }) })) : null] }));
}
//# sourceMappingURL=ReportView.js.map