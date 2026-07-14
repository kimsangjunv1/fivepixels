import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDateOnly } from "../../utils/shared/format.js";
import { ShortcutHint } from "../../components/ShortcutHint.js";
import { SearchIcon, ChevronDownIcon } from "../../components/icons/Icons.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { FeedbackListItem } from "./feedback/FeedbackListItem.js";
const FEEDBACK_PAGE_SIZE = 20;
function getDateGroupKey(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function groupReportsByDate(reports, locale) {
    const groups = [];
    const groupMap = new Map();
    for (const report of reports) {
        const dateKey = getDateGroupKey(report.created_at);
        const existing = groupMap.get(dateKey);
        if (existing) {
            existing.push(report);
        }
        else {
            groupMap.set(dateKey, [report]);
        }
    }
    for (const [dateKey, groupedReports] of groupMap) {
        groups.push({
            dateKey,
            label: formatDateOnly(groupedReports[0].created_at, locale),
            reports: groupedReports,
        });
    }
    return groups;
}
export function ReportFeedbackList() {
    const { filters, setFilters, filteredReports, reports, listScope, setListScope, canListAllFeedback, locale, messages, isError, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, isDeleting, queryErrorMessage, visibleShortcutKeys, searchInputRef, locateFeedback, refetch, handleDelete, canCreateGitHubIssueFromList, creatingGitHubIssueId, handleCreateGitHubIssue, } = useReport();
    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const [expandedGroups, setExpandedGroups] = useState(() => new Set());
    const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const loadMoreRef = useRef(null);
    const scopeLabel = listScope === "current" ? messages.feedbackList.scopeCurrentPage : messages.feedbackList.scopeAllPages;
    const statusLabel = filters.status === "all" ? messages.feedbackList.filterStatusAll : messages.status.routeDetail[filters.status];
    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    const groupedReports = useMemo(() => groupReportsByDate(visibleReports, locale), [locale, visibleReports]);
    useEffect(() => {
        setVisibleCount(FEEDBACK_PAGE_SIZE);
    }, [filters.dateKey, filters.keyword, filters.reportType, filters.status, listScope, reports.length]);
    useEffect(() => {
        if (filters.dateKey) {
            setExpandedGroups(new Set([filters.dateKey]));
            return;
        }
        const firstGroupKey = groupedReports[0]?.dateKey;
        if (firstGroupKey) {
            setExpandedGroups((current) => (current.size === 0 ? new Set([firstGroupKey]) : current));
        }
    }, [filters.dateKey, groupedReports]);
    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node) {
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) {
                return;
            }
            if (visibleCount < filteredReports.length) {
                setVisibleCount((current) => current + FEEDBACK_PAGE_SIZE);
                return;
            }
            if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
            }
        }, { rootMargin: "120px" });
        observer.observe(node);
        return () => {
            observer.disconnect();
        };
    }, [fetchNextPage, filteredReports.length, hasNextPage, isFetchingNextPage, visibleCount]);
    const toggleGroup = (dateKey) => {
        setExpandedGroups((current) => {
            const next = new Set(current);
            if (next.has(dateKey)) {
                next.delete(dateKey);
            }
            else {
                next.add(dateKey);
            }
            return next;
        });
    };
    return (_jsxs("section", { className: "flex min-h-0 max-h-[51.2rem] flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]", children: [_jsxs("div", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]", children: [filters.dateKey ? (_jsxs("div", { className: "flex items-center justify-between gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[8px] py-[6px]", children: [_jsx("p", { className: "text-[11px] font-[600] text-[var(--adaptive-blue500)]", children: messages.activityHeatmap.dateFilterLabel.replace("{date}", formatDateOnly(`${filters.dateKey}T12:00:00`, locale)) }), _jsx("button", { type: "button", onClick: () => setFilters((current) => ({ ...current, dateKey: null })), className: "text-[11px] font-[600] text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: messages.activityHeatmap.clearDateFilter })] })) : null, _jsxs("div", { className: "flex items-center", children: [_jsxs("section", { className: "h-[32px] flex items-center", children: [canListAllFeedback ? (_jsx(PanelDropdownMenu, { open: scopeMenuOpen, onClose: () => setScopeMenuOpen(false), align: "left", trigger: _jsxs("button", { type: "button", onClick: () => setScopeMenuOpen((current) => !current), "aria-expanded": scopeMenuOpen, "aria-haspopup": "menu", "aria-label": messages.feedbackList.scopeAriaLabel, className: `${scopeMenuOpen ? "bg-[#f6562f] hover:bg-[#bc3110]" : "hover:bg-[var(--adaptive-black50)]"} flex h-full min-w-[72px] items-center justify-center gap-[4px] px-[8px] text-[14px] text-[var(--adaptive-black800)] outline-none hover:bg-[var(--adaptive-black100)]`, children: [_jsx("span", { className: `${scopeMenuOpen ? "text-white" : ""} truncate`, children: scopeLabel }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${scopeMenuOpen ? "rotate-180" : ""}` })] }), children: ["current", "all"].map((scope) => (_jsx(PanelDropdownMenuItem, { active: listScope === scope, onClick: () => {
                                                setScopeMenuOpen(false);
                                                setListScope(scope);
                                            }, children: scope === "current" ? messages.feedbackList.scopeCurrentPage : messages.feedbackList.scopeAllPages }, scope))) })) : null, _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" }), _jsxs(PanelDropdownMenu, { open: statusMenuOpen, onClose: () => setStatusMenuOpen(false), align: "left", trigger: _jsxs("button", { type: "button", onClick: () => setStatusMenuOpen((current) => !current), "aria-expanded": statusMenuOpen, "aria-haspopup": "menu", "aria-label": messages.feedbackList.filterStatusAriaLabel, className: `${statusMenuOpen ? "bg-[#f6562f] hover:bg-[#bc3110]" : "hover:bg-[var(--adaptive-black50)]"} flex h-full min-w-[72px] items-center justify-center px-[8px] text-[14px] text-[var(--adaptive-black800)] outline-none`, children: [_jsx("span", { className: `${statusMenuOpen ? "text-white" : ""} truncate`, children: statusLabel }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${statusMenuOpen ? "rotate-180" : ""}` })] }), children: [_jsx(PanelDropdownMenuItem, { active: filters.status === "all", onClick: () => {
                                                    setStatusMenuOpen(false);
                                                    setFilters((current) => ({ ...current, status: "all" }));
                                                }, children: messages.feedbackList.filterStatusAll }), Object.keys(messages.status.routeDetail).map((status) => (_jsx(PanelDropdownMenuItem, { active: filters.status === status, onClick: () => {
                                                    setStatusMenuOpen(false);
                                                    setFilters((current) => ({ ...current, status }));
                                                }, children: messages.status.routeDetail[status] }, status)))] })] }), _jsx("div", { className: "h-[32px] w-[1px] bg-[var(--adaptive-border-subtle)]" }), _jsxs("div", { className: "relative w-full", children: [_jsx("input", { ref: searchInputRef, value: filters.keyword, onChange: (event) => setFilters((current) => ({ ...current, keyword: event.target.value })), placeholder: messages.feedbackList.searchPlaceholder, className: "h-[32px] w-full px-[8px] pr-[30px] text-[14px] text-[var(--adaptive-black800)] outline-none" }), _jsx(SearchIcon, { className: "pointer-events-none absolute right-[8px] top-[25%] h-4 w-4 -translate-y-1/2 text-[var(--adaptive-black500)]" }), _jsx("div", { className: "absolute right-[30px] top-1/2 -translate-y-1/2", children: _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.focusSearch, visible: visibleShortcutKeys }) })] })] })] }), _jsxs("div", { className: "min-h-0 min-w-0 flex-1 overflow-y-auto bg-[var(--adaptive-black50)]", children: [isError ? (_jsxs("div", { className: "m-[8px] space-y-1 rounded-md border border-[var(--adaptive-border-subtle)] bg-rose-50 p-2 text-xs text-rose-800", children: [_jsx("strong", { className: "text-sm font-semibold", children: messages.feedbackList.loadFailedTitle }), _jsx("p", { children: queryErrorMessage ?? messages.feedbackList.loadFailedRetry }), _jsx("button", { type: "button", onClick: () => void refetch(), className: "inline-flex items-center justify-center rounded-md border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-3 py-1 text-xs font-medium text-[var(--adaptive-text-secondary)]", children: messages.common.retry })] })) : null, !isError && !isFetching && filteredReports.length === 0 ? (_jsxs("div", { className: "flex flex-col gap-[4px] bg-[var(--adaptive-black200)] p-[12px]", children: [_jsx("h6", { className: "font-semibold text-[var(--adaptive-black900)]", children: messages.feedbackList.emptyTitle }), _jsx("p", { className: "whitespace-break-spaces text-[12px] leading-[1.5] text-[var(--adaptive-black500)]", children: reports.length === 0 ? messages.feedbackList.emptyNoFeedback : messages.feedbackList.emptyNoMatch })] })) : null, _jsx("section", { className: "flex flex-col", children: groupedReports.map(({ dateKey, label, reports: groupReports }) => {
                            const isExpanded = expandedGroups.has(dateKey);
                            return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("button", { type: "button", onClick: () => toggleGroup(dateKey), "aria-expanded": isExpanded, className: "sticky top-0 z-10 flex w-full items-center justify-between border-b border-b-[var(--adaptive-border-subtle)] p-[8px_16px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black900)]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}` })] }), isExpanded
                                        ? groupReports.map((report) => (_jsx(FeedbackListItem, { report: report, locale: locale, messages: messages, listScope: listScope, disabled: isDeleting, canCreateGitHubIssue: canCreateGitHubIssueFromList, creatingGitHubIssueId: creatingGitHubIssueId, onLocate: locateFeedback, onDelete: handleDelete, onCreateGitHubIssue: handleCreateGitHubIssue }, report.id)))
                                        : null] }, dateKey));
                        }) }), visibleCount < filteredReports.length || hasNextPage ? (_jsx("div", { ref: loadMoreRef, className: "py-[8px] text-center text-[12px] text-[var(--adaptive-black500)]", children: isFetchingNextPage ? messages.feedbackList.loadingMore : "" })) : null] })] }));
}
//# sourceMappingURL=ReportFeedbackList.js.map