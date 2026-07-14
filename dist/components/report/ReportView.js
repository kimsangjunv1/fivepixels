import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { ReportOverlayLayer } from "../../components/overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "../../components/panel/ReportControlPanel.js";
import { ReportDraftForm } from "../../components/panel/ReportDraftForm.js";
import { ReportDraftMarker } from "../../components/point/ReportDraftMarker.js";
import { ReportMarkersLayer } from "../../components/point/ReportMarkersLayer.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
import { ThemeScope } from "./ThemeScope.js";
export function ReportView() {
    const { mode, showTargetPreview, showMarkerTargetPreview, resolvedPanelAppearance, resolvedTooltipAppearance, savedProbeEdits, } = useReport();
    const hasSavedProbeEdits = Object.keys(savedProbeEdits).length > 0;
    const showOverlay = mode !== "idle" || showTargetPreview || showMarkerTargetPreview || hasSavedProbeEdits;
    return (_jsxs(ShadowReportRoot, { panelAppearance: resolvedPanelAppearance, children: [_jsx(ThemeScope, { appearance: resolvedPanelAppearance, children: _jsx(ReportControlPanel, {}) }), showOverlay ? (_jsx(ThemeScope, { appearance: resolvedTooltipAppearance, children: _jsx(ReportOverlayLayer, { children: mode !== "idle" ? (_jsxs(_Fragment, { children: [_jsx(ReportMarkersLayer, {}), _jsx(ReportDraftMarker, {}), _jsx(ReportDraftForm, {})] })) : null }) })) : null] }));
}
//# sourceMappingURL=ReportView.js.map