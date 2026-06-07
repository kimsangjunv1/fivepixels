import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackDisplayStatus } from "@/utils/feedbackThread.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";

type FeedbackHoverCardProps = {
    report: ReportFeedback;
    fieldTags: { key: string; label: string }[];
};

export function FeedbackHoverCard({ report, fieldTags }: FeedbackHoverCardProps) {
    const displayStatus = getFeedbackDisplayStatus(report, false);

    return (
        <div className="flex w-[260px] flex-col gap-[10px] p-[16px] bg-[var(--adaptive-blackOpacity800)] backdrop-blur-[10px]">
            <FeedbackStatusBadge status={displayStatus} />
            <p className="line-clamp-2 leading-[1.5] text-[16px] text-[var(--adaptive-black50)]">{report.message}</p>
            {report.author_name ? (
                <div className="flex items-center gap-[6px]">
                    <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                    <FeedbackCreatorBadge />
                </div>
            ) : null}
            <FeedbackFieldTags tags={fieldTags} />
        </div>
    );
}
