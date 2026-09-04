import { useReportPreferences } from "@/shared/providers/reportContext.js";

export function FeedbackMineBadge() {
    const { messages } = useReportPreferences();

    return <span className="rounded-full px-[6px] py-[1px] text-[12px] font-semibold leading-none bg-[var(--adaptive-blue300)] text-[var(--adaptive-black50)]">{messages.author.myLabel}</span>;
}
