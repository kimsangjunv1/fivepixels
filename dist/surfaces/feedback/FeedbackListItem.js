import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { formatTimeOnly } from "../../shared/utils/shared/format.js";
import { getIssueSummary } from "../../shared/utils/report/reportCases.js";
import { getFeedbackCaseId, getMemoCaseId } from "../../shared/utils/feedback/feedbackCaseId.js";
import { copyTextToClipboard, serializeFeedbackItem } from "../../shared/utils/feedback/feedbackDataTransfer.js";
import { GitIssueButton } from "./GitIssueButton.js";
import { FeedbackDeleteAction } from "./FeedbackDeleteAction.js";
import { canDeleteFeedback } from "../../shared/utils/feedback/feedbackPermissions.js";
import { useReportSession } from "../../shared/providers/reportContext.js";
import { CopyIcon, LockIcon } from "../../shared/components/icons/Icons.js";
import { HoverTooltip } from "../../surfaces/tooltip/HoverTooltip.js";
import { useIntegrationLock } from "../../shared/components/ui/IntegrationLock.js";
function ClockIcon({ className }) {
    return (_jsxs("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className: className, children: [_jsx("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M8 4.5V8l2.25 1.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })] }));
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
    return (_jsx(HoverTooltip, { label: copied ? messages.feedbackList.copiedTitle : messages.feedbackList.copyTitle, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleCopy, "aria-label": messages.feedbackList.copyAriaLabel, className: "flex h-[20px] w-[20px] items-center justify-center text-[var(--adaptive-black50)] hover:text-white", children: copied ? _jsx("span", { className: "text-[12px] font-semibold", children: messages.common.ok }) : _jsx(CopyIcon, { className: "h-[12px] w-[12px]" }) }) }));
}
function FeedbackListGitIssueAction({ report, messages, disabled, isSubmitting, onCreateIssue, }) {
    return (_jsx("div", { className: "flex items-center [&_button]:h-[20px] [&_button]:w-[20px] [&_button]:p-0 [&_button]:text-[var(--adaptive-black50)] [&_button:hover]:bg-transparent [&_button:hover]:text-white [&_a]:h-[20px] [&_a]:w-[20px] [&_a]:p-0 [&_a]:text-[var(--adaptive-black50)] [&_a:hover]:bg-transparent [&_a:hover]:text-white [&_svg]:h-[12px] [&_svg]:w-[12px]", onClick: (event) => event.stopPropagation(), children: _jsx(GitIssueButton, { report: report, messages: messages, disabled: disabled, isSubmitting: isSubmitting, onCreateIssue: onCreateIssue }) }));
}
export function FeedbackListItem({ report, locale, messages, listKind = "feedback", disabled = false, canCreateGitHubIssue = false, creatingGitHubIssueId = null, onLocate, onDelete, onCreateGitHubIssue, }) {
    const { sessionActor } = useReportSession();
    const canDelete = canDeleteFeedback(report, sessionActor);
    const deleteLock = useIntegrationLock("deleteFeedback");
    const githubLock = useIntegrationLock("githubIssue");
    const isMemoItem = listKind === "memo" || report.category === "memo";
    const caseId = isMemoItem ? getMemoCaseId(report) : getFeedbackCaseId(report);
    const summary = getIssueSummary(report, { summaryMore: messages.cases.summaryMore });
    const activityAt = report.created_at;
    const showGitHubAction = !isMemoItem && (canCreateGitHubIssue || githubLock.locked);
    const showDeleteAction = canDelete;
    const caseIdFallback = isMemoItem ? "#MM-—" : "#FC-—";
    return (_jsxs("div", { className: "group flex flex-col relative border-b border-[var(--adaptive-border-subtle)] last:border-b-0 bg-[var(--adaptive-tintOpacity50)]", children: [_jsx("button", { type: "button", onClick: () => onLocate(report.id), className: "flex flex-1 flex-col gap-[8px] text-left hover:bg-[var(--adaptive-black300)]", children: _jsxs("section", { className: "flex", children: [_jsx("span", { className: "truncate text-[14px] font-semibold text-[var(--adaptive-black900)] min-w-[72px] flex items-center justify-center border-r border-r-[var(--adaptive-border-subtle)]", children: caseId ?? caseIdFallback }), _jsxs("section", { className: "flex flex-col gap-[4px] p-[8px_12px] flex-1", children: [_jsx("p", { className: "line-clamp-2 text-[14px] text-[var(--adaptive-black900)] font-medium whitespace-break-spaces leading-[1.5]", children: summary }), _jsxs("div", { className: `flex items-center gap-[6px] ${isMemoItem ? "justify-between" : "justify-end"}`, children: [isMemoItem ? (_jsx("p", { className: "min-w-0 truncate text-[12px] text-[var(--adaptive-black500)]", title: report.pathname, children: report.pathname || "/" })) : null, _jsxs("span", { className: "flex shrink-0 items-center gap-[4px] text-[12px] tabular-nums text-[var(--adaptive-black900)]", children: [_jsx(ClockIcon, { className: "h-[12px] w-[12px]" }), formatTimeOnly(activityAt, locale)] })] })] })] }) }), _jsx("div", { className: "absolute right-[10px] top-[6px] z-[1] flex items-center gap-[2px]", children: _jsxs("div", { className: "flex items-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100", children: [showGitHubAction ? (githubLock.locked || !onCreateGitHubIssue ? (_jsx(HoverTooltip, { label: githubLock.tooltipLabel, multiline: true, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: true, "aria-label": githubLock.tooltipLabel, className: "flex h-[20px] w-[20px] items-center justify-center text-[var(--adaptive-black50)] opacity-70", onClick: (event) => event.stopPropagation(), children: _jsx(LockIcon, { className: "h-[12px] w-[12px]" }) }) })) : (_jsx(FeedbackListGitIssueAction, { report: report, messages: messages, disabled: disabled, isSubmitting: creatingGitHubIssueId === report.id, onCreateIssue: onCreateGitHubIssue }))) : null, _jsx(FeedbackListCopyAction, { report: report, messages: messages }), showDeleteAction ? (_jsx(FeedbackDeleteAction, { reportId: report.id, onDelete: onDelete, disabled: disabled, locked: deleteLock.locked, lockLabel: deleteLock.tooltipLabel, messages: messages })) : null] }) })] }));
}
//# sourceMappingURL=FeedbackListItem.js.map