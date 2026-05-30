import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { ReportOverlayLayer } from "../overlay/ReportOverlayLayer.js";
import { ReportControlPanel } from "../panel/ReportControlPanel.js";
import { ReportDraftForm } from "../panel/ReportDraftForm.js";
import { ReportFeedbackList } from "../panel/ReportFeedbackList.js";
import { ReportMarkersLayer } from "../point/ReportMarkersLayer.js";
export function ReportView() {
    const { mode, showFeedbackList } = useReport();
    return (_jsxs(_Fragment, { children: [_jsx(ReportControlPanel, {}), mode !== "idle" ? (_jsxs(ReportOverlayLayer, { children: [_jsx(ReportMarkersLayer, {}), _jsx(ReportDraftForm, {})] })) : null, mode === "view" && showFeedbackList ? _jsx(ReportFeedbackList, {}) : null] }));
}
//# sourceMappingURL=ReportView.js.map