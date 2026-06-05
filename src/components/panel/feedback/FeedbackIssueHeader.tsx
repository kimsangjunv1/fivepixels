import type { ReportFeedback } from "../../../types/report.js";
import { getFeedbackDisplayStatus } from "../../../utils/feedbackThread.js";
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
        <section className="flex flex-col gap-[10px] bg-[var(--adaptive-whiteOpacity500)] p-[16px] backdrop-blur-[20px]">
            <FeedbackStatusBadge status={displayStatus} />
            <p className="text-[14px] leading-[1.45] font-semibold text-[var(--adaptive-black900)]">{report.message}</p>
            {report.author_name ? <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p> : null}
            <FeedbackFieldTags tags={fieldTags} />
        </section>
    );
}
