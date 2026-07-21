import { useEffect, useState, type MouseEvent } from "react";
import { GitHubIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
import { getGitHubIssueUrl, hasGitHubIssue } from "@/utils/github/githubIntegration.js";

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
            <HoverTooltip label={messages.feedbackList.gitIssueViewTitle}>
                <a
                    href={issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-fivepixels-interactive=""
                    onClick={(event) => event.stopPropagation()}
                    aria-label={messages.feedbackList.gitIssueViewAriaLabel}
                    className="flex shrink-0 items-center justify-center self-start rounded-[6px] p-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-blue500)]"
                >
                    <GitHubIcon className="h-[16px] w-[16px]" />
                </a>
            </HoverTooltip>
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

    const tooltipLabel = isSubmitting
        ? messages.feedbackList.gitIssueCreatingLabel
        : confirming
          ? messages.feedbackList.gitIssueConfirmTitle
          : messages.feedbackList.gitIssueAddTitle;

    return (
        <HoverTooltip
            label={tooltipLabel}
            disabled={disabled || isSubmitting}
        >
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={handleCreate}
                disabled={disabled || isSubmitting}
                aria-label={confirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.feedbackList.gitIssueAddAriaLabel}
                className={`flex shrink-0 items-center justify-center gap-[2px] self-start rounded-[6px] p-[6px] disabled:opacity-50 ${
                    confirming
                        ? "text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-black100)]"
                        : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-blue500)]"
                }`}
            >
                <GitHubIcon className="h-[16px] w-[16px]" />
                {isSubmitting ? (
                    <span className="text-[10px] font-semibold">{messages.feedbackList.gitIssueCreatingLabel}</span>
                ) : confirming ? (
                    <span className="text-[10px] font-semibold">{messages.feedbackList.gitIssueConfirmLabel}</span>
                ) : null}
            </button>
        </HoverTooltip>
    );
}
