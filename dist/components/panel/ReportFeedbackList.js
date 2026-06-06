import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDateOnly, formatTimeOnly } from "../../utils/format.js";
import { getFieldTags } from "../../utils/fields.js";
import { getRouteDetailStatus } from "../../utils/routeDetailStatus.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FeedbackFieldTags } from "./feedback/FeedbackFieldTags.js";
import { SearchIcon } from "../icons/SearchIcon.js";
import { CopyIcon } from "../icons/CopyIcon.js";
import { TrashIcon } from "../icons/TrashIcon.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { copyTextToClipboard, serializeFeedbackItem } from "../../utils/feedbackDataTransfer.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
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
function getRouteStatusTone(status) {
    if (status === "resolved") {
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
    }
    if (status === "suggested") {
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
    }
    return { backgroundColor: "#fff7ed", color: "#c2410c" };
}
function FeedbackListDeleteButton({ report, onDelete, disabled = false, messages, }) {
    const [confirming, setConfirming] = useState(false);
    useEffect(() => {
        if (!confirming) {
            return;
        }
        const timer = window.setTimeout(() => setConfirming(false), 1500);
        return () => {
            window.clearTimeout(timer);
        };
    }, [confirming]);
    const handleDelete = (event) => {
        event.stopPropagation();
        if (!confirming) {
            setConfirming(true);
            return;
        }
        void onDelete(report.id).finally(() => {
            setConfirming(false);
        });
    };
    return (_jsxs("button", { type: "button", "data-stitchable-interactive": "", onClick: handleDelete, disabled: disabled, "aria-label": confirming ? messages.feedbackList.deleteConfirmAriaLabel : messages.feedbackList.deleteAriaLabel, title: confirming ? messages.feedbackList.deleteConfirmTitle : messages.feedbackList.deleteTitle, className: `flex shrink-0 items-center justify-center gap-[2px] self-start rounded-[6px] p-[6px] disabled:opacity-50 ${confirming ? "text-rose-700 hover:bg-rose-50" : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-rose-700"}`, children: [_jsx(TrashIcon, { className: "h-[16px] w-[16px]" }), confirming ? _jsx("span", { className: "text-[10px] font-semibold", children: messages.feedbackList.deleteConfirmLabel }) : null] }));
}
function FeedbackListCopyButton({ report, messages }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = (event) => {
        event.stopPropagation();
        void copyTextToClipboard(serializeFeedbackItem(report))
            .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        })
            .catch(() => {
            setCopied(false);
        });
    };
    return (_jsx("button", { type: "button", "data-stitchable-interactive": "", onClick: handleCopy, "aria-label": messages.feedbackList.copyAriaLabel, title: copied ? messages.feedbackList.copiedTitle : messages.feedbackList.copyTitle, className: "flex shrink-0 items-center justify-center self-start rounded-[6px] p-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black800)]", children: copied ? _jsx("span", { className: "text-[10px] font-semibold text-[var(--adaptive-blue500)]", children: messages.common.ok }) : _jsx(CopyIcon, { className: "h-[16px] w-[16px]" }) }));
}
export function ReportFeedbackList() {
    const { filters, setFilters, filteredReports, reports, fields, locale, messages, isError, isFetching, isDeleting, queryErrorMessage, visibleShortcutKeys, searchInputRef, locateFeedback, refetch, handleDelete, } = useReport();
    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const [expandedGroups, setExpandedGroups] = useState(() => new Set());
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [reportTypeMenuOpen, setReportTypeMenuOpen] = useState(false);
    const loadMoreRef = useRef(null);
    const statusLabel = filters.status === "all" ? messages.feedbackList.filterStatusAll : messages.status.routeDetail[filters.status];
    const reportTypeLabel = filters.reportType === "all" ? messages.feedbackList.filterTypeAll : filters.reportType === "item" ? messages.feedbackList.reportTypeItem : messages.feedbackList.reportTypeGroup;
    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    const groupedReports = useMemo(() => groupReportsByDate(visibleReports, locale), [locale, visibleReports]);
    useEffect(() => {
        setVisibleCount(FEEDBACK_PAGE_SIZE);
    }, [filters.keyword, filters.reportType, filters.status, reports.length]);
    useEffect(() => {
        const firstGroupKey = groupedReports[0]?.dateKey;
        if (firstGroupKey) {
            setExpandedGroups(new Set([firstGroupKey]));
        }
        else {
            setExpandedGroups(new Set());
        }
    }, [filters.keyword, filters.reportType, filters.status, reports.length]);
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
    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node || visibleCount >= filteredReports.length) {
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                setVisibleCount((current) => Math.min(current + FEEDBACK_PAGE_SIZE, filteredReports.length));
            }
        }, { root: node.parentElement, rootMargin: "120px" });
        observer.observe(node);
        return () => {
            observer.disconnect();
        };
    }, [filteredReports.length, visibleCount]);
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]", children: [_jsxs("div", { className: "flex bg-[var(--adaptive-black50)] border-y border-y-[var(--adaptive-black200)]", children: [_jsxs("section", { className: "flex flex-1 items-center gap-[4px]", children: [_jsxs(PanelDropdownMenu, { open: statusMenuOpen, onClose: () => setStatusMenuOpen(false), align: "left", trigger: _jsxs("button", { type: "button", onClick: () => setStatusMenuOpen((current) => !current), "aria-expanded": statusMenuOpen, "aria-haspopup": "menu", "aria-label": messages.feedbackList.filterStatusAriaLabel, className: "flex items-center gap-[4px] px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none", children: [_jsx("span", { children: statusLabel }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] text-[var(--adaptive-black600)] transition-transform ${statusMenuOpen ? "rotate-180" : ""}` })] }), children: [_jsx(PanelDropdownMenuItem, { active: filters.status === "all", onClick: () => {
                                            setStatusMenuOpen(false);
                                            setFilters((current) => ({ ...current, status: "all" }));
                                        }, children: messages.feedbackList.filterStatusAll }), Object.keys(messages.status.routeDetail).map((status) => (_jsx(PanelDropdownMenuItem, { active: filters.status === status, onClick: () => {
                                            setStatusMenuOpen(false);
                                            setFilters((current) => ({ ...current, status }));
                                        }, children: messages.status.routeDetail[status] }, status)))] }), _jsxs(PanelDropdownMenu, { open: reportTypeMenuOpen, onClose: () => setReportTypeMenuOpen(false), align: "left", trigger: _jsxs("button", { type: "button", onClick: () => setReportTypeMenuOpen((current) => !current), "aria-expanded": reportTypeMenuOpen, "aria-haspopup": "menu", "aria-label": messages.feedbackList.filterTypeAriaLabel, className: "flex items-center gap-[4px] px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none", children: [_jsx("span", { children: reportTypeLabel }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] text-[var(--adaptive-black600)] transition-transform ${reportTypeMenuOpen ? "rotate-180" : ""}` })] }), children: [_jsx(PanelDropdownMenuItem, { active: filters.reportType === "all", onClick: () => {
                                            setReportTypeMenuOpen(false);
                                            setFilters((current) => ({ ...current, reportType: "all" }));
                                        }, children: messages.feedbackList.filterTypeAll }), _jsx(PanelDropdownMenuItem, { active: filters.reportType === "item", onClick: () => {
                                            setReportTypeMenuOpen(false);
                                            setFilters((current) => ({ ...current, reportType: "item" }));
                                        }, children: messages.feedbackList.reportTypeItem }), _jsx(PanelDropdownMenuItem, { active: filters.reportType === "group", onClick: () => {
                                            setReportTypeMenuOpen(false);
                                            setFilters((current) => ({ ...current, reportType: "group" }));
                                        }, children: messages.feedbackList.reportTypeGroup })] })] }), _jsxs("section", { className: "flex-1 relative", children: [_jsx("input", { ref: searchInputRef, value: filters.keyword, onChange: (event) => setFilters((current) => ({ ...current, keyword: event.target.value })), placeholder: messages.feedbackList.searchPlaceholder, className: "h-[32px] w-full rounded-[8px] px-[8px] pr-[30px] text-[12px] text-[var(--adaptive-black800)] outline-none" }), _jsx(SearchIcon, { className: "pointer-events-none absolute right-[8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adaptive-black500)]" }), _jsx("div", { className: "absolute right-[30px] top-1/2 -translate-y-1/2", children: _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.focusSearch, visible: visibleShortcutKeys }) })] })] }), _jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]", children: [isError ? (_jsxs("div", { className: "space-y-1 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800", children: [_jsx("strong", { className: "text-sm font-semibold", children: messages.feedbackList.loadFailedTitle }), _jsx("p", { children: queryErrorMessage ?? messages.feedbackList.loadFailedRetry }), _jsx("button", { type: "button", onClick: () => void refetch(), className: "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700", children: messages.common.retry })] })) : null, !isError && !isFetching && filteredReports.length === 0 ? (_jsxs("div", { className: "p-[12px] flex flex-col gap-[4px] bg-[var(--adaptive-black200)]", children: [_jsx("h6", { className: "font-semibold text-[var(--adaptive-black900)]", children: messages.feedbackList.emptyTitle }), _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)] whitespace-break-spaces leading-[1.5]", children: reports.length === 0 ? messages.feedbackList.emptyNoFeedback : messages.feedbackList.emptyNoMatch })] })) : null, _jsx("section", { className: "flex flex-col", children: groupedReports.map(({ dateKey, label, reports: groupReports }) => {
                            const isExpanded = expandedGroups.has(dateKey);
                            return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("button", { type: "button", onClick: () => toggleGroup(dateKey), "aria-expanded": isExpanded, className: "sticky z-10 flex w-full items-center justify-between bg-[var(--adaptive-black200)] p-[4px_8px]", children: [_jsx("p", { className: "text-[12px] font-[600] text-[var(--adaptive-black700)]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}` })] }), isExpanded
                                        ? groupReports.map((report) => {
                                            const routeStatus = getRouteDetailStatus(report);
                                            const fieldTags = getFieldTags(fields, report.field_values);
                                            return (_jsxs("div", { className: "flex w-full items-start gap-[4px] border-b border-[var(--adaptive-black200)] last:border-b-0", children: [_jsxs("button", { type: "button", onClick: () => locateFeedback(report.id), className: "flex min-w-0 flex-1 flex-col gap-[6px] p-[12px] text-left", children: [_jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-[6px]", children: [_jsx("strong", { className: "max-w-full truncate font-bold text-[var(--adaptive-black900)]", children: report.report_id }), _jsx(FeedbackFieldTags, { tags: fieldTags }), _jsx("span", { className: "inline-flex items-center rounded-full px-[8px] py-[2px] text-[10px] font-bold uppercase", style: getRouteStatusTone(routeStatus), children: messages.status.routeDetail[routeStatus] })] }), _jsx("p", { className: "text-[var(--adaptive-black700)]", children: report.message })] }), _jsx("p", { className: "text-[var(--adaptive-black500)] text-[12px]", children: formatTimeOnly(report.created_at, locale) })] }), _jsxs("div", { className: "flex shrink-0 items-start gap-[2px] p-[12px] pl-0", children: [_jsx(FeedbackListCopyButton, { report: report, messages: messages }), _jsx(FeedbackListDeleteButton, { report: report, onDelete: handleDelete, disabled: isDeleting, messages: messages })] })] }, report.id));
                                        })
                                        : null] }, dateKey));
                        }) }), visibleCount < filteredReports.length ? (_jsx("div", { ref: loadMoreRef, className: "py-[8px] text-center text-[12px] text-[var(--adaptive-black500)]", children: messages.feedbackList.loadingMore })) : null] })] }));
}
//# sourceMappingURL=ReportFeedbackList.js.map