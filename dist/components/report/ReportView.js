import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { ReportOverlayLayer } from "../../components/overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "../../components/panel/ReportControlPanel.js";
import { ReportDraftForm } from "../../components/panel/ReportDraftForm.js";
import { ReportDraftMarker } from "../../components/point/ReportDraftMarker.js";
import { ReportMarkersLayer } from "../../components/point/ReportMarkersLayer.js";
import { DotWaveOverlay } from "../../components/overlay/DotWaveOverlay.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
import { ThemeScope } from "./ThemeScope.js";
const FEEDBACK_SUCCESS_DOT_COLOR = "#22c55e";
const FEEDBACK_ERROR_DOT_COLOR = "#ef4444";
const FEEDBACK_SUCCESS_HOLD_MS = 250;
export function ReportView() {
    const { showMarkerTargetPreview, resolvedPanelAppearance, resolvedTooltipAppearance, markerAppearance } = useReportPreferences();
    const { mode, showTargetPreview, savedProbeEdits, draft, draftStep, errorMessage } = useReportSession();
    const hasSavedProbeEdits = Object.keys(savedProbeEdits).length > 0;
    const showOverlay = mode !== "idle" || showTargetPreview || showMarkerTargetPreview || hasSavedProbeEdits;
    const feedbackModeDotColor = markerAppearance.feedbackModeDotColors[resolvedPanelAppearance];
    const isDraftCategoryStep = mode === "report" && Boolean(draft) && draftStep === "category";
    const hasDraftContentError = mode === "report" && Boolean(draft) && draftStep === "content" && Boolean(errorMessage);
    const resolvedFeedbackModeDotColor = isDraftCategoryStep ? FEEDBACK_SUCCESS_DOT_COLOR : hasDraftContentError ? FEEDBACK_ERROR_DOT_COLOR : feedbackModeDotColor;
    return (_jsxs(ShadowReportRoot, { panelAppearance: resolvedPanelAppearance, children: [_jsx(ThemeScope, { appearance: resolvedPanelAppearance, className: "pointer-events-none fixed inset-0 z-[999998]", children: _jsx(DotWaveOverlay, { active: mode === "report" && !isDraftCategoryStep, color: resolvedFeedbackModeDotColor, deactivateDelay: isDraftCategoryStep ? FEEDBACK_SUCCESS_HOLD_MS : 0 }) }), _jsx(ThemeScope, { appearance: resolvedPanelAppearance, children: _jsx(ReportControlPanel, {}) }), showOverlay ? (_jsx(ThemeScope, { appearance: resolvedTooltipAppearance, children: _jsx(ReportOverlayLayer, { children: mode !== "idle" ? (_jsxs(_Fragment, { children: [_jsx(ReportMarkersLayer, {}), _jsx(ReportDraftMarker, {}), _jsx(ReportDraftForm, {})] })) : null }) })) : null] }));
}
//# sourceMappingURL=ReportView.js.map