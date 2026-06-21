import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../../providers/reportContext.js";
import { SendIcon } from "../../../components/icons/SendIcon.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FieldTagSelector } from "./FieldTagSelector.js";
export function FeedbackComposer({ message, onMessageChange, authorName, onAuthorNameChange, authors, fields, fieldValues, onFieldChange, showTags = false, onSubmit, isSubmitting = false, showGitHubIssueOnCreate = false, onGitHubIssueSubmit, isGitHubIssueSubmitting = false, placeholder, autoFocus = false, }) {
    const { messages } = useReport();
    const resolvedPlaceholder = placeholder ?? messages.composer.placeholder;
    const isActionDisabled = isSubmitting || isGitHubIssueSubmitting;
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
        onGitHubIssueSubmit();
    };
    return (_jsxs("div", { className: "flex w-full flex-col", children: [_jsx("textarea", { autoFocus: autoFocus, value: message, onChange: (event) => onMessageChange(event.target.value), placeholder: resolvedPlaceholder, rows: 3, className: "min-h-[72px] w-full resize-none bg-transparent px-[16px] pt-[16px] text-[14px] leading-[1.4] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]", onKeyDown: (event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleSubmit();
                    }
                } }), _jsxs("div", { className: "flex items-center justify-between gap-[8px] px-[12px] pb-[12px]", children: [_jsx(AuthorSelector, { authors: authors, value: authorName, onChange: onAuthorNameChange }), _jsxs("div", { className: "flex shrink-0 items-center gap-[6px]", children: [showGitHubIssueOnCreate ? (_jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isActionDisabled, onClick: handleGitHubIssueSubmit, className: "inline-flex h-[24px] items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] disabled:opacity-50", "aria-label": messages.composer.gitIssueSendAriaLabel, title: messages.composer.gitIssueSendTitle, children: _jsxs("span", { className: "text-[12px] font-semibold text-[var(--adaptive-black500)]", children: ["+ ", isGitHubIssueSubmitting ? messages.composer.gitIssueSendingLabel : messages.composer.gitIssueSendLabel] }) })) : null, _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isActionDisabled, onClick: handleSubmit, className: "inline-flex px-[12px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-[var(--adaptive-overlay-text)] disabled:opacity-50", "aria-label": messages.composer.sendAriaLabel, children: _jsx(SendIcon, { className: "w-[16px]" }) })] })] }), showTags ? (_jsx(FieldTagSelector, { fields: fields, fieldValues: fieldValues, onFieldChange: (key, value) => onFieldChange(key, value) })) : null] }));
}
//# sourceMappingURL=FeedbackComposer.js.map