import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useReport } from "../../../providers/reportContext.js";
export const CASE_TAB_ACTIVE_CLASS = "bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)]";
export const CASE_TAB_INACTIVE_CLASS = "border-transparent bg-[var(--adaptive-surface-muted)]/60 text-[var(--adaptive-text-muted)] hover:bg-[var(--adaptive-surface-muted)] hover:text-[var(--adaptive-text-primary)]";
export const CASE_SELECTOR_ALL_TAB = "all";
export function CaseResolvedBadge({ resolvedLabel, openLabel, resolved }) {
    if (!resolved) {
        return null;
    }
    return (_jsx("span", { className: "inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-green500)] text-[10px] font-bold leading-none text-white", "aria-label": resolved ? resolvedLabel : openLabel, children: "\u2713" }));
}
export function FeedbackCaseTabBar(props) {
    const { cases, onSelectCase, idPrefix = "fivepixels-case", invalidCaseIds = [] } = props;
    const { messages } = useReport();
    const isEditor = props.variant === "editor";
    const invalidCaseIdSet = new Set(invalidCaseIds);
    if (cases.length === 0) {
        return null;
    }
    const tabList = (_jsxs(_Fragment, { children: [!isEditor ? (_jsx("div", { className: `flex shrink-0 items-stretch rounded-[8px] border border-b-0 ${props.activeTab === CASE_SELECTOR_ALL_TAB ? CASE_TAB_ACTIVE_CLASS : CASE_TAB_INACTIVE_CLASS}`, children: _jsx("button", { type: "button", role: "tab", "data-fivepixels-interactive": "", "aria-selected": props.activeTab === CASE_SELECTOR_ALL_TAB, "aria-controls": `${idPrefix}-panel-all`, id: `${idPrefix}-tab-all`, onClick: props.onSelectAll, "aria-label": messages.cases.allTabAriaLabel, className: "inline-flex min-w-0 items-center px-[10px] py-[6px] text-[12px] font-semibold leading-none", children: messages.cases.allTabLabel }) })) : null, cases.map((item, index) => {
                const isActive = isEditor ? item.id === props.activeCaseId : item.id === props.activeTab;
                const isInvalid = invalidCaseIdSet.has(item.id);
                const tabId = `${idPrefix}-tab-${item.id}`;
                const panelId = `${idPrefix}-panel-${item.id}`;
                return (_jsxs("div", { className: `flex max-w-[180px] shrink-0 items-stretch rounded-[8px] ` +
                        (isInvalid
                            ? "fivepixels-validation-attention border border-rose-400 bg-rose-500/10 text-rose-500"
                            : isActive
                                ? CASE_TAB_ACTIVE_CLASS
                                : CASE_TAB_INACTIVE_CLASS), children: [_jsxs("button", { type: "button", role: "tab", "data-fivepixels-interactive": "", "aria-selected": isActive, "aria-controls": panelId, "aria-invalid": isInvalid || undefined, id: tabId, onClick: () => onSelectCase(item.id), "aria-label": messages.composer.selectCaseTabAriaLabel(index + 1), className: ` inline-flex min-w-0 flex-1 items-center gap-[4px] truncate px-[10px] py-[6px] text-left leading-none`, title: messages.composer.caseTabLabel(index + 1), children: [_jsx("span", { className: `${isInvalid ? "text-rose-500" : isActive ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black700)]"} font-medium text-[12px] min-w-0 truncate`, children: messages.composer.caseTabLabel(index + 1) }), !isEditor && props.showResolvedStatus !== false ? (_jsx(CaseResolvedBadge, { resolved: item.status === "resolved", resolvedLabel: messages.cases.resolved, openLabel: messages.cases.open })) : null] }), isEditor && cases.length > 1 ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => props.onRemoveCase(item.id), "aria-label": messages.composer.removeCaseAriaLabel(index + 1), className: "inline-flex w-[22px] shrink-0 items-center justify-center rounded-tr-[8px] text-[14px] leading-none text-[var(--adaptive-text-muted)] hover:bg-[var(--adaptive-surface-muted)] hover:text-[var(--adaptive-text-primary)]", children: "\u00D7" })) : null] }, item.id));
            }), isEditor ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: props.onAddCase, "aria-label": messages.composer.addCaseTabAriaLabel, className: "mb-[1px] inline-flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[8px] border border-dashed border-[var(--adaptive-border-subtle)] text-[16px] font-medium leading-none text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-blue100)]", children: "+" })) : null] }));
    if (isEditor) {
        return (_jsx("div", { className: "flex min-h-0 shrink-0 items-end gap-[2px] overflow-x-auto border-b border-[var(--adaptive-border-subtle)] p-[4px]", role: "tablist", "aria-label": messages.cases.title, children: tabList }));
    }
    return (_jsx("div", { className: "mx-[4px] shrink-0 border-b border-[var(--adaptive-border-subtle)]", children: _jsxs("div", { className: "flex items-end gap-[4px]", children: [_jsx("div", { className: "flex min-w-0 flex-1 items-end gap-[2px] overflow-x-auto p-[4px]", role: "tablist", "aria-label": messages.cases.title, children: tabList }), props.trailing ? _jsx("div", { className: "shrink-0 self-center pr-[4px]", children: props.trailing }) : null] }) }));
}
//# sourceMappingURL=FeedbackCaseTabBar.js.map