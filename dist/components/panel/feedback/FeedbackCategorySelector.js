import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { FEEDBACK_CATEGORIES } from "../../../constants/feedbackCategory.js";
export function FeedbackCategorySelector({ value, onChange, messages, needsAttention = false, attentionKey = 0 }) {
    const containerRef = useRef(null);
    const firstButtonRef = useRef(null);
    useEffect(() => {
        if (!needsAttention || attentionKey <= 0) {
            return;
        }
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        firstButtonRef.current?.focus();
    }, [needsAttention, attentionKey]);
    return (_jsx("div", { ref: containerRef, className: 
        // "flex flex-wrap items-center gap-[4px] border-t border-[var(--adaptive-tintOpacity100)] p-[4px] transition-[box-shadow,background-color] duration-200 " +
        "flex flex-wrap items-center gap-[4px] p-[4px] transition-[box-shadow,background-color] duration-200 " +
            (needsAttention ? "fivepixels-validation-attention rounded-b-[12px] bg-rose-500/10" : ""), role: "group", "aria-label": messages.composer.categoryAriaLabel, "aria-invalid": needsAttention || undefined, children: FEEDBACK_CATEGORIES.map((category, index) => {
            const selected = value === category;
            return (_jsx(HoverTooltip, { label: messages.composer.categoryTooltip[category], multiline: true, children: _jsx("button", { ref: index === 0 ? firstButtonRef : undefined, type: "button", "data-fivepixels-interactive": "", "aria-pressed": selected, "aria-label": `${messages.composer.categoryOption[category]}. ${messages.composer.categoryTooltip[category]}`, onClick: () => onChange(category), className: "rounded-[8px] border px-[12px] py-[4px] text-[12px] font-semibold " +
                        (selected
                            ? "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-inverse)] text-[var(--adaptive-text-inverse)]"
                            : needsAttention
                                ? "border-rose-400 text-[var(--adaptive-text-primary)]"
                                : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-muted)]"), children: messages.composer.categoryOption[category] }) }, category));
        }) }));
}
//# sourceMappingURL=FeedbackCategorySelector.js.map