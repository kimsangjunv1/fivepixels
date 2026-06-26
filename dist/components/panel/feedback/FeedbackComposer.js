import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { SendIcon } from "../../../components/icons/Icons.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { FieldTagSelector } from "./FieldTagSelector.js";
export function FeedbackComposer({ message, onMessageChange, authorName, onAuthorNameChange, authors, fields, fieldValues, onFieldChange, showTags = false, onSubmit, isSubmitting = false, showGitHubIssueOnCreate = false, onGitHubIssueSubmit, isGitHubIssueSubmitting = false, placeholder, autoFocus = false, showAskQuestionToggle = false, askQuestionChecked = false, onAskQuestionChange, askQuestionForced = false, }) {
    const { messages } = useReport();
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const isQuestionMode = askQuestionForced || askQuestionChecked;
    const resolvedPlaceholder = isQuestionMode ? messages.composer.questionPlaceholder : (placeholder ?? messages.composer.placeholder);
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
    return (_jsxs("div", { className: "flex w-full flex-col", children: [_jsx("textarea", { autoFocus: autoFocus, value: message, onChange: (event) => onMessageChange(event.target.value), placeholder: resolvedPlaceholder, rows: 3, className: "min-h-[72px] w-full resize-none bg-transparent px-[8px] pt-[8px] text-[14px] leading-[1.4] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]", onKeyDown: (event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleSubmit();
                    }
                } }), _jsxs("div", { className: "flex items-center justify-between gap-[8px] px-[8px] pb-[8px]", children: [_jsx(AuthorSelector, { authors: authors, value: authorName, onChange: onAuthorNameChange }), _jsxs("div", { className: "flex shrink-0 items-center gap-[6px]", children: [showAskQuestionToggle ? (_jsxs("label", { className: "inline-flex items-center gap-[4px] px-[2px] text-[12px] text-[var(--adaptive-black600)]", children: [_jsx("input", { type: "checkbox", "data-fivepixels-interactive": "", checked: isQuestionMode, disabled: askQuestionForced || isActionDisabled, onChange: (event) => onAskQuestionChange?.(event.target.checked), className: "h-[14px] w-[14px] accent-[var(--adaptive-blue500)]" }), _jsx("span", { children: messages.composer.askQuestionLabel })] })) : null, showGitHubIssueOnCreate ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: handleGitHubIssueSubmit, className: "inline-flex h-[24px] items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] disabled:opacity-50", "aria-label": isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.composer.gitIssueSendAriaLabel, title: isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmTitle : messages.composer.gitIssueSendTitle, children: _jsxs("span", { className: "text-[12px] font-semibold text-[var(--adaptive-black500)]", children: ["+", " ", isGitHubIssueSubmitting
                                            ? messages.composer.gitIssueSendingLabel
                                            : isGitHubIssueConfirming
                                                ? messages.feedbackList.gitIssueConfirmLabel
                                                : messages.composer.gitIssueSendLabel] }) })) : null, _jsx(HoverTooltip, { label: messages.composer.sendAriaLabel, children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: handleSubmit, className: "inline-flex px-[8px_4px] gap-[4px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-[var(--adaptive-overlay-text)] disabled:opacity-50", "aria-label": messages.composer.sendAriaLabel, children: ["Send", _jsx(SendIcon, { className: "w-[16px] invert" })] }) })] })] }), showTags ? (_jsx(FieldTagSelector, { fields: fields, fieldValues: fieldValues, onFieldChange: (key, value) => onFieldChange(key, value) })) : null] }));
}
//# sourceMappingURL=FeedbackComposer.js.map