import type { ReportCase, ReportFeedback } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";
import { getCaseHandlerName, getIssueProgressLabel } from "@/utils/reportCases.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";

type FeedbackCaseListProps = {
    report: Pick<ReportFeedback, "cases" | "replies" | "author_name">;
    cases: ReportCase[];
    isEditing?: boolean;
    canEdit?: boolean;
    isSaving?: boolean;
    errorMessage?: string;
    selectable?: boolean;
    focusedCaseId?: string | null;
    onSelectCase?: (caseId: string) => void;
    onBeginEdit?: () => void;
    onCancelEdit?: () => void;
    onSaveEdit?: () => void;
    onCaseChange?: (caseId: string, text: string) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
};

export function FeedbackCaseList({
    report,
    cases,
    isEditing = false,
    canEdit = false,
    isSaving = false,
    errorMessage = "",
    selectable = false,
    focusedCaseId = null,
    onSelectCase,
    onBeginEdit,
    onCancelEdit,
    onSaveEdit,
    onCaseChange,
    onAddCase,
    onRemoveCase,
}: FeedbackCaseListProps) {
    const { messages } = useReport();
    const progressLabel = getIssueProgressLabel({ cases });
    const hasOpenCases = cases.some((item) => item.status === "open");

    if (isEditing && onCaseChange && onAddCase && onRemoveCase) {
        return (
            <div className="flex flex-col gap-[8px]">
                {errorMessage ? (
                    <p
                        role="alert"
                        className="rounded-[8px] border border-rose-200 bg-rose-50 px-[8px] py-[4px] text-[12px] leading-[1.4] text-rose-700"
                    >
                        {errorMessage}
                    </p>
                ) : null}
                <FeedbackCaseEditor
                    cases={cases}
                    onCaseChange={onCaseChange}
                    onAddCase={onAddCase}
                    onRemoveCase={onRemoveCase}
                    onSubmitShortcut={onSaveEdit}
                />
                <div className="flex justify-end gap-[6px] px-[8px] pb-[4px]">
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={isSaving}
                        onClick={onCancelEdit}
                        className="rounded-full border border-[var(--adaptive-border-subtle)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-text-primary)] disabled:opacity-50"
                    >
                        {messages.common.cancel}
                    </button>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={isSaving}
                        onClick={onSaveEdit}
                        className="rounded-full bg-[var(--adaptive-blue500)] px-[10px] py-[4px] text-[12px] font-semibold text-white disabled:opacity-50"
                    >
                        {isSaving ? messages.cases.saving : messages.cases.save}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-[8px]">
            <div className="flex items-center justify-between gap-[8px] px-[8px]">
                <p className="text-[12px] font-medium text-[var(--adaptive-black600)]">
                    {messages.cases.title}
                    {progressLabel ? <span className="ml-[6px] tabular-nums text-[var(--adaptive-black500)]">({progressLabel})</span> : null}
                </p>
                {canEdit && onBeginEdit ? (
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onClick={onBeginEdit}
                        className="rounded-full border border-[var(--adaptive-border-subtle)] px-[8px] py-[2px] text-[11px] font-semibold text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-blue100)]"
                    >
                        {messages.cases.edit}
                    </button>
                ) : null}
            </div>
            {selectable && hasOpenCases ? (
                <p className="px-[8px] text-[11px] text-[var(--adaptive-black500)]">{messages.cases.selectToView}</p>
            ) : null}
            <ul className="flex flex-col gap-[6px] px-[8px]">
                {cases.map((item, index) => {
                    const isOpen = item.status === "open";
                    const isSelected = focusedCaseId === item.id;
                    const handlerName = getCaseHandlerName(report, item.id);

                    return (
                        <li
                            key={item.id}
                            className={`flex items-start gap-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] ${selectable && isSelected ? "rounded-[8px] bg-[var(--adaptive-blue100)]/60 px-[4px] py-[2px]" : ""}`}
                        >
                            {selectable ? (
                                <input
                                    type="radio"
                                    name="focused-case"
                                    data-fivepixels-interactive=""
                                    checked={isSelected}
                                    onChange={() => onSelectCase?.(item.id)}
                                    aria-label={item.text}
                                    className="mt-[6px] h-[14px] w-[14px] shrink-0 accent-[var(--adaptive-blue500)]"
                                />
                            ) : (
                                <span className="w-[14px] shrink-0" aria-hidden />
                            )}
                            <span className="w-[20px] shrink-0 tabular-nums text-[12px] text-[var(--adaptive-black500)]">{index + 1}.</span>
                            <span
                                className={`mt-[2px] inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                    item.status === "resolved"
                                        ? "bg-[var(--adaptive-green500)] text-white"
                                        : "border border-[var(--adaptive-border-subtle)] text-[var(--adaptive-black400)]"
                                }`}
                                aria-label={item.status === "resolved" ? messages.cases.resolved : messages.cases.open}
                            >
                                {item.status === "resolved" ? "✓" : ""}
                            </span>
                            <div className="min-w-0 flex-1">
                                <span className={item.status === "resolved" ? "text-[var(--adaptive-black600)] line-through" : undefined}>{item.text}</span>
                                {isOpen ? (
                                    <p className="mt-[2px] text-[11px] text-[var(--adaptive-black500)]">
                                        {messages.cases.assignee}: {handlerName ?? messages.cases.unassigned}
                                    </p>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
