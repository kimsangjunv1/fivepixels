import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SendIcon } from "../../icons/SendIcon.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FieldTagSelector } from "./FieldTagSelector.js";
export function FeedbackComposer({ message, onMessageChange, authorName, onAuthorNameChange, authors, fields, fieldValues, onFieldChange, showTags = false, onSubmit, isSubmitting = false, placeholder = "leave your message", autoFocus = false, }) {
    const handleSubmit = () => {
        if (isSubmitting) {
            return;
        }
        onSubmit();
    };
    return (_jsxs("div", { className: "flex w-full flex-col", children: [_jsx("textarea", { autoFocus: autoFocus, value: message, onChange: (event) => onMessageChange(event.target.value), placeholder: placeholder, rows: 3, className: "min-h-[72px] w-full resize-none bg-transparent px-[16px] pt-[16px] text-[14px] leading-[1.4] text-[var(--adaptive-grey900)] outline-none placeholder:text-[var(--adaptive-grey500)]", onKeyDown: (event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleSubmit();
                    }
                } }), _jsxs("div", { className: "flex items-center justify-between gap-[8px] px-[12px] pb-[12px]", children: [_jsx(AuthorSelector, { authors: authors, value: authorName, onChange: onAuthorNameChange }), _jsx("button", { type: "button", "data-stitchable-interactive": "", disabled: isSubmitting, onClick: handleSubmit, className: "inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-grey900)] text-[var(--adaptive-grey50)] disabled:opacity-50", "aria-label": "\uC804\uC1A1", children: _jsx(SendIcon, { className: "h-[16px] w-[16px]" }) })] }), showTags ? (_jsx(FieldTagSelector, { fields: fields, fieldValues: fieldValues, onFieldChange: (key, value) => onFieldChange(key, value) })) : null] }));
}
//# sourceMappingURL=FeedbackComposer.js.map