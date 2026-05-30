import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { ReportOverlayLayer } from "../overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "../panel/ReportControlPanel.js";
import { ReportDraftForm } from "../panel/ReportDraftForm.js";
import { ReportFeedbackList } from "../panel/ReportFeedbackList.js";
import { ReportMarkersLayer } from "../point/ReportMarkersLayer.js";
export function ReportView() {
    const { mode, showFeedbackList, showTargetPreview } = useReport();
    const showOverlay = mode !== "idle" || showTargetPreview;
    return (_jsxs(_Fragment, { children: [_jsx(ReportControlPanel, {}), showOverlay ? (_jsx(ReportOverlayLayer, { children: mode !== "idle" ? (_jsxs(_Fragment, { children: [_jsx(ReportMarkersLayer, {}), _jsx(ReportDraftForm, {})] })) : null })) : null, mode === "view" && showFeedbackList ? _jsx(ReportFeedbackList, {}) : null] }));
}
//# sourceMappingURL=ReportView.js.map