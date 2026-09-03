import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences } from "../../shared/providers/reportContext.js";
import { buildProjectComparisonLines } from "../../shared/utils/feedback/feedbackTransferSchema.js";
import { NoticeDialog } from "../../shared/components/ui/NoticeDialog.js";
function formatExportedAt(value, noneLabel, locale) {
    if (!value) {
        return noneLabel;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString(locale);
}
export function ReportImportProjectMismatchDialog({ currentProject, importedProject, exportedAt, onProceed, onCancel }) {
    const { locale, messages } = useReportPreferences();
    const comparisonLines = buildProjectComparisonLines(currentProject, importedProject);
    return (_jsxs(NoticeDialog, { title: messages.importMismatch.title, description: messages.importMismatch.description, sectioned: true, actions: [
            {
                id: "cancel",
                label: messages.common.cancel,
                variant: "muted",
                onClick: onCancel,
            },
            {
                id: "proceed",
                label: messages.common.proceed,
                variant: "primary",
                onClick: onProceed,
            },
        ], children: [_jsxs("section", { className: "flex flex-col gap-[4px] p-[12px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black700)]", children: messages.importMismatch.currentData }), _jsx("dl", { children: comparisonLines.map((line) => (_jsxs("div", { className: "grid grid-cols-[112px_1fr] gap-[8px] text-[12px]", children: [_jsx("p", { className: "font-medium text-[var(--adaptive-black500)]", children: line.label }), _jsx("p", { className: `${line.differs ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black800)]"}`, children: line.current })] }, line.label))) })] }), _jsxs("section", { className: "flex flex-col gap-[4px] p-[12px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black700)]", children: messages.importMismatch.updatedData }), _jsxs("dl", { children: [comparisonLines.map((line) => (_jsxs("div", { className: "grid grid-cols-[112px_1fr] gap-[8px] text-[12px]", children: [_jsx("p", { className: "font-medium text-[var(--adaptive-black500)]", children: line.label }), _jsx("p", { className: `${line.differs ? "text-rose-700" : "text-[var(--adaptive-black800)]"}`, children: line.imported })] }, line.label))), _jsxs("div", { className: "grid grid-cols-[112px_1fr] gap-[8px] text-[12px]", children: [_jsx("p", { className: "font-medium text-[var(--adaptive-black500)]", children: messages.importMismatch.exportedAtLabel }), _jsx("p", { className: "text-[var(--adaptive-black800)]", children: formatExportedAt(exportedAt, messages.common.none, locale === "ko" ? "ko-KR" : "en-US") })] })] })] })] }));
}
//# sourceMappingURL=ReportImportProjectMismatchDialog.js.map