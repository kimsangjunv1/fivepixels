import type { ReportFeedback } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { formatDate } from "@/utils/format.js";
import { getIssueSummary } from "@/utils/reportCases.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";

type FeedbackIssuePinnedHeaderProps = {
    report: ReportFeedback;
    locale: ReportLocale;
};

export function FeedbackIssuePinnedHeader({ report, locale }: FeedbackIssuePinnedHeaderProps) {
    return (
        <section className="shrink-0 border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[12px] py-[8px]">
            <div className="flex items-center gap-[8px]">
                {report.author_name ? (
                    <div className="flex shrink-0 items-center gap-[4px]">
                        <p className="text-[12px] font-medium text-[var(--adaptive-black700)]">{report.author_name}</p>
                        <FeedbackCreatorBadge />
                    </div>
                ) : null}
                <p className="min-w-0 flex-1 truncate text-[12px] text-[var(--adaptive-black600)]">{getIssueSummary(report)}</p>
                <span className="shrink-0 text-[11px] tabular-nums text-[var(--adaptive-black500)]">{formatDate(report.created_at, locale)}</span>
            </div>
        </section>
    );
}
