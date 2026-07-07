import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../../providers/reportContext.js";
import { formatClockTime } from "../../../utils/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "../../../utils/reportCases.js";
import { resolveAssigneeEntryActionRole } from "../../../utils/feedbackThread.js";
import { CheckIcon, CloseIcon } from "../../../components/icons/Icons.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
const THREAD_ACTION_BUTTON_BASE = "flex items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold transition-colors";
const THREAD_ACTION_GHOST = "text-[var(--adaptive-text-primary)] hover:bg-[var(--adaptive-black100)]";
const THREAD_ACTION_DIVIDER = "mx-[2px] h-[12px] w-px bg-[var(--adaptive-border-subtle)]";
const THREAD_ACTION_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px] border-[2px] border-[var(--adaptive-grey900)] bg-[var(--adaptive-surface-overlay)] p-[8px_12px]";
const THREAD_CASE_ENTRY_SURFACE_CLASS = "flex flex-col gap-[4px] rounded-[12px]";
export function AssigneeThreadEntry({ reply, report, caseId, authors, actorName, pendingComposer, onStartDeny, onStartCheckout, onTransferAssignee, isUpdating, isClaimingAssignee, }) {
    const { messages } = useReport();
    const assigneeName = reply.author_name?.trim() ?? "";
    const department = resolveAuthorDepartment(authors, assigneeName);
    const actionRole = resolveAssigneeEntryActionRole(report, reply, caseId, actorName);
    const denyActive = (pendingComposer?.type === "deny" || pendingComposer?.type === "recheck") && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    const hasActions = actionRole !== null;
    return (_jsx(ThreadTimelineRow, { time: formatClockTime(reply.created_at), children: _jsxs("div", { className: hasActions ? THREAD_ACTION_ENTRY_SURFACE_CLASS : THREAD_CASE_ENTRY_SURFACE_CLASS, children: [_jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]", children: reply.message }), assigneeName ? (_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: formatAssigneeLabel(assigneeName, department) })) : null, actionRole === "assignee" ? (_jsxs("div", { className: "mt-[10px] flex flex-wrap items-center justify-end", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: onStartDeny, "aria-label": messages.thread.denied, className: `${THREAD_ACTION_BUTTON_BASE} px-[6px] ${denyActive ? "bg-[#FF2B6A] text-white" : THREAD_ACTION_GHOST}`, children: _jsx(CloseIcon, { className: "h-[13px] w-[13px]" }) }), _jsx("span", { className: THREAD_ACTION_DIVIDER, "aria-hidden": true }), _jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: () => onStartCheckout(reply.id), "aria-label": messages.thread.fixComplete, className: `${THREAD_ACTION_BUTTON_BASE} ${checkoutActive ? "bg-[#F6572E] text-white" : THREAD_ACTION_GHOST}`, children: [_jsx(CheckIcon, { className: "h-[13px] w-[13px]" }), messages.thread.fixComplete] })] })) : null, actionRole === "takeover" ? (_jsx("div", { className: "mt-[10px] flex flex-wrap items-center justify-end", children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating || isClaimingAssignee, onClick: onTransferAssignee, className: `${THREAD_ACTION_BUTTON_BASE} ${THREAD_ACTION_GHOST}`, children: messages.thread.takeOverAssignee }) })) : null] }) }));
}
//# sourceMappingURL=AssigneeThreadEntry.js.map