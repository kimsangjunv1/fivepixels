import { jsx as _jsx } from "react/jsx-runtime";
import { FEEDBACK_CATEGORIES } from "../../../constants/feedbackCategory.js";
export function FeedbackCategorySelector({ value, onChange, messages }) {
    return (_jsx("div", { className: "flex flex-wrap items-center gap-[4px] border-t border-[var(--adaptive-tintOpacity100)] p-[4px]", role: "group", "aria-label": messages.composer.categoryAriaLabel, children: FEEDBACK_CATEGORIES.map((category) => {
            const selected = value === category;
            return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-pressed": selected, onClick: () => onChange(category), className: "rounded-[8px] border px-[12px] py-[4px] text-[12px] font-semibold " +
                    (selected
                        ? "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-inverse)] text-[var(--adaptive-text-inverse)]"
                        : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-muted)]"), children: messages.composer.categoryOption[category] }, category));
        }) }));
}
//# sourceMappingURL=FeedbackCategorySelector.js.map