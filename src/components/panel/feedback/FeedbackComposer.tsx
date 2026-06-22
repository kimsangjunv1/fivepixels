import type { ReportField, ReportFieldValues } from "@/types/report.js";
import type { ReportAuthor } from "@/types/report.js";
import { useEffect, useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import { GitHubIssueIcon } from "@/components/icons/GitHubIssueIcon.js";
import { SendIcon } from "@/components/icons/SendIcon.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FieldTagSelector } from "./FieldTagSelector.js";

type FeedbackComposerProps = {
    message: string;
    onMessageChange: (value: string) => void;
    authorName: string;
    onAuthorNameChange: (value: string) => void;
    authors: ReportAuthor[];
    fields: ReportField[];
    fieldValues: ReportFieldValues;
    onFieldChange: (key: string, value: string | boolean) => void;
    showTags?: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
    showGitHubIssueOnCreate?: boolean;
    onGitHubIssueSubmit?: () => void;
    isGitHubIssueSubmitting?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
};

export function FeedbackComposer({
    message,
    onMessageChange,
    authorName,
    onAuthorNameChange,
    authors,
    fields,
    fieldValues,
    onFieldChange,
    showTags = false,
    onSubmit,
    isSubmitting = false,
    showGitHubIssueOnCreate = false,
    onGitHubIssueSubmit,
    isGitHubIssueSubmitting = false,
    placeholder,
    autoFocus = false,
}: FeedbackComposerProps) {
    const { messages } = useReport();
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const resolvedPlaceholder = placeholder ?? messages.composer.placeholder;

    const isActionDisabled = isSubmitting || isGitHubIssueSubmitting;

    useEffect(() => {
        if (!isGitHubIssueConfirming) {
            return;
        }

        const timer = window.setTimeout(() => setIsGitHubIssueConfirming(false), 1500);

        return () => window.clearTimeout(timer);
    }, [isGitHubIssueConfirming]);

    const handleSubmit = () => {
        if (isActionDisabled) {
            return;
        }

        onSubmit();
    };

    const handleGitHubIssueSubmit = () => {
        if (isActionDisabled || !onGitHubIssueSubmit) {
            return;
        }

        if (!isGitHubIssueConfirming) {
            setIsGitHubIssueConfirming(true);
            return;
        }

        setIsGitHubIssueConfirming(false);
        onGitHubIssueSubmit();
    };

    return (
        <div className="flex w-full flex-col">
            <textarea
                autoFocus={autoFocus}
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                placeholder={resolvedPlaceholder}
                rows={3}
                className="min-h-[72px] w-full resize-none bg-transparent px-[16px] pt-[16px] text-[14px] leading-[1.4] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]"
                onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleSubmit();
                    }
                }}
            />

            <div className="flex items-center justify-between gap-[8px] px-[12px] pb-[12px]">
                <AuthorSelector
                    authors={authors}
                    value={authorName}
                    onChange={onAuthorNameChange}
                />
                <div className="flex shrink-0 items-center gap-[6px]">
                    {showGitHubIssueOnCreate ? (
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isActionDisabled}
                            onClick={handleGitHubIssueSubmit}
                            className="inline-flex h-[24px] items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] disabled:opacity-50"
                            aria-label={isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.composer.gitIssueSendAriaLabel}
                            title={isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmTitle : messages.composer.gitIssueSendTitle}
                        >
                            <span className="text-[12px] font-semibold text-[var(--adaptive-black500)]">
                                + {isGitHubIssueSubmitting
                                    ? messages.composer.gitIssueSendingLabel
                                    : isGitHubIssueConfirming
                                      ? messages.feedbackList.gitIssueConfirmLabel
                                      : messages.composer.gitIssueSendLabel}
                            </span>
                        </button>
                    ) : null}
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={isActionDisabled}
                        onClick={handleSubmit}
                        className="inline-flex px-[12px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-[var(--adaptive-overlay-text)] disabled:opacity-50"
                        aria-label={messages.composer.sendAriaLabel}
                    >
                        <SendIcon className="w-[16px]" />
                    </button>
                </div>
            </div>

            {/* <div className="w-full h-[1px] bg-[var(--adaptive-whiteOpacity200)]" /> */}

            {showTags ? (
                <FieldTagSelector
                    fields={fields}
                    fieldValues={fieldValues}
                    onFieldChange={(key, value) => onFieldChange(key, value)}
                />
            ) : null}
        </div>
    );
}
