import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useReport, useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { formatApiFlowSummaryLine } from "../../utils/network/formatApiFlowEntry.js";
export function PanelNetworkFailureBanner() {
    const { messages } = useReportPreferences();
    const { activeApiFailureAlert, dismissFailureAlert, openPanelTab, networkMonitorEnabled } = useReport();
    const { draft } = useReportSession();
    if (!networkMonitorEnabled || !activeApiFailureAlert || draft) {
        return null;
    }
    return (_jsxs("section", { className: "flex shrink-0 items-center gap-[8px] border-b border-rose-100 bg-rose-50 px-[10px] py-[6px]", "data-fivepixels-interactive": "", children: [_jsxs("p", { className: "min-w-0 flex-1 truncate text-[11px] font-semibold text-rose-800", children: [messages.apiFlow.alertTitle, " ", formatApiFlowSummaryLine(activeApiFailureAlert, messages)] }), _jsx("button", { type: "button", onClick: () => openPanelTab("api-flow"), className: "shrink-0 rounded-[6px] border border-rose-200 bg-white px-[8px] py-[3px] text-[11px] font-semibold text-rose-800", children: messages.apiFlow.alertOpenTab }), _jsx("button", { type: "button", onClick: () => dismissFailureAlert(activeApiFailureAlert.id), className: "shrink-0 rounded-[6px] border border-rose-200 bg-white px-[8px] py-[3px] text-[11px] font-semibold text-rose-700", children: messages.apiFlow.alertDismiss })] }));
}
//# sourceMappingURL=PanelNetworkFailureBanner.js.map