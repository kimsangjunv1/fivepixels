import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { REPORT_SHORTCUTS } from "../../shared/constants/reportShortcuts.js";
import { useReportData, useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { formatDateOnly } from "../../shared/utils/shared/format.js";
import { ShortcutHint } from "../../shared/components/ShortcutHint.js";
import { SearchIcon, ChevronDownIcon } from "../../shared/components/icons/Icons.js";
import { IntegrationLockTip, useIntegrationLock } from "../../shared/components/ui/IntegrationLock.js";
import { DropdownMenu, DropdownMenuItem } from "../../shared/components/ui/DropdownMenu.js";
import { FeedbackListItem } from "../../surfaces/feedback/FeedbackListItem.js";
import { NoticeDialog } from "../../shared/components/ui/NoticeDialog.js";
import { casesToSearchText, getReportCases } from "../../shared/utils/report/reportCases.js";
const FEEDBACK_PAGE_SIZE = 20;
function isMemoReport(report) {
    return report.category === "memo";
}
function matchesMemoKeyword(report, keyword) {
    if (!keyword) {
        return true;
    }
    const haystack = [casesToSearchText(getReportCases(report)), report.pathname, typeof report.fc_number === "number" ? `#mm-${report.fc_number}` : ""].join(" ").toLowerCase();
    return haystack.includes(keyword);
}
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
export function ReportFeedbackList({ listKind = "feedback" }) {
    const { locale, messages, visibleShortcutKeys } = useReportPreferences();
    const { searchInputRef, locateFeedback } = useReportSession();
    const { filters, setFilters, filteredReports: allFilteredReports, reports, listScope, setListScope, canListAllFeedback, isError, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, isDeleting, queryErrorMessage, refetch, handleDelete, canCreateGitHubIssueFromList, creatingGitHubIssueId, handleCreateGitHubIssue, } = useReportData();
    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const [expandedGroups, setExpandedGroups] = useState(() => new Set());
    const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const loadMoreRef = useRef(null);
    const filteredReports = useMemo(() => {
        if (listKind === "memo") {
            const keyword = filters.keyword.trim().toLowerCase();
            return reports.filter((report) => isMemoReport(report) && matchesMemoKeyword(report, keyword));
        }
        return allFilteredReports.filter((report) => !isMemoReport(report));
    }, [allFilteredReports, filters.keyword, listKind, reports]);
    const isMemoList = listKind === "memo";
    const scopeLabel = listScope === "current" ? messages.feedbackList.scopeCurrentPage : messages.feedbackList.scopeAllPages;
    const statusLabel = filters.status === "all" ? messages.feedbackList.filterStatusAll : messages.status.routeDetail[filters.status];
    const listAllLock = useIntegrationLock("listAll");
    const persistenceLock = useIntegrationLock("feedbackPersistence");
    const showScopeControl = !isMemoList && (canListAllFeedback || listAllLock.locked);
    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    const groupedReports = useMemo(() => groupReportsByDate(visibleReports, locale), [locale, visibleReports]);
    useEffect(() => {
        setVisibleCount(FEEDBACK_PAGE_SIZE);
    }, [filters.dateKey, filters.keyword, filters.reportType, filters.status, listKind, listScope, reports.length]);
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
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]", children: [_jsxs("div", { className: "relative z-[20] shrink-0 border-b border-b-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]", children: [filters.dateKey ? (_jsxs("div", { className: "flex items-center justify-between gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[8px] py-[6px]", children: [_jsx("p", { className: "text-[12px] font-[600] text-[var(--adaptive-blue500)]", children: messages.activityHeatmap.dateFilterLabel.replace("{date}", formatDateOnly(`${filters.dateKey}T12:00:00`, locale)) }), _jsx("button", { type: "button", onClick: () => setFilters((current) => ({ ...current, dateKey: null })), className: "text-[12px] font-[600] text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: messages.activityHeatmap.clearDateFilter })] })) : null, _jsxs("div", { className: "flex items-center", children: [!isMemoList ? (_jsxs("section", { className: "h-[32px] flex items-center", children: [showScopeControl ? (_jsx(IntegrationLockTip, { locked: listAllLock.locked, label: listAllLock.tooltipLabel, children: _jsx(DropdownMenu, { open: scopeMenuOpen && !listAllLock.locked, onClose: () => setScopeMenuOpen(false), align: "left", trigger: _jsxs("button", { type: "button", onClick: () => {
                                                    if (listAllLock.locked) {
                                                        return;
                                                    }
                                                    setScopeMenuOpen((current) => !current);
                                                }, disabled: listAllLock.locked, "aria-expanded": scopeMenuOpen, "aria-haspopup": "menu", "aria-label": messages.feedbackList.scopeAriaLabel, className: `${scopeMenuOpen ? "bg-[var(--adaptive-accent-coral)] hover:bg-[var(--adaptive-accent-coral-hover)]" : "hover:bg-[var(--adaptive-black50)]"} flex h-full min-w-[72px] items-center justify-center gap-[4px] px-[8px] text-[14px] text-[var(--adaptive-black800)] outline-none disabled:cursor-not-allowed disabled:opacity-50`, children: [_jsx("span", { className: `${scopeMenuOpen ? "text-white" : ""} truncate`, children: listAllLock.locked ? messages.feedbackList.scopeAllPages : scopeLabel }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${scopeMenuOpen ? "rotate-180" : ""}` })] }), children: ["current", "all"].map((scope) => (_jsx(DropdownMenuItem, { active: listScope === scope, onClick: () => {
                                                    setScopeMenuOpen(false);
                                                    setListScope(scope);
                                                }, children: scope === "current" ? messages.feedbackList.scopeCurrentPage : messages.feedbackList.scopeAllPages }, scope))) }) })) : null, _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" }), _jsxs(DropdownMenu, { open: statusMenuOpen, onClose: () => setStatusMenuOpen(false), align: "left", trigger: _jsxs("button", { type: "button", onClick: () => setStatusMenuOpen((current) => !current), "aria-expanded": statusMenuOpen, "aria-haspopup": "menu", "aria-label": messages.feedbackList.filterStatusAriaLabel, className: `${statusMenuOpen ? "bg-[var(--adaptive-accent-coral)] hover:bg-[var(--adaptive-accent-coral-hover)]" : "hover:bg-[var(--adaptive-black50)]"} flex h-full min-w-[72px] items-center justify-center gap-[4px] px-[8px] text-[14px] text-[var(--adaptive-black800)] outline-none`, children: [_jsx("span", { className: `${statusMenuOpen ? "text-white" : ""} truncate`, children: statusLabel }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${statusMenuOpen ? "rotate-180" : ""}` })] }), children: [_jsx(DropdownMenuItem, { active: filters.status === "all", onClick: () => {
                                                    setStatusMenuOpen(false);
                                                    setFilters((current) => ({ ...current, status: "all" }));
                                                }, children: messages.feedbackList.filterStatusAll }), Object.keys(messages.status.routeDetail).map((status) => (_jsx(DropdownMenuItem, { active: filters.status === status, onClick: () => {
                                                    setStatusMenuOpen(false);
                                                    setFilters((current) => ({ ...current, status }));
                                                }, children: messages.status.routeDetail[status] }, status)))] })] })) : null, !isMemoList ? _jsx("div", { className: "h-[32px] w-[1px] bg-[var(--adaptive-border-subtle)]" }) : null, _jsxs("div", { className: "relative w-full", children: [_jsx("input", { ref: searchInputRef, value: filters.keyword, onChange: (event) => setFilters((current) => ({ ...current, keyword: event.target.value })), placeholder: isMemoList ? messages.feedbackList.memoSearchPlaceholder : messages.feedbackList.searchPlaceholder, className: "h-[32px] w-full px-[8px] pr-[30px] text-[14px] text-[var(--adaptive-black800)] outline-none" }), _jsx(SearchIcon, { className: "pointer-events-none absolute right-[8px] top-[25%] h-4 w-4 -translate-y-1/2 text-[var(--adaptive-black500)]" }), _jsx("div", { className: "absolute right-[30px] top-1/2 -translate-y-1/2", children: _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.focusSearch, visible: visibleShortcutKeys }) })] })] })] }), _jsxs("div", { className: "min-h-0 min-w-0 flex-1 overflow-y-auto bg-[var(--adaptive-black50)]", children: [isError ? (_jsx(NoticeDialog, { role: "alertdialog", title: messages.feedbackList.loadFailedTitle, description: queryErrorMessage ?? messages.feedbackList.loadFailedRetry, actions: [
                            {
                                id: "retry",
                                label: messages.common.retry,
                                variant: "primary",
                                onClick: () => void refetch(),
                            },
                        ] })) : null, !isError && !isFetching && filteredReports.length === 0 ? (persistenceLock.locked ? (_jsx(NoticeDialog, { role: "status", title: messages.feedbackList.emptyPersistenceRequired, description: _jsxs(_Fragment, { children: [_jsx("p", { className: "whitespace-break-spaces", children: messages.feedbackList.emptyPersistenceRequiredHint }), _jsx("p", { className: "mt-[4px] font-mono text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: persistenceLock.missingHandlers.join(", ") })] }) })) : (_jsx(NoticeDialog, { role: "status", title: messages.feedbackList.emptyTitle, description: reports.length === 0 || (listKind === "memo" ? !reports.some(isMemoReport) : !reports.some((report) => !isMemoReport(report)))
                            ? listKind === "memo"
                                ? messages.feedbackList.emptyNoMemo
                                : messages.feedbackList.emptyNoFeedback
                            : messages.feedbackList.emptyNoMatch }))) : null, _jsx("section", { className: "flex flex-col", children: groupedReports.map(({ dateKey, label, reports: groupReports }, index) => {
                            const isExpanded = expandedGroups.has(dateKey);
                            const isFirst = groupedReports.length - (groupedReports.length - 1) === index + 1;
                            return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("button", { type: "button", onClick: () => toggleGroup(dateKey), "aria-expanded": isExpanded, className: `${isFirst ? "border-b border-b-[var(--adaptive-border-subtle)]" : "border-y border-y-[var(--adaptive-border-subtle)]"} bg-[var(--adaptive-black50)] sticky top-0 z-10 flex w-full items-center justify-between p-[4px_16px]`, children: [_jsx("div", { className: "w-[3px] h-[3px] bg-[var(--adaptive-black500)] rounded-full" }), _jsxs("section", { className: "flex items-center", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black900)]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}` })] }), _jsx("div", { className: "w-[3px] h-[3px] bg-[var(--adaptive-black500)] rounded-full" })] }), isExpanded
                                        ? groupReports.map((report) => (_jsx(FeedbackListItem, { report: report, locale: locale, messages: messages, listScope: listScope, listKind: listKind, disabled: isDeleting, canCreateGitHubIssue: !isMemoList && canCreateGitHubIssueFromList, creatingGitHubIssueId: creatingGitHubIssueId, onLocate: locateFeedback, onDelete: handleDelete, onCreateGitHubIssue: handleCreateGitHubIssue }, report.id)))
                                        : null] }, dateKey));
                        }) }), visibleCount < filteredReports.length || hasNextPage ? (_jsx("div", { ref: loadMoreRef, className: "py-[8px] text-center text-[12px] text-[var(--adaptive-black500)]", children: isFetchingNextPage ? messages.feedbackList.loadingMore : "" })) : null] })] }));
}
//# sourceMappingURL=ReportFeedbackList.js.map