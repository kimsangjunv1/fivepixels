import { useEffect, useState, type MouseEvent } from "react";
import { GitHubIssueIcon } from "@/components/icons/GitHubIssueIcon.js";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
import { getGitHubIssueUrl, hasGitHubIssue } from "@/utils/githubIntegration.js";

type GitIssueButtonProps = {
    report: ReportFeedback;
    messages: ReportMessages;
    disabled?: boolean;
    isSubmitting?: boolean;
    onCreateIssue: (report: ReportFeedback) => Promise<void>;
};

export function GitIssueButton({ report, messages, disabled = false, isSubmitting = false, onCreateIssue }: GitIssueButtonProps) {
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
        return (
            <a
                href={issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-stitchable-interactive=""
                onClick={(event) => event.stopPropagation()}
                aria-label={messages.feedbackList.gitIssueViewAriaLabel}
                title={messages.feedbackList.gitIssueViewTitle}
                className="flex shrink-0 items-center justify-center self-start rounded-[6px] p-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-blue500)]"
            >
                <GitHubIssueIcon className="h-[16px] w-[16px]" />
            </a>
        );
    }

    const handleCreate = (event: MouseEvent<HTMLButtonElement>) => {
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

    return (
        <button
            type="button"
            data-stitchable-interactive=""
            onClick={handleCreate}
            disabled={disabled || isSubmitting}
            aria-label={confirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.feedbackList.gitIssueAddAriaLabel}
            title={confirming ? messages.feedbackList.gitIssueConfirmTitle : messages.feedbackList.gitIssueAddTitle}
            className={`flex shrink-0 items-center justify-center gap-[2px] self-start rounded-[6px] p-[6px] disabled:opacity-50 ${
                confirming
                    ? "text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-black100)]"
                    : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-blue500)]"
            }`}
        >
            <GitHubIssueIcon className="h-[16px] w-[16px]" />
            {isSubmitting ? (
                <span className="text-[10px] font-semibold">{messages.feedbackList.gitIssueCreatingLabel}</span>
            ) : confirming ? (
                <span className="text-[10px] font-semibold">{messages.feedbackList.gitIssueConfirmLabel}</span>
            ) : null}
        </button>
    );
}
