import type { ReportFeedback } from "@/types/report.js";
import type { MarkerDetachedKind } from "@/types/report-ui.js";
import { getDetachedMarkerHint } from "@/utils/markerContext.js";
import { getIssueSummary } from "@/utils/reportCases.js";
import { getFeedbackDisplayStatus, getLatestReply, getRemainingReplyCount } from "@/utils/feedbackThread.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";

type FeedbackHoverCardProps = {
    report: ReportFeedback;
    fieldTags: { key: string; label: string }[];
    detached?: boolean;
    detachedKind?: MarkerDetachedKind;
    detachedHint?: string;
    detachedModalHint?: string;
};

export function FeedbackHoverCard({ report, fieldTags, detached = false, detachedKind = null, detachedHint, detachedModalHint }: FeedbackHoverCardProps) {
    const displayStatus = getFeedbackDisplayStatus(report, true);
    const latestReply = getLatestReply(report);
    const remainingReplyCount = getRemainingReplyCount(report);
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint }) : null;

    return (
        // <div className="flex w-[260px] flex-col gap-[10px] bg-transparent p-[16px]">
        <div className="flex w-[260px] flex-col gap-[4px] bg-transparent p-[8px_8px]">
            <FeedbackStatusBadge status={displayStatus} />

            {resolvedDetachedHint ? <p className="text-[12px] leading-[1.4] text-[var(--adaptive-black500)]">{resolvedDetachedHint}</p> : null}

            <p className="line-clamp-2 leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]">{getIssueSummary(report)}</p>

            {report.author_name ? (
                <div className="flex items-center gap-[6px]">
                    <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                    <FeedbackCreatorBadge />
                </div>
            ) : null}

            <FeedbackFieldTags tags={fieldTags} />

            {latestReply ? (
                <div className="flex min-w-0 items-center gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[10px] text-[12px] text-[var(--adaptive-text-muted)]">
                    <span className="text-[var(--adaptive-black900)]">↳</span>
                    <span className="min-w-0 flex-1 truncate text-[var(--adaptive-black900)] text-[14px]">{latestReply.message}</span>
                    {remainingReplyCount > 0 ? <span className="text-[12px] bg-[var(--adaptive-black500)] rounded-full p-[2px_4px] text-white">+{remainingReplyCount}</span> : null}
                </div>
            ) : null}
        </div>
    );
}
