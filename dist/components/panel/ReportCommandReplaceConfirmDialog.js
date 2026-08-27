import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences } from "../../providers/reportContext.js";
import { getIssueSummary } from "../../utils/report/reportCases.js";
import { ReportPanelNoticeDialog } from "./ReportPanelNoticeDialog.js";
export function ReportCommandReplaceConfirmDialog({ conflicts, onConfirm, onCancel }) {
    const { messages } = useReportPreferences();
    return (_jsx(ReportPanelNoticeDialog, { title: messages.commandReplace.title, description: messages.commandReplace.description, sectioned: true, actions: [
            {
                id: "cancel",
                label: messages.common.cancel,
                variant: "muted",
                onClick: onCancel,
            },
            {
                id: "confirm",
                label: messages.common.confirm,
                variant: "primary",
                onClick: onConfirm,
            },
        ], children: conflicts.map((conflict) => (_jsxs("section", { className: "border-t border-[var(--adaptive-black200)] p-[12px]", children: [_jsxs("dl", { className: "mb-[8px] grid grid-cols-[72px_1fr] gap-[8px] text-[12px]", children: [_jsx("dt", { className: "font-medium text-[var(--adaptive-black500)]", children: messages.commandReplace.idLabel }), _jsx("dd", { className: "break-all text-[var(--adaptive-black800)]", children: conflict.id }), _jsx("dt", { className: "font-medium text-[var(--adaptive-black500)]", children: messages.commandReplace.reportIdLabel }), _jsx("dd", { className: "break-all text-[var(--adaptive-black800)]", children: conflict.existing.report_id })] }), _jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black700)]", children: messages.commandReplace.existingMessage }), _jsx("p", { className: "rounded-[8px] bg-[var(--adaptive-surface)] p-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-text-secondary)]", children: getIssueSummary(conflict.existing, { summaryMore: messages.cases.summaryMore }) })] }), _jsxs("section", { className: "mt-[8px] flex flex-col gap-[4px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black700)]", children: messages.commandReplace.replacementMessage }), _jsx("p", { className: "rounded-[8px] bg-[var(--adaptive-surface)] p-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-blue500)]", children: getIssueSummary(conflict.incoming, { summaryMore: messages.cases.summaryMore }) })] })] }, conflict.id))) }));
}
//# sourceMappingURL=ReportCommandReplaceConfirmDialog.js.map