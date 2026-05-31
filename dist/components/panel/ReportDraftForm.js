import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { stitchablePartProps } from "../report/parts.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
export function ReportDraftForm() {
    const { draft, fields, isMobileViewport, isCreating, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit, } = useReport();
    if (!draft) {
        return null;
    }
    return (_jsxs("div", { onClick: (event) => event.stopPropagation(), ...stitchablePartProps("draft-card"), style: {
            left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
            top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
            width: isMobileViewport ? "calc(100vw - 32px)" : 320,
        }, children: [_jsxs("p", { ...stitchablePartProps("draft-card-title"), children: [draft.reportType, " \u00B7 ", draft.reportId] }), _jsx("div", { ...stitchablePartProps("field-stack"), children: _jsx(FieldEditor, { fields: fields, message: draft.message, fieldValues: draft.fieldValues, onMessageChange: updateDraftMessage, onFieldChange: updateDraftField }) }), _jsxs("div", { ...stitchablePartProps("button-row"), children: [_jsx("button", { type: "button", onClick: cancelDraft, ...stitchablePartProps("secondary-button"), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: ["\uCDE8\uC18C", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.cancel, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: () => void handleCreateSubmit(), disabled: isCreating, ...stitchablePartProps("primary-button"), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [isCreating ? "저장 중..." : "저장", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.submit, visible: visibleShortcutKeys })] }) })] })] }));
}
//# sourceMappingURL=ReportDraftForm.js.map