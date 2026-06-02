import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from "motion/react";
import { useReport } from "../../providers/reportContext.js";
import { DRAFT_POPOVER_CONNECTOR_WIDTH, getDraftMarkerPosition, getDraftPopoverPosition } from "../../utils/coordinates.js";
import { FieldEditor } from "./FieldEditor.js";
const DRAFT_MOTION_EASE = [0.22, 1, 0.36, 1];
function getMotionOrigin(placement) {
    switch (placement) {
        case "right":
            return "0% 50%";
        case "left":
            return "100% 50%";
        case "bottom":
            return "50% 0%";
        case "top":
            return "50% 100%";
    }
}
function DraftPopoverConnector({ placement }) {
    if (placement !== "right" && placement !== "left") {
        return null;
    }
    const baseClass = "pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 bg-[var(--adaptive-grey500)]";
    if (placement === "right") {
        return (_jsx("div", { "aria-hidden": true, className: `${baseClass} left-0 -translate-x-full`, style: { width: DRAFT_POPOVER_CONNECTOR_WIDTH } }));
    }
    return (_jsx("div", { "aria-hidden": true, className: `${baseClass} right-0 translate-x-full`, style: { width: DRAFT_POPOVER_CONNECTOR_WIDTH } }));
}
export function ReportDraftForm() {
    const { draft, fields, isCreating, selectedTarget, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit } = useReport();
    return (_jsx(AnimatePresence, { children: draft ? (_jsx(ReportDraftFormContent, { draft: draft, fields: fields, isCreating: isCreating, selectedTarget: selectedTarget, visibleShortcutKeys: visibleShortcutKeys, updateDraftMessage: updateDraftMessage, updateDraftField: updateDraftField, cancelDraft: cancelDraft, handleCreateSubmit: handleCreateSubmit })) : null }));
}
function ReportDraftFormContent({ draft, fields, isCreating, selectedTarget, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit, }) {
    const anchor = getDraftMarkerPosition(draft, selectedTarget);
    const { left, top, anchorCenterY, width, placement, centerVertically } = getDraftPopoverPosition(anchor);
    const verticalOffset = centerVertically ? "-50%" : 0;
    const checkboxFields = fields.filter((field) => field.type === "checkbox");
    return (_jsx(motion.div, { initial: { y: verticalOffset }, animate: { y: verticalOffset }, exit: { y: verticalOffset }, 
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // exit={{ opacity: 0 }}
        // initial={{ scale: 0.95, opacity: 0, y: verticalOffset }}
        // animate={{ scale: 1, opacity: 1, y: verticalOffset }}
        // exit={{ scale: 0.95, opacity: 0, y: verticalOffset }}
        transition: { duration: 0.25, ease: DRAFT_MOTION_EASE }, onClick: (event) => event.stopPropagation(), className: "pointer-events-auto fixed z-[1000001] text-xs", style: {
            left,
            top: centerVertically ? anchorCenterY : top,
            width,
            transformOrigin: getMotionOrigin(placement),
        }, children: _jsx("div", { className: "relative overflow-visible", children: _jsx("div", { className: "relative z-10 flex flex-col items-start text-white", children: _jsxs("div", { className: "relative flex flex-col items-center gap-[8px] bg-[var(--adaptive-grey100)] p-[4px] rounded-[16px] w-full shadow-[0_0_120px_0_var(--adaptive-grey900)]", children: [_jsx("section", { className: "flex items-center justify-between w-full gap-[8px] h-[24px]", children: _jsx("p", { className: "text-[14px] text-[var(--adaptive-grey700)] pl-[8px]", children: draft.reportId }) }), _jsx("section", { className: "flex flex-col items-center gap-[12px] w-full", children: _jsx(FieldEditor, { fields: fields, message: draft.message, fieldValues: draft.fieldValues, onMessageChange: updateDraftMessage, onFieldChange: updateDraftField, variant: "draft-bubble" }) }), _jsxs("section", { className: "flex justify-end w-full gap-[4px]", children: [_jsx("button", { type: "button", onClick: cancelDraft, className: "h-full text-[14px] font-semibold flex flex-col justify-center items-center gap-[4px] rounded-[12px] p-[8px_12px] bg-[var(--adaptive-grey300)] text-white whitespace-nowrap", children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", onClick: () => void handleCreateSubmit(), disabled: isCreating, className: "h-full flex-1 text-[14px] font-semibold flex flex-col justify-center items-center gap-[4px] rounded-[12px] p-[8px_12px] bg-[var(--adaptive-blue400)] text-white whitespace-nowrap shadow-[var(--shadow-normal)]", children: isCreating ? "저장 중..." : "완료" })] }), checkboxFields.length > 0 ? (_jsx("section", { className: "flex w-full flex-col gap-[4px] bg-[var(--adaptive-grey200)] rounded-[0_0_12px_12px] p-[12px]", children: checkboxFields.map((field) => (_jsxs("label", { className: "text-[var(--adaptive-grey500)] flex items-center gap-[4px] w-full px-[12px]", children: [_jsx("input", { type: "checkbox", className: "h-3.5 w-3.5 rounded border-white/50 bg-white/10 text-white accent-white bg-transparent", checked: draft.fieldValues[field.key] === true, onChange: (event) => updateDraftField(field.key, event.target.checked) }), _jsx("span", { children: field.label })] }, field.key))) })) : null, _jsx(DraftPopoverConnector, { placement: placement })] }) }) }) }, "report-draft-form"));
}
//# sourceMappingURL=ReportDraftForm.js.map