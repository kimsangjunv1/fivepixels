import { useReport } from "@/providers/reportContext.js";

export function FeedbackCreatorBadge() {
    const { messages } = useReport();

    return (
        <span className="rounded-full border border-[var(--adaptive-border-subtle)] px-[6px] py-[1px] text-[10px] font-semibold leading-none text-[var(--adaptive-black500)]">
            {messages.author.creatorLabel}
        </span>
    );
}
