import { FEEDBACK_STATUS_COLOR, type FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import { CheckIcon } from "@/components/icons/Icons.js";
import { useReport } from "@/providers/reportContext.js";
import type { ReportCaseStatus } from "@/types/report.js";
import type { ReportFeedback } from "@/types/report.js";
import { getCaseLatestStatus } from "@/utils/feedbackThread.js";
import { getReportCases } from "@/utils/reportCases.js";

type MarkerCaseSidebarProps = {
    report: ReportFeedback;
    focusedCaseId: string | null;
    onSelectCase: (caseId: string) => void;
};

function CaseStatusIndicator({ caseStatus }: { caseStatus: ReportCaseStatus }) {
    if (caseStatus === "resolved") {
        return (
            <span
                aria-hidden
                className="inline-flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: FEEDBACK_STATUS_COLOR.resolved }}
            >
                <CheckIcon className="h-[8px] w-[8px] text-white" />
            </span>
        );
    }

    return (
        <span
            aria-hidden
            className="inline-flex h-[12px] w-[12px] shrink-0 rounded-full border border-[var(--adaptive-black300)]"
        />
    );
}

function CaseStatusLabel({ status, isNeedGray }: { status: FeedbackDisplayStatus; isNeedGray?: boolean }) {
    const { messages } = useReport();
    const color = FEEDBACK_STATUS_COLOR[status];

    return (
        <span
            className="shrink-0 whitespace-nowrap text-[11px] font-semibold leading-none"
            style={{ color: isNeedGray ? "var(--adaptive-black500)" : color }}
        >
            {messages.status.feedback[status]}
        </span>
    );
}

export function MarkerCaseSidebar({ report, focusedCaseId, onSelectCase }: MarkerCaseSidebarProps) {
    const { messages } = useReport();
    const cases = getReportCases(report);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <p className="shrink-0 px-[14px] pb-[8px] pt-[4px] text-[12px] font-semibold text-[var(--adaptive-black500)]">{messages.cases.title}</p>

            <ul className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-auto px-[6px] pb-[10px]">
                {cases.map((item) => {
                    const isActive = item.id === focusedCaseId;
                    const status = getCaseLatestStatus(report, item.id);

                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                aria-current={isActive}
                                onClick={() => onSelectCase(item.id)}
                                className={`flex flex-col w-full items-start justify-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left transition-colors ${
                                    isActive ? "bg-[var(--adaptive-neutralTintOpacity900)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-tintOpacity100)]"
                                }`}
                            >
                                <section className="flex items-center gap-[4px] w-full">
                                    <CaseStatusIndicator caseStatus={item.status} />
                                    <span
                                        className={`min-w-0 flex-1 w-full truncate text-[14px] leading-[1] ${item.status === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`}
                                        title={item.text}
                                    >
                                        {item.text}
                                    </span>
                                </section>
                                <CaseStatusLabel
                                    status={status}
                                    isNeedGray
                                />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
