import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { GitHubIssueIcon } from "../../../components/icons/GitHubIssueIcon.js";
import { getGitHubIssueUrl, hasGitHubIssue } from "../../../utils/githubIntegration.js";
export function GitIssueButton({ report, messages, disabled = false, isSubmitting = false, onCreateIssue }) {
    const [confirming, setConfirming] = useState(false);
    const issueUrl = getGitHubIssueUrl(report);
    useEffect(() => {
        if (!confirming) {
            return;
        }
        const timer = window.setTimeout(() => setConfirming(false), 1500);
        return () => {
            window.clearTimeout(timer);
        };
    }, [confirming]);
    if (hasGitHubIssue(report) && issueUrl) {
        return (_jsx("a", { href: issueUrl, target: "_blank", rel: "noopener noreferrer", "data-stitchable-interactive": "", onClick: (event) => event.stopPropagation(), "aria-label": messages.feedbackList.gitIssueViewAriaLabel, title: messages.feedbackList.gitIssueViewTitle, className: "flex shrink-0 items-center justify-center self-start rounded-[6px] p-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-blue500)]", children: _jsx(GitHubIssueIcon, { className: "h-[16px] w-[16px]" }) }));
    }
    const handleCreate = (event) => {
        event.stopPropagation();
        if (disabled || isSubmitting) {
            return;
        }
        if (!confirming) {
            setConfirming(true);
            return;
        }
        void onCreateIssue(report).finally(() => {
            setConfirming(false);
        });
    };
    return (_jsxs("button", { type: "button", "data-stitchable-interactive": "", onClick: handleCreate, disabled: disabled || isSubmitting, "aria-label": confirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.feedbackList.gitIssueAddAriaLabel, title: confirming ? messages.feedbackList.gitIssueConfirmTitle : messages.feedbackList.gitIssueAddTitle, className: `flex shrink-0 items-center justify-center gap-[2px] self-start rounded-[6px] p-[6px] disabled:opacity-50 ${confirming
            ? "text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-black100)]"
            : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-blue500)]"}`, children: [_jsx(GitHubIssueIcon, { className: "h-[16px] w-[16px]" }), isSubmitting ? (_jsx("span", { className: "text-[10px] font-semibold", children: messages.feedbackList.gitIssueCreatingLabel })) : confirming ? (_jsx("span", { className: "text-[10px] font-semibold", children: messages.feedbackList.gitIssueConfirmLabel })) : null] }));
}
//# sourceMappingURL=GitIssueButton.js.map