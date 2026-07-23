import { FEEDBACK_STATUS_COLOR, type FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import { CheckIcon } from "@/components/icons/Icons.js";
import { useReport, useReportPreferences } from "@/providers/reportContext.js";
import type { ReportCaseStatus } from "@/types/report.js";
import type { ReportFeedback } from "@/types/report.js";
import { getCaseLatestStatus } from "@/utils/feedback/feedbackThread.js";
import { getReportCases } from "@/utils/report/reportCases.js";
import { canRemoveCase } from "@/utils/feedback/feedbackPermissions.js";
import { FeedbackDeleteAction } from "@/components/panel/feedback/FeedbackDeleteAction.js";

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
    const { messages } = useReportPreferences();
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
    const { messages } = useReportPreferences();
    const { sessionActor, removePersistedCase, isUpdating } = useReport();
    const cases = getReportCases(report);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <p className="shrink-0 px-[14px] pb-[8px] pt-[4px] text-[12px] font-semibold text-[var(--adaptive-black500)]">{messages.cases.title}</p>

            <ul className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-auto px-[6px] pb-[10px]">
                {cases.map((item) => {
                    const isActive = item.id === focusedCaseId;
                    const status = getCaseLatestStatus(report, item.id);
                    const showRemove = canRemoveCase(report, item.id, sessionActor);

                    return (
                        <li
                            key={item.id}
                            className="group relative"
                        >
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                aria-current={isActive}
                                onClick={() => onSelectCase(item.id)}
                                className={`flex w-full flex-col items-start justify-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left transition-colors ${
                                    isActive ? "bg-[var(--adaptive-neutralTintOpacity900)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-tintOpacity100)]"
                                } ${showRemove ? "pr-[28px]" : ""}`}
                            >
                                <section className="flex w-full items-center gap-[4px]">
                                    <CaseStatusIndicator caseStatus={item.status} />
                                    <span
                                        className={`min-w-0 flex-1 truncate text-[14px] leading-[1] ${item.status === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`}
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

                            {showRemove ? (
                                <div className="absolute right-[6px] top-[10px] z-[1] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                    <FeedbackDeleteAction
                                        reportId={item.id}
                                        onDelete={async () => removePersistedCase(report, item.id)}
                                        disabled={isUpdating}
                                        messages={messages}
                                        deleteTitle={messages.cases.removeCaseTitle}
                                        deleteConfirmTitle={messages.cases.removeCaseConfirmTitle}
                                        deleteAriaLabel={messages.cases.removeCaseAriaLabel}
                                        deleteConfirmAriaLabel={messages.cases.removeCaseConfirmAriaLabel}
                                        className="flex h-[20px] w-[20px] items-center justify-center disabled:opacity-50 text-[var(--adaptive-black400)] hover:text-[var(--adaptive-black900)]"
                                    />
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
