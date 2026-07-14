import type { ReportFeedback } from "@/types/report.js";
import { getIssueSummary } from "@/utils/report/reportCases.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { CaseProgressLabel } from "./CaseProgressLabel.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";

type FeedbackIssueHeaderProps = {
    report: ReportFeedback;
    fieldTags: { key: string; label: string }[];
};

export function FeedbackIssueHeader({ report, fieldTags }: FeedbackIssueHeaderProps) {
    const { messages } = useReportPreferences();

    return (
        <section className="flex flex-col gap-[12px] bg-transparent p-[8px]">
            <section className="flex flex-col gap-[4px]">
                <p className="text-[16px] leading-[1.5] font-semibold text-[var(--adaptive-text-primary)]">
                    {getIssueSummary(report, { summaryMore: messages.cases.summaryMore })}
                    <CaseProgressLabel report={report} className="ml-[6px] text-[14px] font-medium text-[var(--adaptive-black500)]" />
                </p>

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
