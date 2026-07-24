import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { ReportOverlayLayer } from "../../components/overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "../../components/panel/ReportControlPanel.js";
import { ReportDraftForm } from "../../components/panel/ReportDraftForm.js";
import { ReportDraftMarker } from "../../components/point/ReportDraftMarker.js";
import { ReportMarkersLayer } from "../../components/point/ReportMarkersLayer.js";
import { DotWaveOverlay } from "../../components/overlay/DotWaveOverlay.js";
import { FloatingPinRail } from "../../components/overlay/FloatingPinRail.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
import { ThemeScope } from "./ThemeScope.js";
const FEEDBACK_ERROR_DOT_COLOR = "#ef4444";
export function ReportView() {
    const { showMarkerTargetPreview, resolvedPanelAppearance, resolvedTooltipAppearance, markerAppearance } = useReportPreferences();
    const { mode, showTargetPreview, savedProbeEdits, draft, errorMessage } = useReportSession();
    const hasSavedProbeEdits = Object.keys(savedProbeEdits).length > 0;
    const showOverlay = mode !== "idle" || showTargetPreview || showMarkerTargetPreview || hasSavedProbeEdits;
    const feedbackModeDotColor = markerAppearance.feedbackModeDotColors[resolvedPanelAppearance];
    const hasDraftContentError = mode === "report" && Boolean(draft) && Boolean(errorMessage);
    const resolvedFeedbackModeDotColor = hasDraftContentError ? FEEDBACK_ERROR_DOT_COLOR : feedbackModeDotColor;
    return (_jsxs(ShadowReportRoot, { panelAppearance: resolvedPanelAppearance, children: [_jsx(ThemeScope, { appearance: resolvedPanelAppearance, className: "pointer-events-none fixed inset-0 z-[999998]", children: _jsx(DotWaveOverlay, { active: mode === "report", color: resolvedFeedbackModeDotColor }) }), _jsxs(ThemeScope, { appearance: resolvedPanelAppearance, children: [_jsx(ReportControlPanel, {}), _jsx(FloatingPinRail, {})] }), showOverlay ? (_jsx(ThemeScope, { appearance: resolvedTooltipAppearance, children: _jsx(ReportOverlayLayer, { children: mode !== "idle" ? (_jsxs(_Fragment, { children: [_jsx(ReportMarkersLayer, {}), _jsx(ReportDraftMarker, {}), _jsx(ReportDraftForm, {})] })) : null }) })) : null] }));
}
//# sourceMappingURL=ReportView.js.map