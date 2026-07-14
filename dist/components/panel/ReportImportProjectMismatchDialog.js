import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences } from "../../providers/reportContext.js";
import { buildProjectComparisonLines } from "../../utils/feedback/feedbackTransferSchema.js";
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
    return (_jsxs("article", { className: "bg-[var(--adaptive-grey100)]", children: [_jsxs("section", { className: "flex flex-col gap-[4px] p-[16px]", children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: messages.importMismatch.title }), _jsx("p", { className: "leading-[1.5] text-[var(--adaptive-black500)]", children: messages.importMismatch.description })] }), _jsxs("section", { className: "flex flex-col gap-[4px] p-[12px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black700)]", children: messages.importMismatch.currentData }), _jsx("dl", { className: "", children: comparisonLines.map((line) => (_jsxs("div", { className: "grid grid-cols-[112px_1fr] gap-[8px] text-[12px]", children: [_jsx("p", { className: "font-medium text-[var(--adaptive-black500)]", children: line.label }), _jsx("p", { className: `${line.differs ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black800)]"}`, children: line.current })] }, line.label))) })] }), _jsxs("section", { className: "flex flex-col gap-[4px] p-[12px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black700)]", children: messages.importMismatch.updatedData }), _jsxs("dl", { className: "", children: [comparisonLines.map((line) => (_jsxs("div", { className: "grid grid-cols-[112px_1fr] gap-[8px] text-[12px]", children: [_jsx("p", { className: "font-medium text-[var(--adaptive-black500)]", children: line.label }), _jsx("p", { className: `${line.differs ? "text-rose-700" : "text-[var(--adaptive-black800)]"}`, children: line.imported })] }, line.label))), _jsxs("div", { className: "grid grid-cols-[112px_1fr] gap-[8px] text-[12px]", children: [_jsx("p", { className: "font-medium text-[var(--adaptive-black500)]", children: messages.importMismatch.exportedAtLabel }), _jsx("p", { className: "text-[var(--adaptive-black800)]", children: formatExportedAt(exportedAt, messages.common.none, locale === "ko" ? "ko-KR" : "en-US") })] })] })] }), _jsxs("section", { className: "flex items-center justify-end gap-[10px] p-[16px]", children: [_jsx("button", { type: "button", onClick: onCancel, className: "bg-[var(--adaptive-grey300)] p-[4px_8px] rounded-[8px] font-semibold text-[var(--adaptive-black700)] border border-transparent", children: messages.common.cancel }), _jsx("button", { type: "button", onClick: onProceed, className: "bg-[var(--adaptive-blue100)] p-[4px_8px] rounded-[8px] font-bold text-[var(--adaptive-blue500)] border border-transparent", children: messages.common.proceed })] })] }));
}
//# sourceMappingURL=ReportImportProjectMismatchDialog.js.map