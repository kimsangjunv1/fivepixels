import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../../providers/reportContext.js";
import { GitHubIssueIcon } from "../../icons/GitHubIssueIcon.js";
import { SendIcon } from "../../icons/SendIcon.js";
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
    return (_jsxs("div", { className: "flex w-full flex-col", children: [_jsx("textarea", { autoFocus: autoFocus, value: message, onChange: (event) => onMessageChange(event.target.value), placeholder: resolvedPlaceholder, rows: 3, className: "min-h-[72px] w-full resize-none bg-transparent px-[16px] pt-[16px] text-[14px] leading-[1.4] text-[var(--adaptive-black50)] outline-none placeholder:text-[var(--adaptive-black500)]", onKeyDown: (event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleSubmit();
                    }
                } }), _jsxs("div", { className: "flex items-center justify-between gap-[8px] px-[12px] pb-[12px]", children: [_jsx(AuthorSelector, { authors: authors, value: authorName, onChange: onAuthorNameChange }), _jsxs("div", { className: "flex shrink-0 items-center gap-[6px]", children: [showGitHubIssueOnCreate ? (_jsxs("button", { type: "button", "data-stitchable-interactive": "", disabled: isActionDisabled, onClick: handleGitHubIssueSubmit, className: "inline-flex items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-black600)] px-[10px] py-[6px] text-[var(--adaptive-black50)] disabled:opacity-50", "aria-label": messages.composer.gitIssueSendAriaLabel, title: messages.composer.gitIssueSendTitle, children: [_jsx(GitHubIssueIcon, { className: "h-[14px] w-[14px]" }), _jsx("span", { className: "text-[11px] font-semibold", children: isGitHubIssueSubmitting ? messages.composer.gitIssueSendingLabel : messages.composer.gitIssueSendLabel })] })) : null, _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isActionDisabled, onClick: handleSubmit, className: "inline-flex px-[12px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-[var(--adaptive-black50)] disabled:opacity-50", "aria-label": messages.composer.sendAriaLabel, children: _jsx(SendIcon, { className: "w-[16px]" }) })] })] }), _jsx("div", { className: "w-full h-[1px] bg-[var(--adaptive-black800)]" }), showTags ? (_jsx(FieldTagSelector, { fields: fields, fieldValues: fieldValues, onFieldChange: (key, value) => onFieldChange(key, value) })) : null] }));
}
//# sourceMappingURL=FeedbackComposer.js.map