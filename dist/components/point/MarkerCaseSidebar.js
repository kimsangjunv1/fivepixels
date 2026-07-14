import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_STATUS_COLOR } from "../../constants/feedbackStatus.js";
import { CheckIcon } from "../../components/icons/Icons.js";
import { useReport } from "../../providers/reportContext.js";
import { getCaseLatestStatus } from "../../utils/feedbackThread.js";
import { getReportCases } from "../../utils/reportCases.js";
function CaseStatusIndicator({ caseStatus }) {
    if (caseStatus === "resolved") {
        return (_jsx("span", { "aria-hidden": true, className: "inline-flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-full", style: { backgroundColor: FEEDBACK_STATUS_COLOR.resolved }, children: _jsx(CheckIcon, { className: "h-[8px] w-[8px] text-white" }) }));
    }
    return (_jsx("span", { "aria-hidden": true, className: "inline-flex h-[12px] w-[12px] shrink-0 rounded-full border border-[var(--adaptive-black300)]" }));
}
function CaseStatusLabel({ status, isNeedGray }) {
    const { messages } = useReport();
    const color = FEEDBACK_STATUS_COLOR[status];
    return (_jsx("span", { className: "shrink-0 whitespace-nowrap text-[11px] font-semibold leading-none", style: { color: isNeedGray ? "var(--adaptive-black500)" : color }, children: messages.status.feedback[status] }));
}
export function MarkerCaseSidebar({ report, focusedCaseId, onSelectCase }) {
    const { messages } = useReport();
    const cases = getReportCases(report);
    return (_jsxs("div", { className: "flex min-h-0 flex-1 flex-col overflow-hidden", children: [_jsx("p", { className: "shrink-0 px-[14px] pb-[8px] pt-[4px] text-[12px] font-semibold text-[var(--adaptive-black500)]", children: messages.cases.title }), _jsx("ul", { className: "flex min-h-0 flex-1 flex-col gap-[2px] overflow-auto px-[6px] pb-[10px]", children: cases.map((item) => {
                    const isActive = item.id === focusedCaseId;
                    const status = getCaseLatestStatus(report, item.id);
                    return (_jsx("li", { children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-current": isActive, onClick: () => onSelectCase(item.id), className: `flex flex-col w-full items-start justify-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left transition-colors ${isActive ? "bg-[var(--adaptive-neutralTintOpacity900)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-tintOpacity100)]"}`, children: [_jsxs("section", { className: "flex items-center gap-[4px] w-full", children: [_jsx(CaseStatusIndicator, { caseStatus: item.status }), _jsx("span", { className: `min-w-0 flex-1 w-full truncate text-[14px] leading-[1] ${item.status === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`, title: item.text, children: item.text })] }), _jsx(CaseStatusLabel, { status: status, isNeedGray: true })] }) }, item.id));
                }) })] }));
}
//# sourceMappingURL=MarkerCaseSidebar.js.map