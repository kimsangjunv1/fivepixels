import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport, useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { formatApiFlowSummaryLine } from "../../utils/network/formatApiFlowEntry.js";
export function DraftNetworkErrorBanner() {
    const { messages } = useReportPreferences();
    const { draft } = useReportSession();
    const { activeApiFailureAlert, appendApiFlowEntryToDraftCase } = useReport();
    if (!draft || !activeApiFailureAlert) {
        return null;
    }
    return (_jsxs("section", { className: "flex items-center gap-[8px] border-b border-rose-100 bg-rose-50 px-[12px] py-[8px]", "data-fivepixels-interactive": "", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-[11px] font-semibold text-rose-800", children: messages.apiFlow.draftBannerTitle }), _jsx("p", { className: "mt-[2px] text-[11px] leading-[1.4] text-rose-700", children: formatApiFlowSummaryLine(activeApiFailureAlert, messages) })] }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => appendApiFlowEntryToDraftCase(activeApiFailureAlert.id), className: "shrink-0 rounded-[8px] bg-rose-700 px-[10px] py-[4px] text-[11px] font-semibold text-white", children: messages.apiFlow.draftBannerAttach })] }));
}
//# sourceMappingURL=DraftNetworkErrorBanner.js.map