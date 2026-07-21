import type { ReportFeedback } from "@/types/report.js";
import { getIssueProgressLabel, shouldShowCaseProgress } from "@/utils/report/reportCases.js";

type CaseProgressLabelProps = {
    report: Pick<ReportFeedback, "cases">;
    className?: string;
};

export function CaseProgressLabel({ report, className = "ml-[6px] tabular-nums text-[var(--adaptive-black500)]" }: CaseProgressLabelProps) {
    if (!shouldShowCaseProgress(report)) {
        return null;
    }

    const label = getIssueProgressLabel(report);

    if (!label) {
        return null;
    }

    return <span className={className}>({label})</span>;
}
