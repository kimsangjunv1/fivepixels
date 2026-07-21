import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { InfoIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "../../../utils/report/reportCases.js";
export function CaseAssigneeInfo({ caseItem, authors }) {
    const { messages } = useReportPreferences();
    const currentAssignee = caseItem.assignee_name?.trim() ?? "";
    const previousAssignee = caseItem.previous_assignee_name?.trim() ?? "";
    if (!currentAssignee) {
        return null;
    }
    const currentDepartment = resolveAuthorDepartment(authors, currentAssignee);
    const previousDepartment = previousAssignee ? resolveAuthorDepartment(authors, previousAssignee) : null;
    const currentLabel = formatAssigneeLabel(currentAssignee, currentDepartment);
    const previousLabel = previousAssignee ? formatAssigneeLabel(previousAssignee, previousDepartment) : messages.common.none;
    const tooltipContent = (_jsxs("span", { className: "flex flex-col gap-[2px]", children: [_jsxs("span", { className: "text-[var(--adaptive-red500)]", children: ["- ", messages.marker.previousAssignee, ": ", previousLabel] }), _jsxs("span", { className: "text-[var(--adaptive-green500)]", children: ["+ ", messages.marker.currentAssignee, ": ", currentLabel] })] }));
    return (_jsxs("div", { className: "flex min-w-0 items-center gap-[6px] text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: [_jsx("span", { className: "min-w-0 truncate", title: currentLabel, children: currentLabel }), _jsx(HoverTooltip, { multiline: true, content: tooltipContent, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.marker.assigneeInfoAriaLabel, className: "flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: _jsx(InfoIcon, { className: "h-[13px] w-[13px]" }) }) })] }));
}
//# sourceMappingURL=CaseAssigneeInfo.js.map