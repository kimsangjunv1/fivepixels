import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "@/providers/reportContext.js";
import { ReportOverlayLayer } from "@/components/overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "@/components/panel/ReportControlPanel.js";
import { ReportDraftForm } from "@/components/panel/ReportDraftForm.js";
import { ReportDraftMarker } from "@/components/point/ReportDraftMarker.js";
import { ReportMarkersLayer } from "@/components/point/ReportMarkersLayer.js";
import { ShadowReportRoot } from "./ShadowReportRoot.js";
export function ReportView() {
    const { mode, showTargetPreview, resolvedAppearance } = useReport();
    const showOverlay = mode !== "idle" || showTargetPreview;
    return (_jsxs(ShadowReportRoot, { appearance: resolvedAppearance, children: [_jsx(ReportControlPanel, {}), showOverlay ? (_jsx(ReportOverlayLayer, { children: mode !== "idle" ? (_jsxs(_Fragment, { children: [_jsx(ReportMarkersLayer, {}), _jsx(ReportDraftMarker, {}), _jsx(ReportDraftForm, {})] })) : null })) : null] }));
}
//# sourceMappingURL=ReportView.js.map