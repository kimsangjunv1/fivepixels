import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDateOnly, formatTimeOnly } from "../../utils/format.js";
import { getFieldTags } from "../../utils/fields.js";
import { getRouteDetailStatus, ROUTE_DETAIL_STATUS_LABEL } from "../../utils/routeDetailStatus.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FeedbackFieldTags } from "./feedback/FeedbackFieldTags.js";
import { SearchIcon } from "../icons/SearchIcon.js";
import { CopyIcon } from "../icons/CopyIcon.js";
import { TrashIcon } from "../icons/TrashIcon.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { copyTextToClipboard, serializeFeedbackItem } from "../../utils/feedbackDataTransfer.js";
const FEEDBACK_PAGE_SIZE = 20;
function getDateGroupKey(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function groupReportsByDate(reports) {
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
            label: formatDateOnly(groupedReports[0].created_at),
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
function FeedbackListDeleteButton({ report, onDelete, disabled = false }) {
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
    return (_jsxs("button", { type: "button", "data-stitchable-interactive": "", onClick: handleDelete, disabled: disabled, "aria-label": confirming ? "한 번 더 눌러 피드백 삭제" : "피드백 삭제", title: confirming ? "한 번 더 눌러 삭제" : "삭제", className: `flex shrink-0 items-center justify-center gap-[2px] self-start rounded-[6px] p-[6px] disabled:opacity-50 ${confirming ? "text-rose-700 hover:bg-rose-50" : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-rose-700"}`, children: [_jsx(TrashIcon, { className: "h-[16px] w-[16px]" }), confirming ? _jsx("span", { className: "text-[10px] font-semibold", children: "\uC0AD\uC81C" }) : null] }));
}
function FeedbackListCopyButton({ report }) {
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
    return (_jsx("button", { type: "button", "data-stitchable-interactive": "", onClick: handleCopy, "aria-label": "\uD53C\uB4DC\uBC31 \uB370\uC774\uD130 \uBCF5\uC0AC", title: copied ? "복사됨" : "복사", className: "flex shrink-0 items-center justify-center self-start rounded-[6px] p-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black800)]", children: copied ? _jsx("span", { className: "text-[10px] font-semibold text-[var(--adaptive-blue500)]", children: "OK" }) : _jsx(CopyIcon, { className: "h-[16px] w-[16px]" }) }));
}
export function ReportFeedbackList() {
    const { filters, setFilters, filteredReports, reports, fields, isError, isFetching, isDeleting, queryErrorMessage, visibleShortcutKeys, searchInputRef, locateFeedback, refetch, handleDelete } = useReport();
    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const [expandedGroups, setExpandedGroups] = useState(() => new Set());
    const loadMoreRef = useRef(null);
    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    const groupedReports = useMemo(() => groupReportsByDate(visibleReports), [visibleReports]);
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
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px] overflow-hidden", children: [_jsxs("div", { className: "flex bg-[var(--adaptive-black50)] border-y border-y-[var(--adaptive-black200)]", children: [_jsxs("section", { className: "flex-1 flex", children: [_jsxs("select", { value: filters.status, onChange: (event) => setFilters((current) => ({ ...current, status: event.target.value })), className: "px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none", children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uC0C1\uD0DC" }), Object.keys(ROUTE_DETAIL_STATUS_LABEL).map((status) => (_jsx("option", { value: status, children: ROUTE_DETAIL_STATUS_LABEL[status] }, status)))] }), _jsxs("select", { value: filters.reportType, onChange: (event) => setFilters((current) => ({ ...current, reportType: event.target.value })), className: "px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none", children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uD0C0\uC785" }), _jsx("option", { value: "item", children: "item" }), _jsx("option", { value: "group", children: "group" })] })] }), _jsxs("section", { className: "flex-1 relative", children: [_jsx("input", { ref: searchInputRef, value: filters.keyword, onChange: (event) => setFilters((current) => ({ ...current, keyword: event.target.value })), placeholder: "\uBA54\uC2DC\uC9C0 / report id \uAC80\uC0C9", className: "h-[32px] w-full rounded-[8px] px-[8px] pr-[30px] text-[12px] text-[var(--adaptive-black800)] outline-none" }), _jsx(SearchIcon, { className: "pointer-events-none absolute right-[8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adaptive-black500)]" }), _jsx("div", { className: "absolute right-[30px] top-1/2 -translate-y-1/2", children: _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.focusSearch, visible: visibleShortcutKeys }) })] })] }), _jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto bg-[var(--adaptive-black50)]", children: [isError ? (_jsxs("div", { className: "space-y-1 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800", children: [_jsx("strong", { className: "text-sm font-semibold", children: "\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694." }), _jsx("p", { children: queryErrorMessage ?? "잠시 후 다시 시도해주세요." }), _jsx("button", { type: "button", onClick: () => void refetch(), className: "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700", children: "\uB2E4\uC2DC \uC2DC\uB3C4" })] })) : null, !isError && !isFetching && filteredReports.length === 0 ? (
                    // <div className="space-y-1 rounded-md border border-dashed border-[var(--adaptive-black300)] bg-[var(--adaptive-black100)] p-2 text-xs text-[var(--adaptive-black600)]">
                    _jsxs("div", { className: "p-[12px] flex flex-col gap-[4px] bg-[var(--adaptive-black200)]", children: [_jsx("h6", { className: "font-semibold text-[var(--adaptive-black900)]", children: "\uD45C\uC2DC\uD560 \uD53C\uB4DC\uBC31\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)] whitespace-break-spaces leading-[1.5]", children: reports.length === 0 ? `아직 등록된 피드백이 없어요.\n"Record"를 눌러 첫 피드백을 남겨보세요.` : "현재 필터 조건과 일치하는 결과가 없어요." })] })) : null, _jsx("section", { className: "flex flex-col gap-[8px]", children: groupedReports.map(({ dateKey, label, reports: groupReports }) => {
                            const isExpanded = expandedGroups.has(dateKey);
                            return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("button", { type: "button", onClick: () => toggleGroup(dateKey), "aria-expanded": isExpanded, className: "sticky z-10 flex w-full items-center justify-between bg-[var(--adaptive-black200)] p-[4px_8px]", children: [_jsx("p", { className: "text-[12px] font-[600] text-[var(--adaptive-black700)]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}` })] }), isExpanded
                                        ? groupReports.map((report) => {
                                            const routeStatus = getRouteDetailStatus(report);
                                            const fieldTags = getFieldTags(fields, report.field_values);
                                            return (_jsxs("div", { className: "flex w-full items-start gap-[4px] border-b border-[var(--adaptive-black200)] last:border-b-0", children: [_jsxs("button", { type: "button", onClick: () => locateFeedback(report.id), className: "flex min-w-0 flex-1 flex-col gap-[6px] p-[12px] text-left", children: [_jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-[6px]", children: [_jsx("strong", { className: "max-w-full truncate font-bold text-[var(--adaptive-black900)]", children: report.report_id }), _jsx(FeedbackFieldTags, { tags: fieldTags }), _jsx("span", { className: "inline-flex items-center rounded-full px-[8px] py-[2px] text-[10px] font-bold uppercase", style: getRouteStatusTone(routeStatus), children: ROUTE_DETAIL_STATUS_LABEL[routeStatus] })] }), _jsx("p", { className: "text-[var(--adaptive-black700)]", children: report.message })] }), _jsx("p", { className: "text-[var(--adaptive-black500)] text-[12px]", children: formatTimeOnly(report.created_at) })] }), _jsxs("div", { className: "flex shrink-0 items-start gap-[2px] p-[12px] pl-0", children: [_jsx(FeedbackListCopyButton, { report: report }), _jsx(FeedbackListDeleteButton, { report: report, onDelete: handleDelete, disabled: isDeleting })] })] }, report.id));
                                        })
                                        : null] }, dateKey));
                        }) }), visibleCount < filteredReports.length ? (_jsx("div", { ref: loadMoreRef, className: "py-[8px] text-center text-[12px] text-[var(--adaptive-black500)]", children: "\uB354 \uBD88\uB7EC\uC624\uB294 \uC911..." })) : null] })] }));
}
//# sourceMappingURL=ReportFeedbackList.js.map