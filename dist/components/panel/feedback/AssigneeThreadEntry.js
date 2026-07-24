import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { formatClockTime } from "../../../utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "../../../utils/report/reportCases.js";
import { resolveAssigneeEntryActionRole } from "../../../utils/feedback/feedbackThread.js";
import { getThreadActionButtonClass, THREAD_ACTION_STYLE } from "../../../constants/threadActionStyles.js";
import { CompleteActionIcon, DeniedActionIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
const THREAD_ACTION_BUTTON_BASE = "flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors";
const THREAD_ACTION_GHOST = "text-[var(--adaptive-text-primary)] hover:bg-[var(--adaptive-black100)]";
const THREAD_ACTION_DIVIDER = "mx-[2px] h-[12px] w-px bg-[var(--adaptive-border-subtle)]";
const THREAD_ACTION_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border-[2px] border-[var(--adaptive-grey900)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";
const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px]";
export function AssigneeThreadEntry({ reply, report, caseId, authors, actorName, pendingComposer, onStartDeny, onStartCheckout, onTransferAssignee, isUpdating, isClaimingAssignee, }) {
    const { messages } = useReportPreferences();
    const assigneeName = reply.author_name?.trim() ?? "";
    const department = resolveAuthorDepartment(authors, assigneeName);
    const actionRole = resolveAssigneeEntryActionRole(report, reply, caseId, actorName);
    const denyActive = (pendingComposer?.type === "deny" || pendingComposer?.type === "recheck") && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    const hasActions = actionRole !== null;
    const deniedStyle = THREAD_ACTION_STYLE.denied;
    const completeStyle = THREAD_ACTION_STYLE.complete;
    const surfaceClass = denyActive || checkoutActive
        ? `${THREAD_ACTION_ENTRY_SURFACE_CLASS} ${denyActive ? deniedStyle.cardHighlight : completeStyle.cardHighlight}`
        : hasActions
            ? THREAD_ACTION_ENTRY_SURFACE_CLASS
            : THREAD_CASE_ENTRY_SURFACE_CLASS;
    return (_jsx(ThreadTimelineRow, { time: formatClockTime(reply.created_at), children: _jsxs("div", { className: surfaceClass, children: [_jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)] whitespace-break-spaces", children: reply.message }), assigneeName ? _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: formatAssigneeLabel(assigneeName, department) }) : null, actionRole === "assignee" ? (_jsxs("div", { className: "mt-[10px] flex flex-wrap items-center justify-end", children: [_jsx(HoverTooltip, { label: messages.thread.deniedTooltip, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: onStartDeny, "aria-label": messages.thread.denied, className: `${THREAD_ACTION_BUTTON_BASE} px-[6px] ${getThreadActionButtonClass("denied", denyActive)}`, style: { color: deniedStyle.color }, children: _jsx(DeniedActionIcon, { className: "h-[13px] w-[13px]", fill: deniedStyle.color }) }) }), _jsx("span", { className: THREAD_ACTION_DIVIDER, "aria-hidden": true }), _jsx(HoverTooltip, { label: messages.thread.completeTooltip, children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: () => onStartCheckout(reply.id), "aria-label": messages.thread.complete, className: `${THREAD_ACTION_BUTTON_BASE} ${getThreadActionButtonClass("complete", checkoutActive)}`, style: { color: completeStyle.color }, children: [_jsx(CompleteActionIcon, { className: "h-[13px] w-[13px]", fill: completeStyle.color }), _jsx("span", { style: { color: completeStyle.color }, children: messages.thread.complete })] }) })] })) : null, actionRole === "takeover" ? (_jsx("div", { className: "mt-[10px] flex flex-wrap items-center justify-end", children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: onTransferAssignee, className: `${THREAD_ACTION_BUTTON_BASE} ${THREAD_ACTION_GHOST}`, children: messages.thread.takeOverAssignee }) })) : null] }) }));
}
//# sourceMappingURL=AssigneeThreadEntry.js.map