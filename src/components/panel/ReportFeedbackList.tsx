import { useEffect, useMemo, useRef, useState } from "react";
import type { ReportFilters } from "../../types/report-ui.js";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getFieldTags } from "../../utils/fields.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import { getRouteDetailStatus, ROUTE_DETAIL_STATUS_LABEL, type RouteDetailStatus } from "../../utils/routeDetailStatus.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FeedbackFieldTags } from "./feedback/FeedbackFieldTags.js";
import { SearchIcon } from "../icons/SearchIcon.js";

const FEEDBACK_PAGE_SIZE = 20;

function getRouteStatusTone(status: RouteDetailStatus) {
    if (status === "resolved") {
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
    }

    if (status === "suggested") {
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
    }

    return { backgroundColor: "#fff7ed", color: "#c2410c" };
}

export function ReportFeedbackList() {
    const {
        filters,
        setFilters,
        filteredReports,
        reports,
        fields,
        isError,
        isFetching,
        queryErrorMessage,
        visibleShortcutKeys,
        searchInputRef,
        selectReport,
        refetch,
    } = useReport();

    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);

    useEffect(() => {
        setVisibleCount(FEEDBACK_PAGE_SIZE);
    }, [filters.keyword, filters.reportType, filters.status, reports.length]);

    useEffect(() => {
        const node = loadMoreRef.current;

        if (!node || visibleCount >= filteredReports.length) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setVisibleCount((current) => Math.min(current + FEEDBACK_PAGE_SIZE, filteredReports.length));
                }
            },
            { root: node.parentElement, rootMargin: "120px" },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [filteredReports.length, visibleCount]);

    return (
        <section className="flex min-h-0 flex-1 flex-col gap-[8px]">
            <div className="flex flex-col gap-[8px] rounded-[12px] bg-[var(--adaptive-grey100)] p-[10px]">
                <div className="grid grid-cols-2 gap-[8px]">
                    <select
                        value={filters.status}
                        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ReportFilters["status"] }))}
                        className="h-[32px] w-full rounded-[8px] border border-[var(--adaptive-grey300)] bg-white px-[8px] text-[12px] text-[var(--adaptive-grey800)] outline-none"
                    >
                        <option value="all">전체 상태</option>
                        {(Object.keys(ROUTE_DETAIL_STATUS_LABEL) as RouteDetailStatus[]).map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {ROUTE_DETAIL_STATUS_LABEL[status]}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.reportType}
                        onChange={(event) => setFilters((current) => ({ ...current, reportType: event.target.value as ReportFilters["reportType"] }))}
                        className="h-[32px] w-full rounded-[8px] border border-[var(--adaptive-grey300)] bg-white px-[8px] text-[12px] text-[var(--adaptive-grey800)] outline-none"
                    >
                        <option value="all">전체 타입</option>
                        <option value="item">item</option>
                        <option value="group">group</option>
                    </select>
                </div>

                <div className="relative">
                    <input
                        ref={searchInputRef}
                        value={filters.keyword}
                        onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                        placeholder="메시지 / report id 검색"
                        className="h-[32px] w-full rounded-[8px] border border-[var(--adaptive-grey300)] bg-white px-[8px] pr-[30px] text-[12px] text-[var(--adaptive-grey800)] outline-none"
                    />
                    <SearchIcon className="pointer-events-none absolute right-[8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adaptive-grey500)]" />
                    <div className="absolute right-[30px] top-1/2 -translate-y-1/2">
                        <ShortcutHint
                            binding={REPORT_SHORTCUTS.focusSearch}
                            visible={visibleShortcutKeys}
                        />
                    </div>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {isError ? (
                    <div className="space-y-1 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                        <strong className="text-sm font-semibold">목록을 불러오지 못했어요.</strong>
                        <p>{queryErrorMessage ?? "잠시 후 다시 시도해주세요."}</p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                            다시 시도
                        </button>
                    </div>
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div className="space-y-1 rounded-md border border-dashed border-[var(--adaptive-grey300)] bg-[var(--adaptive-grey100)] p-2 text-xs text-[var(--adaptive-grey600)]">
                        <strong className="text-sm font-semibold text-[var(--adaptive-grey900)]">표시할 피드백이 없습니다.</strong>
                        <p>{reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요."}</p>
                    </div>
                ) : null}

                <div className="flex flex-col">
                    {visibleReports.map((report) => {
                        const routeStatus = getRouteDetailStatus(report);
                        const fieldTags = getFieldTags(fields, report.field_values);

                        return (
                            <button
                                key={report.id}
                                type="button"
                                onClick={() => selectReport(report.id)}
                                className="flex w-full flex-col gap-[6px] border-b border-[var(--adaptive-grey200)] px-[4px] py-[12px] text-left last:border-b-0"
                            >
                                <div className="flex flex-wrap items-center gap-[6px]">
                                    <strong className="max-w-full truncate text-[13px] font-bold text-[var(--adaptive-grey900)]">{report.report_id}</strong>
                                    <FeedbackFieldTags tags={fieldTags} />
                                    <span
                                        className="inline-flex items-center rounded-full px-[8px] py-[2px] text-[10px] font-bold uppercase tracking-wide"
                                        style={getRouteStatusTone(routeStatus)}
                                    >
                                        {ROUTE_DETAIL_STATUS_LABEL[routeStatus]}
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-[13px] text-[var(--adaptive-grey700)]">{report.message}</p>
                                <p className={`text-[11px] text-[var(--adaptive-grey500)] ${panelNumericClassName}`}>{formatDate(report.created_at)}</p>
                            </button>
                        );
                    })}
                </div>

                {visibleCount < filteredReports.length ? (
                    <div
                        ref={loadMoreRef}
                        className="py-[8px] text-center text-[11px] text-[var(--adaptive-grey500)]"
                    >
                        더 불러오는 중...
                    </div>
                ) : null}
            </div>
        </section>
    );
}
