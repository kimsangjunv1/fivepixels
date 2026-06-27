import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { formatTimeOnly } from "../../../utils/format.js";
import { getFeedbackDisplayStatus, getLatestReply, getRemainingReplyCount } from "../../../utils/feedbackThread.js";
import { copyTextToClipboard, serializeFeedbackItem } from "../../../utils/feedbackDataTransfer.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssueButton } from "./GitIssueButton.js";
import { CopyIcon, TrashIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
function FeedbackListCopyAction({ report, messages }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = (event) => {
        event.stopPropagation();
        void copyTextToClipboard(serializeFeedbackItem(report))
            .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        })
            .catch(() => {
            setCopied(false);
        });
    };
    return (_jsx(HoverTooltip, { label: copied ? messages.feedbackList.copiedTitle : messages.feedbackList.copyTitle, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleCopy, "aria-label": messages.feedbackList.copyAriaLabel, className: "flex h-[20px] w-[20px] items-center justify-center text-[var(--adaptive-black50)] hover:text-white", children: copied ? _jsx("span", { className: "text-[9px] font-semibold", children: messages.common.ok }) : _jsx(CopyIcon, { className: "h-[12px] w-[12px]" }) }) }));
}
function FeedbackListDeleteAction({ report, onDelete, disabled = false, messages }) {
    const [confirming, setConfirming] = useState(false);
    useEffect(() => {
        if (!confirming) {
            return;
        }
        const timer = window.setTimeout(() => setConfirming(false), 1500);
        return () => {
            window.clearTimeout(timer);
        };
    }, [confirming]);
    const handleDelete = (event) => {
        event.stopPropagation();
        if (!confirming) {
            setConfirming(true);
            return;
        }
        void onDelete(report.id).finally(() => {
            setConfirming(false);
        });
    };
    return (_jsx(HoverTooltip, { label: confirming ? messages.feedbackList.deleteConfirmTitle : messages.feedbackList.deleteTitle, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleDelete, disabled: disabled, "aria-label": confirming ? messages.feedbackList.deleteConfirmAriaLabel : messages.feedbackList.deleteAriaLabel, className: `flex h-[20px] w-[20px] items-center justify-center disabled:opacity-50 ${confirming ? "text-rose-200 hover:text-white" : "text-[var(--adaptive-black50)] hover:text-white"}`, children: confirming ? _jsx("span", { className: "text-[9px] font-semibold", children: "!" }) : _jsx(TrashIcon, { className: "h-[12px] w-[12px]" }) }) }));
}
function FeedbackListGitIssueAction({ report, messages, disabled, isSubmitting, onCreateIssue, }) {
    return (_jsx("div", { className: "flex items-center [&_button]:h-[20px] [&_button]:w-[20px] [&_button]:p-0 [&_button]:text-[var(--adaptive-black50)] [&_button:hover]:bg-transparent [&_button:hover]:text-white [&_a]:h-[20px] [&_a]:w-[20px] [&_a]:p-0 [&_a]:text-[var(--adaptive-black50)] [&_a:hover]:bg-transparent [&_a:hover]:text-white [&_svg]:h-[12px] [&_svg]:w-[12px]", onClick: (event) => event.stopPropagation(), children: _jsx(GitIssueButton, { report: report, messages: messages, disabled: disabled, isSubmitting: isSubmitting, onCreateIssue: onCreateIssue }) }));
}
function FeedbackListDottedDash() {
    return (_jsx("span", { className: "h-px min-w-[10px] flex-1 self-center bg-[length:5px_1px] bg-repeat-x bg-center", style: {
            backgroundImage: "radial-gradient(circle, var(--adaptive-black900) 0.9px, transparent 0.9px)",
        }, "aria-hidden": true }));
}
function FeedbackListRow({ text, trailing }) {
    return (_jsxs("div", { className: "flex min-w-0 items-center", children: [_jsx("div", { className: "min-w-0 shrink truncate", children: text }), _jsx(FeedbackListDottedDash, {}), _jsx("div", { className: "shrink-0", children: trailing })] }));
}
export function FeedbackListItem({ report, locale, messages, listScope, disabled = false, canCreateGitHubIssue = false, creatingGitHubIssueId = null, onLocate, onDelete, onCreateGitHubIssue, }) {
    const [hovered, setHovered] = useState(false);
    const latestReply = getLatestReply(report);
    const remainingReplyCount = getRemainingReplyCount(report);
    const displayStatus = getFeedbackDisplayStatus(report, false);
    const activityAt = latestReply?.created_at ?? report.created_at;
    return (_jsx("div", { className: "group border-b border-[var(--adaptive-border-subtle)] last:border-b-0", onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: _jsxs("button", { type: "button", onClick: () => onLocate(report.id), className: "flex w-full flex-col gap-[6px] p-[10px_12px] text-left", children: [_jsx(FeedbackListRow, { text: _jsx("p", { className: "truncate text-[13px] leading-[1.4] text-[var(--adaptive-black900)]", children: report.message }), trailing: hovered ? (_jsxs("div", { className: "flex items-center gap-[2px] rounded-full bg-[var(--adaptive-black900)] px-[6px] py-[2px]", onClick: (event) => event.stopPropagation(), children: [_jsx(FeedbackListCopyAction, { report: report, messages: messages }), canCreateGitHubIssue && onCreateGitHubIssue ? (_jsx(FeedbackListGitIssueAction, { report: report, messages: messages, disabled: disabled, isSubmitting: creatingGitHubIssueId === report.id, onCreateIssue: onCreateGitHubIssue })) : null, _jsx(FeedbackListDeleteAction, { report: report, onDelete: onDelete, disabled: disabled, messages: messages })] })) : (_jsx("span", { className: "rounded-full bg-[var(--adaptive-black900)] px-[8px] py-[2px] text-[12px] tabular-nums text-[var(--adaptive-black50)]", children: formatTimeOnly(activityAt, locale) })) }), _jsx("div", { className: "pl-[10px]", children: _jsx(FeedbackListRow, { text: latestReply ? (_jsxs("p", { className: "truncate text-[12px] leading-[1.4] text-[var(--adaptive-black600)]", children: [_jsx("span", { className: "text-[var(--adaptive-black400)]", children: messages.feedbackList.threadReplyPrefix }), " ", latestReply.message] })) : (_jsx("span", { className: "block h-[17px]" })), trailing: _jsxs("div", { className: "flex shrink-0 items-center gap-[6px]", children: [_jsx(FeedbackStatusBadge, { status: displayStatus }), remainingReplyCount > 0 ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-[11px] text-[var(--adaptive-black400)]", children: "|" }), _jsxs("span", { className: "text-[11px] tabular-nums text-[var(--adaptive-black500)]", children: ["+", remainingReplyCount] })] })) : null] }) }) }), listScope === "all" ? _jsx("p", { className: "truncate pl-[10px] text-[11px] text-[var(--adaptive-black400)]", children: report.pathname }) : null] }) }));
}
//# sourceMappingURL=FeedbackListItem.js.map