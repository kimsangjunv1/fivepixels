import type { ReportCase } from "@/types/report.js";

type FeedbackCaseChipsProps = {
    cases: ReportCase[];
    caseIds: string[];
};

export function FeedbackCaseChips({ cases, caseIds }: FeedbackCaseChipsProps) {
    if (caseIds.length === 0) {
        return null;
    }

    const chips = caseIds.flatMap((caseId) => {
        const label = cases.find((item) => item.id === caseId)?.text.trim();

        return label ? [{ caseId, label }] : [];
    });

    if (chips.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-[4px]">
            {chips.map(({ caseId, label }) => (
                <span
                    key={caseId}
                    className="max-w-full truncate rounded-full bg-[var(--adaptive-blue100)] px-[8px] py-[2px] text-[11px] font-medium text-[var(--adaptive-blue500)]"
                >
                    {label}
                </span>
            ))}
        </div>
    );
}
