import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { formatTimeOnly } from "../../../utils/shared/format.js";
import { getIssueSummary } from "../../../utils/report/reportCases.js";
import { getReplyCount } from "../../../utils/feedback/feedbackThread.js";
import { getFeedbackCaseId } from "../../../utils/feedback/feedbackCaseId.js";
import { getFeedbackListStatusTag } from "../../../utils/feedback/feedbackListStatus.js";
import { isFeedbackCategory } from "../../../constants/feedbackCategory.js";
import { copyTextToClipboard, serializeFeedbackItem } from "../../../utils/feedback/feedbackDataTransfer.js";
import { GitIssueButton } from "./GitIssueButton.js";
import { CopyIcon, TrashIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
function ClockIcon({ className }) {
    return (_jsxs("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className: className, children: [_jsx("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M8 4.5V8l2.25 1.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
function CategoryShieldIcon({ className }) {
    return (_jsx("svg", { viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true, className: className, children: _jsx("path", { d: "M8 1.5 3.5 3.4v3.7c0 3.1 2.1 5.9 4.5 6.9 2.4-1 4.5-3.8 4.5-6.9V3.4L8 1.5Zm0 1.7 3.2 1.3v2.6c0 2.2-1.4 4.2-3.2 5.1-1.8-.9-3.2-2.9-3.2-5.1V4.5L8 3.2Z" }) }));
}
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
export function FeedbackListItem({ report, locale, messages, listScope, disabled = false, canCreateGitHubIssue = false, creatingGitHubIssueId = null, onLocate, onDelete, onCreateGitHubIssue, }) {
    const [hovered, setHovered] = useState(false);
    const caseId = getFeedbackCaseId(report);
    const replyCount = getReplyCount(report);
    const statusTag = getFeedbackListStatusTag(report);
    const category = isFeedbackCategory(report.category) ? report.category : null;
    const summary = getIssueSummary(report, { summaryMore: messages.cases.summaryMore });
    const activityAt = report.created_at;
    return (_jsx("div", { className: "group border-b border-[var(--adaptive-border-subtle)] last:border-b-0", onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: _jsxs("button", { type: "button", onClick: () => onLocate(report.id), className: "flex w-full flex-col gap-[8px] px-[16px] py-[8px] text-left hover:bg-[var(--adaptive-neutralTintOpacity900)]", children: [_jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsxs("div", { className: "flex min-w-0 items-center justify-between gap-[4px]", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-[4px]", children: [_jsx("span", { className: "truncate text-[14px] font-semibold text-[var(--adaptive-black900)]", children: caseId ?? "#FC-—" }), replyCount > 0 ? (_jsx("span", { className: "rounded-[4px] border-[1.5px] border-[var(--adaptive-black900)] px-[2px] text-[10px] font-bold text-[var(--adaptive-black900)]", children: messages.feedbackList.replyCountBadge(replyCount) })) : null] }), _jsxs("span", { className: "flex shrink-0 items-center gap-[4px] text-[12px] tabular-nums text-[var(--adaptive-black500)]", children: [_jsx(ClockIcon, { className: "h-[12px] w-[12px]" }), formatTimeOnly(activityAt, locale)] })] }), _jsx("p", { className: "line-clamp-2 text-[14px] text-[var(--adaptive-black900)]", children: summary })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-[6px]", children: [category ? (_jsxs("span", { className: "inline-flex items-center gap-[4px] rounded-[4px] bg-[var(--adaptive-black200)] px-[4px] py-[1px] text-[12px] font-medium text-[var(--adaptive-black700)]", children: [_jsx(CategoryShieldIcon, { className: "h-[11px] w-[11px] text-[var(--adaptive-black500)]" }), messages.feedbackList.categoryTag[category]] })) : null, _jsx("span", { className: "inline-flex items-center rounded-[4px] bg-[var(--adaptive-black200)] px-[4px] py-[1px] text-[12px] font-medium text-[var(--adaptive-black700)]", children: messages.feedbackList.statusTag[statusTag] })] }), listScope === "all" ? _jsx("p", { className: "truncate text-[11px] text-[var(--adaptive-black400)]", children: report.pathname }) : null] }) }));
}
//# sourceMappingURL=FeedbackListItem.js.map