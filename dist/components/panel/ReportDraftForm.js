import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { btnPrimary, btnSecondary, cardSurface } from "../report/classes.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
export function ReportDraftForm() {
    const { draft, fields, isMobileViewport, isCreating, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit, } = useReport();
    if (!draft) {
        return null;
    }
    return (_jsxs("div", { onClick: (event) => event.stopPropagation(), className: cardSurface, style: {
            left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
            top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
            width: isMobileViewport ? "calc(100vw - 32px)" : 320,
        }, children: [_jsxs("p", { className: "mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100", children: [draft.reportType, " \u00B7 ", draft.reportId] }), _jsx("div", { className: "flex flex-col gap-3", children: _jsx(FieldEditor, { fields: fields, message: draft.message, fieldValues: draft.fieldValues, onMessageChange: updateDraftMessage, onFieldChange: updateDraftField }) }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("button", { type: "button", onClick: cancelDraft, className: `flex-1 ${btnSecondary}`, children: _jsxs("span", { className: "inline-flex items-center gap-1", children: ["\uCDE8\uC18C", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.cancel, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: () => void handleCreateSubmit(), disabled: isCreating, className: `flex-1 ${btnPrimary}`, children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [isCreating ? "저장 중..." : "저장", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.submit, visible: visibleShortcutKeys })] }) })] })] }));
}
//# sourceMappingURL=ReportDraftForm.js.map