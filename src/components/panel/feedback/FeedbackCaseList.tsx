import type { ReportCase } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";
import { getIssueProgressLabel } from "@/utils/reportCases.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";

type FeedbackCaseListProps = {
    cases: ReportCase[];
    isEditing?: boolean;
    canEdit?: boolean;
    isSaving?: boolean;
    errorMessage?: string;
    onBeginEdit?: () => void;
    onCancelEdit?: () => void;
    onSaveEdit?: () => void;
    onCaseChange?: (caseId: string, text: string) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
};

export function FeedbackCaseList({
    cases,
    isEditing = false,
    canEdit = false,
    isSaving = false,
    errorMessage = "",
    onBeginEdit,
    onCancelEdit,
    onSaveEdit,
    onCaseChange,
    onAddCase,
    onRemoveCase,
}: FeedbackCaseListProps) {
    const { messages } = useReport();
    const progressLabel = getIssueProgressLabel({ cases });

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
            <ul className="flex flex-col gap-[6px] px-[8px]">
                {cases.map((item, index) => (
                    <li
                        key={item.id}
                        className="flex items-start gap-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)]"
                    >
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
                        <span className={item.status === "resolved" ? "text-[var(--adaptive-black600)] line-through" : undefined}>{item.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
