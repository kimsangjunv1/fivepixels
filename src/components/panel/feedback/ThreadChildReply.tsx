import type { ReportReply } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { formatDate } from "@/utils/format.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";

type ThreadChildReplyProps = {
    reply: ReportReply;
    originalAuthorName: string;
    locale: ReportLocale;
    threadReplyPrefix: string;
};

export function ThreadChildReply({ reply, originalAuthorName, locale, threadReplyPrefix }: ThreadChildReplyProps) {
    return (
        <article className={`flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] ${threadReplyPrefix ? "py-[8px] pl-[18px]" : "py-[8px] pl-[12px]"}`}>
            <div className="flex items-start justify-between gap-[8px]">
                <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(reply.created_at, locale)}</span>
            </div>

            <p className="leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]">
                <span className="text-[var(--adaptive-black400)]">{threadReplyPrefix}</span> {reply.message}
            </p>

            {reply.author_name ? (
                <div className="flex items-center gap-[6px]">
                    <p className="text-[12px] text-[var(--adaptive-black500)]">{reply.author_name}</p>
                    {reply.author_name.trim() === originalAuthorName ? <FeedbackCreatorBadge /> : null}
                </div>
            ) : null}
        </article>
    );
}
