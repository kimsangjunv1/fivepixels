import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
import { reportStyles } from "../report/styles.js";
export function ReportDraftForm() {
    const { draft, fields, palette, isMobileViewport, isCreating, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit, } = useReport();
    if (!draft) {
        return null;
    }
    return (_jsxs("div", { onClick: (event) => event.stopPropagation(), style: {
            ...reportStyles.draftCard,
            left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
            top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
            width: isMobileViewport ? "calc(100vw - 32px)" : 320,
            backgroundColor: palette.card,
            borderColor: palette.panelBorder,
            color: palette.text,
        }, children: [_jsxs("p", { style: { margin: 0, fontSize: 13, fontWeight: 700 }, children: [draft.reportType, " \u00B7 ", draft.reportId] }), _jsx("div", { style: reportStyles.fieldStack, children: _jsx(FieldEditor, { fields: fields, message: draft.message, fieldValues: draft.fieldValues, palette: palette, onMessageChange: updateDraftMessage, onFieldChange: updateDraftField }) }), _jsxs("div", { style: reportStyles.buttonRow, children: [_jsx("button", { type: "button", onClick: cancelDraft, style: {
                            ...reportStyles.secondaryButton,
                            borderColor: palette.inputBorder,
                            color: palette.text,
                        }, children: _jsxs("span", { style: reportStyles.buttonWithHint, children: ["\uCDE8\uC18C", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.cancel, visible: visibleShortcutKeys, palette: palette })] }) }), _jsx("button", { type: "button", onClick: () => void handleCreateSubmit(), disabled: isCreating, style: {
                            ...reportStyles.primaryButton,
                            backgroundColor: "#2563eb",
                        }, children: _jsxs("span", { style: reportStyles.buttonWithHint, children: [isCreating ? "저장 중..." : "저장", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.submit, visible: visibleShortcutKeys, palette: palette })] }) })] })] }));
}
//# sourceMappingURL=ReportDraftForm.js.map