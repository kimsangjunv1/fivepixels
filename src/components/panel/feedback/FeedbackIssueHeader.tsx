import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackDisplayStatus } from "@/utils/feedbackThread.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";

type FeedbackIssueHeaderProps = {
    report: ReportFeedback;
    fieldTags: { key: string; label: string }[];
    expanded?: boolean;
};

export function FeedbackIssueHeader({ report, fieldTags, expanded = true }: FeedbackIssueHeaderProps) {
    const displayStatus = getFeedbackDisplayStatus(report, expanded);

    return (
        <section className="flex flex-col gap-[12px] bg-[var(--adaptive-blackOpacity800)] p-[16px] backdrop-blur-[20px]">
            <section className="flex flex-col gap-[4px]">
                <FeedbackStatusBadge status={displayStatus} />
                <p className="text-[16px] leading-[1.5] font-semibold text-[var(--adaptive-black50)]">{report.message}</p>
                {report.author_name ? (
                    <div className="flex items-center gap-[6px]">
                        <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                        <FeedbackCreatorBadge />
                    </div>
                ) : null}
            </section>

            <FeedbackFieldTags tags={fieldTags} />
        </section>
    );
}
