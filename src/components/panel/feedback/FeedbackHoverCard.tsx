import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackDisplayStatus, getLatestReply, getRemainingReplyCount } from "@/utils/feedbackThread.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";

type FeedbackHoverCardProps = {
    report: ReportFeedback;
    fieldTags: { key: string; label: string }[];
};

export function FeedbackHoverCard({ report, fieldTags }: FeedbackHoverCardProps) {
    const displayStatus = getFeedbackDisplayStatus(report, false);
    const latestReply = getLatestReply(report);
    const remainingReplyCount = getRemainingReplyCount(report);

    return (
        <div className="flex w-[260px] flex-col gap-[10px] bg-transparent p-[16px]">
            <FeedbackStatusBadge status={displayStatus} />
            <p className="line-clamp-2 leading-[1.5] text-[16px] text-[var(--adaptive-text-primary)]">{report.message}</p>
            {report.author_name ? (
                <div className="flex items-center gap-[6px]">
                    <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                    <FeedbackCreatorBadge />
                </div>
            ) : null}
            <FeedbackFieldTags tags={fieldTags} />
            {latestReply ? (
                <div className="flex min-w-0 items-center gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[10px] text-[12px] text-[var(--adaptive-text-muted)]">
                    {latestReply.author_name ? (
                        <>
                            <span className="shrink-0">{latestReply.author_name}</span>
                            <span className="shrink-0 text-[var(--adaptive-black700)]">|</span>
                        </>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate text-[var(--adaptive-black400)]">{latestReply.message}</span>
                    {remainingReplyCount > 0 ? (
                        <>
                            <span className="shrink-0 text-[var(--adaptive-black700)]">|</span>
                            <span className="shrink-0 tabular-nums">+{remainingReplyCount}</span>
                        </>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
