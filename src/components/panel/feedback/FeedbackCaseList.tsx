import { useEffect, useState } from "react";
import type { ReportCase, ReportFeedback } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";
import { getCaseHandlerName } from "@/utils/reportCases.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";
import { CASE_SELECTOR_ALL_TAB, CaseResolvedBadge, FeedbackCaseTabBar, type CaseSelectorTab } from "./FeedbackCaseTabBar.js";

type FeedbackCaseListProps = {
    report: Pick<ReportFeedback, "id" | "cases" | "replies" | "author_name">;
    cases: ReportCase[];
    isEditing?: boolean;
    canEdit?: boolean;
    isSaving?: boolean;
    errorMessage?: string;
    focusedCaseId?: string | null;
    onSelectCase?: (caseId: string) => void;
    onAllTabActiveChange?: (active: boolean) => void;
    onBeginEdit?: () => void;
    onCancelEdit?: () => void;
    onSaveEdit?: () => void;
    onCaseChange?: (caseId: string, text: string) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
};

function resolveFocusedCaseId(cases: ReportCase[], focusedCaseId: string | null | undefined) {
    if (focusedCaseId && cases.some((item) => item.id === focusedCaseId)) {
        return focusedCaseId;
    }

    return cases[0]?.id ?? null;
}

type AllCasesListProps = {
    report: Pick<ReportFeedback, "id" | "cases" | "replies" | "author_name">;
    cases: ReportCase[];
    onSelectCase: (caseId: string) => void;
};

function AllCasesList({ report, cases, onSelectCase }: AllCasesListProps) {
    const { messages } = useReport();

    return (
        <ul className="flex flex-col gap-[6px] px-[8px] py-[4px]">
            {cases.map((item, index) => {
                const isOpen = item.status === "open";
                const handlerName = getCaseHandlerName(report, item.id);

                return (
                    <li key={item.id}>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={() => onSelectCase(item.id)}
                            className="flex w-full items-start gap-[6px] rounded-[8px] px-[4px] py-[6px] text-left hover:bg-[var(--adaptive-surface-muted)]/60"
                        >
                            <span className="w-[20px] shrink-0 tabular-nums text-[12px] text-[var(--adaptive-black500)]">{index + 1}.</span>
                            <div className="min-w-0 flex-1">
                                <span className={`text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] ${item.status === "resolved" ? "text-[var(--adaptive-black600)] line-through" : ""}`}>
                                    {item.text}
                                </span>
                                {isOpen ? (
                                    <p className="mt-[2px] text-[11px] text-[var(--adaptive-black500)]">
                                        {messages.cases.assignee}: {handlerName ?? messages.cases.unassigned}
                                    </p>
                                ) : null}
                            </div>
                            <CaseResolvedBadge
                                resolved={item.status === "resolved"}
                                resolvedLabel={messages.cases.resolved}
                                openLabel={messages.cases.open}
                            />
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

export function FeedbackCaseList({
    report,
    cases,
    isEditing = false,
    canEdit = false,
    isSaving = false,
    errorMessage = "",
    focusedCaseId = null,
    onSelectCase,
    onAllTabActiveChange,
    onBeginEdit,
    onCancelEdit,
    onSaveEdit,
    onCaseChange,
    onAddCase,
    onRemoveCase,
}: FeedbackCaseListProps) {
    const { messages } = useReport();
    const resolvedFocusedCaseId = resolveFocusedCaseId(cases, focusedCaseId);
    const [selectorTab, setSelectorTab] = useState<CaseSelectorTab>(() => resolvedFocusedCaseId ?? CASE_SELECTOR_ALL_TAB);
    const focusedCase = cases.find((item) => item.id === resolvedFocusedCaseId) ?? null;
    const isAllTabActive = selectorTab === CASE_SELECTOR_ALL_TAB;

    useEffect(() => {
        if (!resolvedFocusedCaseId) {
            return;
        }

        setSelectorTab(resolvedFocusedCaseId);
        onAllTabActiveChange?.(false);
    }, [onAllTabActiveChange, report.id, resolvedFocusedCaseId]);

    const handleSelectAll = () => {
        setSelectorTab(CASE_SELECTOR_ALL_TAB);
        onAllTabActiveChange?.(true);
    };

    const handleSelectCase = (caseId: string) => {
        setSelectorTab(caseId);
        onAllTabActiveChange?.(false);
        onSelectCase?.(caseId);
    };

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
            <FeedbackCaseTabBar
                variant="selector"
                cases={cases}
                activeTab={selectorTab}
                onSelectAll={handleSelectAll}
                onSelectCase={handleSelectCase}
                showResolvedStatus
                idPrefix="fivepixels-thread-case"
                trailing={
                    canEdit && onBeginEdit ? (
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={onBeginEdit}
                            className="rounded-full border border-[var(--adaptive-border-subtle)] px-[8px] py-[4px] text-[11px] font-semibold whitespace-nowrap text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-blue100)]"
                        >
                            {messages.cases.edit}
                        </button>
                    ) : null
                }
            />

            {isAllTabActive ? (
                <AllCasesList
                    report={report}
                    cases={cases}
                    onSelectCase={handleSelectCase}
                />
            ) : focusedCase ? (
                <div className="flex flex-col gap-[4px] px-[16px]">
                    <p
                        className={`text-[16px] font-semibold leading-[1.5] text-[var(--adaptive-text-primary)] ${focusedCase.status === "resolved" ? "text-[var(--adaptive-black600)] line-through" : ""}`}
                    >
                        {focusedCase.text}
                    </p>

                    {focusedCase.status === "open" ? (
                        <p className="text-[14px] text-[var(--adaptive-black500)]">
                            {messages.cases.assignee}: {getCaseHandlerName(report, focusedCase.id) ?? messages.cases.unassigned}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
