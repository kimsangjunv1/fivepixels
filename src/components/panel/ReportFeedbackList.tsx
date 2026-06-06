import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { ReportFilters } from "../../types/report-ui.js";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDateOnly, formatTimeOnly } from "../../utils/format.js";
import { getFieldTags } from "../../utils/fields.js";
import { getRouteDetailStatus, ROUTE_DETAIL_STATUS_LABEL, type RouteDetailStatus } from "../../utils/routeDetailStatus.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FeedbackFieldTags } from "./feedback/FeedbackFieldTags.js";
import { SearchIcon } from "../icons/SearchIcon.js";
import { CopyIcon } from "../icons/CopyIcon.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { copyTextToClipboard, serializeFeedbackItem } from "../../utils/feedbackDataTransfer.js";
import type { ReportFeedback } from "../../types/report.js";

const FEEDBACK_PAGE_SIZE = 20;

function getDateGroupKey(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function groupReportsByDate(reports: ReportFeedback[]) {
    const groups: { dateKey: string; label: string; reports: ReportFeedback[] }[] = [];
    const groupMap = new Map<string, ReportFeedback[]>();

    for (const report of reports) {
        const dateKey = getDateGroupKey(report.created_at);
        const existing = groupMap.get(dateKey);

        if (existing) {
            existing.push(report);
        } else {
            groupMap.set(dateKey, [report]);
        }
    }

    for (const [dateKey, groupedReports] of groupMap) {
        groups.push({
            dateKey,
            label: formatDateOnly(groupedReports[0]!.created_at),
            reports: groupedReports,
        });
    }

    return groups;
}

function getRouteStatusTone(status: RouteDetailStatus) {
    if (status === "resolved") {
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
    }

    if (status === "suggested") {
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
    }

    return { backgroundColor: "#fff7ed", color: "#c2410c" };
}

function FeedbackListCopyButton({ report }: { report: ReportFeedback }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
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

    return (
        <button
            type="button"
            data-stitchable-interactive=""
            onClick={handleCopy}
            aria-label="피드백 데이터 복사"
            title={copied ? "복사됨" : "복사"}
            className="flex shrink-0 items-center justify-center self-start rounded-[6px] p-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black800)]"
        >
            {copied ? <span className="text-[10px] font-semibold text-[var(--adaptive-blue500)]">OK</span> : <CopyIcon className="h-[16px] w-[16px]" />}
        </button>
    );
}

export function ReportFeedbackList() {
    const { filters, setFilters, filteredReports, reports, fields, isError, isFetching, queryErrorMessage, visibleShortcutKeys, searchInputRef, locateFeedback, refetch } = useReport();

    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    const groupedReports = useMemo(() => groupReportsByDate(visibleReports), [visibleReports]);

    useEffect(() => {
        setVisibleCount(FEEDBACK_PAGE_SIZE);
    }, [filters.keyword, filters.reportType, filters.status, reports.length]);

    useEffect(() => {
        const firstGroupKey = groupedReports[0]?.dateKey;

        if (firstGroupKey) {
            setExpandedGroups(new Set([firstGroupKey]));
        } else {
            setExpandedGroups(new Set());
        }
    }, [filters.keyword, filters.reportType, filters.status, reports.length]);

    const toggleGroup = (dateKey: string) => {
        setExpandedGroups((current) => {
            const next = new Set(current);

            if (next.has(dateKey)) {
                next.delete(dateKey);
            } else {
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
        <section className="flex min-h-0 flex-1 flex-col bg-[var(--adaptive-black50)]">
            <div className="flex bg-[var(--adaptive-black50)] border-y border-y-[var(--adaptive-black200)]">
                <section className="flex-1 flex">
                    <select
                        value={filters.status}
                        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ReportFilters["status"] }))}
                        className="px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none"
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
                        className="px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none"
                    >
                        <option value="all">전체 타입</option>
                        <option value="item">item</option>
                        <option value="group">group</option>
                    </select>
                </section>

                <section className="flex-1 relative">
                    <input
                        ref={searchInputRef}
                        value={filters.keyword}
                        onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                        placeholder="메시지 / report id 검색"
                        className="h-[32px] w-full rounded-[8px] px-[8px] pr-[30px] text-[12px] text-[var(--adaptive-black800)] outline-none"
                    />

                    <SearchIcon className="pointer-events-none absolute right-[8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adaptive-black500)]" />

                    <div className="absolute right-[30px] top-1/2 -translate-y-1/2">
                        <ShortcutHint
                            binding={REPORT_SHORTCUTS.focusSearch}
                            visible={visibleShortcutKeys}
                        />
                    </div>
                </section>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--adaptive-black50)]">
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
                    // <div className="space-y-1 rounded-md border border-dashed border-[var(--adaptive-black300)] bg-[var(--adaptive-black100)] p-2 text-xs text-[var(--adaptive-black600)]">
                    <div className="p-[12px] flex flex-col gap-[4px] bg-[var(--adaptive-black200)]">
                        <h6 className="font-semibold text-[var(--adaptive-black900)]">표시할 피드백이 없습니다.</h6>
                        <p className="text-[12px] text-[var(--adaptive-black500)] whitespace-break-spaces leading-[1.5]">
                            {reports.length === 0 ? `아직 등록된 피드백이 없어요.\n"Record"를 눌러 첫 피드백을 남겨보세요.` : "현재 필터 조건과 일치하는 결과가 없어요."}
                        </p>
                    </div>
                ) : null}

                <section className="flex flex-col gap-[8px] p-[8px]">
                    {groupedReports.map(({ dateKey, label, reports: groupReports }) => {
                        const isExpanded = expandedGroups.has(dateKey);

                        return (
                            <div
                                key={dateKey}
                                className="flex flex-col"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(dateKey)}
                                    aria-expanded={isExpanded}
                                    className="sticky top-[8px] z-10 flex w-full items-center justify-between rounded-[8px] bg-[var(--adaptive-black200)] p-[8px]"
                                >
                                    <p className="text-[14px] font-[600] text-[var(--adaptive-black500)]">{label}</p>

                                    <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>

                                {isExpanded
                                    ? groupReports.map((report) => {
                                          const routeStatus = getRouteDetailStatus(report);
                                          const fieldTags = getFieldTags(fields, report.field_values);

                                          return (
                                              <div
                                                  key={report.id}
                                                  className="flex w-full items-start gap-[4px] border-b border-[var(--adaptive-black200)] last:border-b-0"
                                              >
                                                  <button
                                                      type="button"
                                                      onClick={() => locateFeedback(report.id)}
                                                      className="flex min-w-0 flex-1 flex-col gap-[6px] p-[12px] text-left"
                                                  >
                                                      <section className="flex flex-col gap-[4px]">
                                                          <div className="flex flex-wrap items-center gap-[6px]">
                                                              <strong className="max-w-full truncate font-bold text-[var(--adaptive-black900)]">{report.report_id}</strong>

                                                              <FeedbackFieldTags tags={fieldTags} />

                                                              <span
                                                                  className="inline-flex items-center rounded-full px-[8px] py-[2px] text-[10px] font-bold uppercase"
                                                                  style={getRouteStatusTone(routeStatus)}
                                                              >
                                                                  {ROUTE_DETAIL_STATUS_LABEL[routeStatus]}
                                                              </span>
                                                          </div>

                                                          <p className="text-[var(--adaptive-black700)]">{report.message}</p>
                                                      </section>

                                                      <p className="text-[var(--adaptive-black500)] text-[12px]">{formatTimeOnly(report.created_at)}</p>
                                                  </button>

                                                  <div className="p-[12px] pl-0">
                                                      <FeedbackListCopyButton report={report} />
                                                  </div>
                                              </div>
                                          );
                                      })
                                    : null}
                            </div>
                        );
                    })}
                </section>

                {visibleCount < filteredReports.length ? (
                    <div
                        ref={loadMoreRef}
                        className="py-[8px] text-center text-[12px] text-[var(--adaptive-black500)]"
                    >
                        더 불러오는 중...
                    </div>
                ) : null}
            </div>
        </section>
    );
}
