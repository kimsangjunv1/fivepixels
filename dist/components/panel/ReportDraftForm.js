import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
export function ReportDraftForm() {
    const { draft, fields, isMobileViewport, isCreating, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit } = useReport();
    if (!draft) {
        return null;
    }
    return (_jsxs("div", { onClick: (event) => event.stopPropagation(), className: "pointer-events-auto fixed z-30 space-y-2 rounded-lg border border-slate-300 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900", style: {
            left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
            top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
            width: isMobileViewport ? "calc(100vw - 32px)" : 320,
        }, children: [_jsxs("p", { className: "text-sm font-semibold text-slate-900 dark:text-slate-100", children: [draft.reportType, " \u00B7 ", draft.reportId] }), _jsx("div", { className: "flex flex-col gap-2", children: _jsx(FieldEditor, { fields: fields, message: draft.message, fieldValues: draft.fieldValues, onMessageChange: updateDraftMessage, onFieldChange: updateDraftField }) }), _jsxs("div", { className: "mt-1 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: cancelDraft, className: "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: ["\uCDE8\uC18C", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.cancel, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: () => void handleCreateSubmit(), disabled: isCreating, className: "inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [isCreating ? "저장 중..." : "저장", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.submit, visible: visibleShortcutKeys })] }) })] })] }));
}
//# sourceMappingURL=ReportDraftForm.js.map