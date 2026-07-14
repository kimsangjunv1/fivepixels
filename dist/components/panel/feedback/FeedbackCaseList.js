import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { getCaseHandlerName } from "../../../utils/report/reportCases.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";
import { CASE_SELECTOR_ALL_TAB, CaseResolvedBadge, FeedbackCaseTabBar } from "./FeedbackCaseTabBar.js";
function resolveFocusedCaseId(cases, focusedCaseId) {
    if (focusedCaseId && cases.some((item) => item.id === focusedCaseId)) {
        return focusedCaseId;
    }
    return cases[0]?.id ?? null;
}
function AllCasesList({ report, cases, onSelectCase }) {
    const { messages } = useReportPreferences();
    return (_jsx("ul", { className: "flex flex-col gap-[6px] px-[8px] py-[4px]", children: cases.map((item, index) => {
            const isOpen = item.status === "open";
            const handlerName = getCaseHandlerName(report, item.id);
            return (_jsx("li", { children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onSelectCase(item.id), className: "flex w-full items-start gap-[6px] rounded-[8px] px-[4px] py-[6px] text-left hover:bg-[var(--adaptive-surface-muted)]/60", children: [_jsxs("span", { className: "w-[20px] shrink-0 tabular-nums text-[12px] text-[var(--adaptive-black500)]", children: [index + 1, "."] }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("span", { className: `text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] ${item.status === "resolved" ? "text-[var(--adaptive-black600)] line-through" : ""}`, children: item.text }), isOpen ? (_jsxs("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black500)]", children: [messages.cases.assignee, ": ", handlerName ?? messages.cases.unassigned] })) : null] }), _jsx(CaseResolvedBadge, { resolved: item.status === "resolved", resolvedLabel: messages.cases.resolved, openLabel: messages.cases.open })] }) }, item.id));
        }) }));
}
export function FeedbackCaseList({ report, cases, isEditing = false, canEdit = false, isSaving = false, errorMessage = "", focusedCaseId = null, onSelectCase, onAllTabActiveChange, onBeginEdit, onCancelEdit, onSaveEdit, onCaseChange, onAddCase, onRemoveCase, }) {
    const { messages } = useReportPreferences();
    const resolvedFocusedCaseId = resolveFocusedCaseId(cases, focusedCaseId);
    const [selectorTab, setSelectorTab] = useState(() => resolvedFocusedCaseId ?? CASE_SELECTOR_ALL_TAB);
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
    const handleSelectCase = (caseId) => {
        setSelectorTab(caseId);
        onAllTabActiveChange?.(false);
        onSelectCase?.(caseId);
    };
    if (isEditing && onCaseChange && onAddCase && onRemoveCase) {
        return (_jsxs("div", { className: "flex flex-col gap-[8px]", children: [errorMessage ? (_jsx("p", { role: "alert", className: "rounded-[8px] border border-rose-200 bg-rose-50 px-[8px] py-[4px] text-[12px] leading-[1.4] text-rose-700", children: errorMessage })) : null, _jsx(FeedbackCaseEditor, { cases: cases, onCaseChange: onCaseChange, onAddCase: onAddCase, onRemoveCase: onRemoveCase, onSubmitShortcut: onSaveEdit }), _jsxs("div", { className: "flex justify-end gap-[6px] px-[8px] pb-[4px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isSaving, onClick: onCancelEdit, className: "rounded-full border border-[var(--adaptive-border-subtle)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-text-primary)] disabled:opacity-50", children: messages.common.cancel }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isSaving, onClick: onSaveEdit, className: "rounded-full bg-[var(--adaptive-blue500)] px-[10px] py-[4px] text-[12px] font-semibold text-white disabled:opacity-50", children: isSaving ? messages.cases.saving : messages.cases.save })] })] }));
    }
    return (_jsxs("div", { className: "flex flex-col gap-[8px]", children: [_jsx(FeedbackCaseTabBar, { variant: "selector", cases: cases, activeTab: selectorTab, onSelectAll: handleSelectAll, onSelectCase: handleSelectCase, showResolvedStatus: true, idPrefix: "fivepixels-thread-case", trailing: canEdit && onBeginEdit ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onBeginEdit, className: "rounded-full border border-[var(--adaptive-border-subtle)] px-[8px] py-[4px] text-[11px] font-semibold whitespace-nowrap text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-blue100)]", children: messages.cases.edit })) : null }), isAllTabActive ? (_jsx(AllCasesList, { report: report, cases: cases, onSelectCase: handleSelectCase })) : focusedCase ? (_jsxs("div", { className: "flex flex-col gap-[4px] px-[16px]", children: [_jsx("p", { className: `text-[16px] font-semibold leading-[1.5] text-[var(--adaptive-text-primary)] ${focusedCase.status === "resolved" ? "text-[var(--adaptive-black600)] line-through" : ""}`, children: focusedCase.text }), focusedCase.status === "open" ? (_jsxs("p", { className: "text-[14px] text-[var(--adaptive-black500)]", children: [messages.cases.assignee, ": ", getCaseHandlerName(report, focusedCase.id) ?? messages.cases.unassigned] })) : null] })) : null] }));
}
//# sourceMappingURL=FeedbackCaseList.js.map