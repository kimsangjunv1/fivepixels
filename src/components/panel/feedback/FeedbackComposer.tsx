import type { ReportField, ReportFieldValues, ReportCase } from "@/types/report.js";
import type { ReportAuthor } from "@/types/report.js";
import { useEffect, useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import { GitHubIssueIcon, SendIcon } from "@/components/icons/Icons.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { FieldTagSelector } from "./FieldTagSelector.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";

type FeedbackComposerProps = {
    message?: string;
    onMessageChange?: (value: string) => void;
    cases?: ReportCase[];
    onCaseChange?: (caseId: string, text: string) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
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
    errorMessage?: string;
    showAskQuestionToggle?: boolean;
    askQuestionChecked?: boolean;
    onAskQuestionChange?: (checked: boolean) => void;
    askQuestionForced?: boolean;
    hideAuthorSelector?: boolean;
};

export function FeedbackComposer({
    message = "",
    onMessageChange,
    cases,
    onCaseChange,
    onAddCase,
    onRemoveCase,
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
    errorMessage = "",
    showAskQuestionToggle = false,
    askQuestionChecked = false,
    onAskQuestionChange,
    askQuestionForced = false,
    hideAuthorSelector = false,
}: FeedbackComposerProps) {
    const { messages } = useReport();
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const isQuestionMode = askQuestionForced || askQuestionChecked;
    const usesCaseEditor = Boolean(cases && onCaseChange && onAddCase && onRemoveCase);
    const resolvedPlaceholder = isQuestionMode ? messages.composer.questionPlaceholder : (placeholder ?? (usesCaseEditor ? messages.fieldEditor.messagePlaceholder : messages.composer.placeholder));

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
        <div className={`flex w-full flex-col bg-[var(--adaptive-blackOpacity900)] backdrop-blur-sm rounded-[16px] shadow-[0_20px_20px_0_#00000020] ${usesCaseEditor ? "min-h-0 flex-1" : ""}`}>
            <div className={`relative ${usesCaseEditor ? "min-h-0 flex-1" : ""}`}>
                {errorMessage ? (
                    <p
                        role="alert"
                        className="absolute bottom-full left-[8px] right-[8px] z-10 mb-[6px] rounded-[8px] border border-rose-200 bg-rose-50 px-[8px] py-[4px] text-[12px] leading-[1.4] text-rose-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    >
                        {errorMessage}
                    </p>
                ) : null}
                {usesCaseEditor ? (
                    <FeedbackCaseEditor
                        cases={cases!}
                        onCaseChange={onCaseChange!}
                        onAddCase={onAddCase!}
                        onRemoveCase={onRemoveCase!}
                        autoFocus={autoFocus}
                        onSubmitShortcut={handleSubmit}
                    />
                ) : (
                    <textarea
                        autoFocus={autoFocus}
                        value={message}
                        onChange={(event) => onMessageChange?.(event.target.value)}
                        placeholder={resolvedPlaceholder}
                        rows={3}
                        className="min-h-[72px] w-full resize-none bg-transparent px-[12px] pt-[12px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]"
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                                event.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                )}
            </div>

            <div className={`flex items-center gap-[8px] px-[8px] pb-[8px] ${hideAuthorSelector ? "justify-end" : "justify-between"}`}>
                {hideAuthorSelector ? null : (
                    <AuthorSelector
                        authors={authors}
                        value={authorName}
                        onChange={onAuthorNameChange}
                    />
                )}
                <div className="flex shrink-0 items-center gap-[6px]">
                    {showAskQuestionToggle ? (
                        <label className="inline-flex items-center gap-[4px] px-[2px] text-[12px] text-[var(--adaptive-black600)]">
                            <input
                                type="checkbox"
                                data-fivepixels-interactive=""
                                checked={isQuestionMode}
                                disabled={askQuestionForced || isActionDisabled}
                                onChange={(event) => onAskQuestionChange?.(event.target.checked)}
                                className="h-[14px] w-[14px] accent-[var(--adaptive-blue500)]"
                            />
                            <span>{messages.composer.askQuestionLabel}</span>
                        </label>
                    ) : null}
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
                                +{" "}
                                {isGitHubIssueSubmitting
                                    ? messages.composer.gitIssueSendingLabel
                                    : isGitHubIssueConfirming
                                      ? messages.feedbackList.gitIssueConfirmLabel
                                      : messages.composer.gitIssueSendLabel}
                            </span>
                        </button>
                    ) : null}
                    <HoverTooltip label={messages.composer.sendAriaLabel}>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            disabled={isActionDisabled}
                            onClick={handleSubmit}
                            className="inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-white disabled:opacity-50"
                            aria-label={messages.composer.sendAriaLabel}
                        >
                            <SendIcon className="h-[16px] w-[16px]" />
                        </button>
                    </HoverTooltip>
                </div>
            </div>

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
