import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackDisplayStatus } from "@/utils/feedback/feedbackThread.js";
import { getCaseCount } from "@/utils/panel/experimentalPanelTabs.js";
import { FeedbackStatusBadge } from "@/components/panel/feedback/FeedbackStatusBadge.js";
import { useReportPreferences } from "@/providers/reportContext.js";

type ExperimentalFeedbackRowProps = {
    report: ReportFeedback;
    onOpen: (reportId: string) => void;
};

export function ExperimentalFeedbackRow({ report, onOpen }: ExperimentalFeedbackRowProps) {
    const { messages } = useReportPreferences();
    const status = getFeedbackDisplayStatus(report, true);
    const caseCount = getCaseCount(report);
    const preview = report.cases[0]?.text?.trim() || report.latest_reply?.message?.trim() || report.report_id;

    return (
        <button
            type="button"
            onClick={() => onOpen(report.id)}
            className="flex w-full flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left hover:bg-[var(--adaptive-black100)]"
        >
            <div className="flex items-start justify-between gap-[8px]">
                <FeedbackStatusBadge status={status} />
                <span className="shrink-0 rounded-[4px] bg-[var(--adaptive-black100)] px-[6px] py-[1px] text-[10px] font-semibold text-[var(--adaptive-black600)]">
                    {messages.panel.experimentalCaseCount.replace("{count}", String(caseCount))}
                </span>
            </div>
            <p className="line-clamp-2 text-[12px] font-semibold text-[var(--adaptive-black900)]">{preview}</p>
            <p className="truncate text-[11px] text-[var(--adaptive-black500)]">{report.pathname}</p>
        </button>
    );
}
