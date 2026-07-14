import { useEffect, useRef } from "react";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/constants/feedbackCategory.js";
import type { ReportMessages } from "@/i18n/types.js";

type FeedbackCategorySelectorProps = {
    value: FeedbackCategory | null;
    onChange: (value: FeedbackCategory) => void;
    messages: ReportMessages;
    needsAttention?: boolean;
    attentionKey?: number;
};

export function FeedbackCategorySelector({ value, onChange, messages, needsAttention = false, attentionKey = 0 }: FeedbackCategorySelectorProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const firstButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!needsAttention || attentionKey <= 0) {
            return;
        }

        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        firstButtonRef.current?.focus();
    }, [needsAttention, attentionKey]);

    return (
        <div
            ref={containerRef}
            className={
                "flex flex-wrap items-center gap-[4px] border-t border-[var(--adaptive-tintOpacity100)] p-[4px] transition-[box-shadow,background-color] duration-200 " +
                (needsAttention ? "fivepixels-validation-attention rounded-b-[12px] bg-rose-500/10" : "")
            }
            role="group"
            aria-label={messages.composer.categoryAriaLabel}
            aria-invalid={needsAttention || undefined}
        >
            {FEEDBACK_CATEGORIES.map((category, index) => {
                const selected = value === category;

                return (
                    <button
                        key={category}
                        ref={index === 0 ? firstButtonRef : undefined}
                        type="button"
                        data-fivepixels-interactive=""
                        aria-pressed={selected}
                        onClick={() => onChange(category)}
                        className={
                            "rounded-[8px] border px-[12px] py-[4px] text-[12px] font-semibold " +
                            (selected
                                ? "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-inverse)] text-[var(--adaptive-text-inverse)]"
                                : needsAttention
                                  ? "border-rose-400 text-[var(--adaptive-text-primary)]"
                                  : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-muted)]")
                        }
                    >
                        {messages.composer.categoryOption[category]}
                    </button>
                );
            })}
        </div>
    );
}
