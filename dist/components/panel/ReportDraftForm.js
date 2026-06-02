import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from "motion/react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { getDraftMarkerPosition, getDraftPopoverPosition } from "../../utils/coordinates.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
const DRAFT_MOTION_EASE = [0.22, 1, 0.36, 1];
function getTailPresentation(tailCorner) {
    switch (tailCorner) {
        case "bottom-left":
            return {
                bodyCorner: "rounded-bl-[5px]",
                hook: "bottom-0 -left-[5px] rounded-br-[17px_16px]",
                origin: "0% 100%",
            };
        case "bottom-right":
            return {
                bodyCorner: "rounded-br-[5px]",
                hook: "bottom-0 -right-[5px] left-auto rounded-bl-[17px_16px]",
                origin: "100% 100%",
            };
        case "top-left":
            return {
                bodyCorner: "rounded-tl-[5px]",
                hook: "top-0 -left-[5px] rounded-tr-[17px_16px]",
                origin: "0% 0%",
            };
        case "top-right":
            return {
                bodyCorner: "rounded-tr-[5px]",
                hook: "top-0 -right-[5px] left-auto rounded-tl-[17px_16px]",
                origin: "100% 0%",
            };
    }
}
export function ReportDraftForm() {
    const { draft, fields, isCreating, selectedTarget, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit, } = useReport();
    return (_jsx(AnimatePresence, { children: draft ? (_jsx(ReportDraftFormContent, { draft: draft, fields: fields, isCreating: isCreating, selectedTarget: selectedTarget, visibleShortcutKeys: visibleShortcutKeys, updateDraftMessage: updateDraftMessage, updateDraftField: updateDraftField, cancelDraft: cancelDraft, handleCreateSubmit: handleCreateSubmit })) : null }));
}
function ReportDraftFormContent({ draft, fields, isCreating, selectedTarget, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit, }) {
    const anchor = getDraftMarkerPosition(draft, selectedTarget);
    const { left, top, width, tailCorner } = getDraftPopoverPosition(anchor);
    const tail = getTailPresentation(tailCorner);
    return (_jsx(motion.div, { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.5, opacity: 0 }, transition: { duration: 0.28, ease: DRAFT_MOTION_EASE }, onClick: (event) => event.stopPropagation(), className: "pointer-events-auto fixed z-[1000001] text-xs", style: { left, top, width, transformOrigin: tail.origin }, children: _jsxs("div", { className: "relative overflow-visible", children: [_jsxs("div", { className: `relative z-10 flex flex-col gap-2.5 rounded-[22px] bg-[var(--adaptive-blue500,#3182f6)] p-3 pb-2.5 text-white shadow-[0_12px_28px_-8px_color-mix(in_srgb,var(--adaptive-blue700,#1b64da)_55%,transparent),0_4px_12px_-4px_rgba(15,23,42,0.28)] ${tail.bodyCorner}`, children: [_jsxs("p", { className: "text-[12px] font-bold leading-[1.2] text-white", children: [draft.reportType, " \u00B7 ", draft.reportId] }), _jsx("div", { className: "flex flex-col gap-2", children: _jsx(FieldEditor, { fields: fields, message: draft.message, fieldValues: draft.fieldValues, onMessageChange: updateDraftMessage, onFieldChange: updateDraftField, variant: "draft-bubble" }) }), _jsxs("div", { className: "flex items-center justify-end gap-2 pt-0.5", children: [_jsx("button", { type: "button", onClick: cancelDraft, className: "inline-flex items-center justify-center rounded-[10px] border border-white/55 px-2.5 py-1.5 text-[12px] font-semibold leading-none text-white hover:bg-white/12", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: ["\uCDE8\uC18C", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.cancel, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: () => void handleCreateSubmit(), disabled: isCreating, className: "inline-flex items-center justify-center rounded-[10px] border border-transparent bg-white px-2.5 py-1.5 text-[12px] font-semibold leading-none text-[var(--adaptive-blue700,#1b64da)] hover:bg-[color-mix(in_srgb,#fff_92%,var(--adaptive-blue100,#c9e2ff))] disabled:cursor-not-allowed disabled:opacity-50", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [isCreating ? "저장 중..." : "저장", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.submit, visible: visibleShortcutKeys })] }) })] })] }), _jsx("div", { "aria-hidden": true, className: `absolute z-0 h-[17px] w-[21px] bg-[var(--adaptive-blue500,#3182f6)] ${tail.hook}` })] }) }, "report-draft-form"));
}
//# sourceMappingURL=ReportDraftForm.js.map