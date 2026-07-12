import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/constants/feedbackCategory.js";
import type { ReportMessages } from "@/i18n/types.js";

type FeedbackCategorySelectorProps = {
    value: FeedbackCategory | null;
    onChange: (value: FeedbackCategory) => void;
    messages: ReportMessages;
};

export function FeedbackCategorySelector({ value, onChange, messages }: FeedbackCategorySelectorProps) {
    return (
        <div
            className="flex flex-wrap items-center gap-[4px] border-t border-[var(--adaptive-tintOpacity100)] p-[4px]"
            role="group"
            aria-label={messages.composer.categoryAriaLabel}
        >
            {FEEDBACK_CATEGORIES.map((category) => {
                const selected = value === category;

                return (
                    <button
                        key={category}
                        type="button"
                        data-fivepixels-interactive=""
                        aria-pressed={selected}
                        onClick={() => onChange(category)}
                        className={
                            "rounded-[8px] border px-[12px] py-[4px] text-[12px] font-semibold " +
                            (selected
                                ? "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-inverse)] text-[var(--adaptive-text-inverse)]"
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
