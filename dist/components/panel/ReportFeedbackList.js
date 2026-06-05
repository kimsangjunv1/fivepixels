import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getFieldTags } from "../../utils/fields.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import { getRouteDetailStatus, ROUTE_DETAIL_STATUS_LABEL } from "../../utils/routeDetailStatus.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FeedbackFieldTags } from "./feedback/FeedbackFieldTags.js";
import { SearchIcon } from "../icons/SearchIcon.js";
const FEEDBACK_PAGE_SIZE = 20;
function getRouteStatusTone(status) {
    if (status === "resolved") {
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
    }
    if (status === "suggested") {
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
    }
    return { backgroundColor: "#fff7ed", color: "#c2410c" };
}
export function ReportFeedbackList() {
    const { filters, setFilters, filteredReports, reports, fields, isError, isFetching, queryErrorMessage, visibleShortcutKeys, searchInputRef, selectReport, refetch, } = useReport();
    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const loadMoreRef = useRef(null);
    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    useEffect(() => {
        setVisibleCount(FEEDBACK_PAGE_SIZE);
    }, [filters.keyword, filters.reportType, filters.status, reports.length]);
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
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col gap-[8px]", children: [_jsxs("div", { className: "flex flex-col gap-[8px] rounded-[12px] bg-[var(--adaptive-grey100)] p-[10px]", children: [_jsxs("div", { className: "grid grid-cols-2 gap-[8px]", children: [_jsxs("select", { value: filters.status, onChange: (event) => setFilters((current) => ({ ...current, status: event.target.value })), className: "h-[32px] w-full rounded-[8px] border border-[var(--adaptive-grey300)] bg-white px-[8px] text-[12px] text-[var(--adaptive-grey800)] outline-none", children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uC0C1\uD0DC" }), Object.keys(ROUTE_DETAIL_STATUS_LABEL).map((status) => (_jsx("option", { value: status, children: ROUTE_DETAIL_STATUS_LABEL[status] }, status)))] }), _jsxs("select", { value: filters.reportType, onChange: (event) => setFilters((current) => ({ ...current, reportType: event.target.value })), className: "h-[32px] w-full rounded-[8px] border border-[var(--adaptive-grey300)] bg-white px-[8px] text-[12px] text-[var(--adaptive-grey800)] outline-none", children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uD0C0\uC785" }), _jsx("option", { value: "item", children: "item" }), _jsx("option", { value: "group", children: "group" })] })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { ref: searchInputRef, value: filters.keyword, onChange: (event) => setFilters((current) => ({ ...current, keyword: event.target.value })), placeholder: "\uBA54\uC2DC\uC9C0 / report id \uAC80\uC0C9", className: "h-[32px] w-full rounded-[8px] border border-[var(--adaptive-grey300)] bg-white px-[8px] pr-[30px] text-[12px] text-[var(--adaptive-grey800)] outline-none" }), _jsx(SearchIcon, { className: "pointer-events-none absolute right-[8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adaptive-grey500)]" }), _jsx("div", { className: "absolute right-[30px] top-1/2 -translate-y-1/2", children: _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.focusSearch, visible: visibleShortcutKeys }) })] })] }), _jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto", children: [isError ? (_jsxs("div", { className: "space-y-1 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800", children: [_jsx("strong", { className: "text-sm font-semibold", children: "\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694." }), _jsx("p", { children: queryErrorMessage ?? "잠시 후 다시 시도해주세요." }), _jsx("button", { type: "button", onClick: () => void refetch(), className: "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700", children: "\uB2E4\uC2DC \uC2DC\uB3C4" })] })) : null, !isError && !isFetching && filteredReports.length === 0 ? (_jsxs("div", { className: "space-y-1 rounded-md border border-dashed border-[var(--adaptive-grey300)] bg-[var(--adaptive-grey100)] p-2 text-xs text-[var(--adaptive-grey600)]", children: [_jsx("strong", { className: "text-sm font-semibold text-[var(--adaptive-grey900)]", children: "\uD45C\uC2DC\uD560 \uD53C\uB4DC\uBC31\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("p", { children: reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요." })] })) : null, _jsx("div", { className: "flex flex-col", children: visibleReports.map((report) => {
                            const routeStatus = getRouteDetailStatus(report);
                            const fieldTags = getFieldTags(fields, report.field_values);
                            return (_jsxs("button", { type: "button", onClick: () => selectReport(report.id), className: "flex w-full flex-col gap-[6px] border-b border-[var(--adaptive-grey200)] px-[4px] py-[12px] text-left last:border-b-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-[6px]", children: [_jsx("strong", { className: "max-w-full truncate text-[13px] font-bold text-[var(--adaptive-grey900)]", children: report.report_id }), _jsx(FeedbackFieldTags, { tags: fieldTags }), _jsx("span", { className: "inline-flex items-center rounded-full px-[8px] py-[2px] text-[10px] font-bold uppercase tracking-wide", style: getRouteStatusTone(routeStatus), children: ROUTE_DETAIL_STATUS_LABEL[routeStatus] })] }), _jsx("p", { className: "line-clamp-2 text-[13px] text-[var(--adaptive-grey700)]", children: report.message }), _jsx("p", { className: `text-[11px] text-[var(--adaptive-grey500)] ${panelNumericClassName}`, children: formatDate(report.created_at) })] }, report.id));
                        }) }), visibleCount < filteredReports.length ? (_jsx("div", { ref: loadMoreRef, className: "py-[8px] text-center text-[11px] text-[var(--adaptive-grey500)]", children: "\uB354 \uBD88\uB7EC\uC624\uB294 \uC911..." })) : null] })] }));
}
//# sourceMappingURL=ReportFeedbackList.js.map