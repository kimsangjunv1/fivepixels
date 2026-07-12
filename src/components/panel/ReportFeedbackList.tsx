import { useEffect, useMemo, useRef, useState } from "react";
import { REPORT_SHORTCUTS } from "@/constants/reportShortcuts.js";
import { useReport } from "@/providers/reportContext.js";
import { formatDateOnly } from "@/utils/format.js";
import { type RouteDetailStatus } from "@/utils/routeDetailStatus.js";
import { ShortcutHint } from "@/components/ShortcutHint.js";
import { SearchIcon, ChevronDownIcon } from "@/components/icons/Icons.js";
import type { ReportFeedback } from "@/types/report.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { FeedbackListItem } from "./feedback/FeedbackListItem.js";

const FEEDBACK_PAGE_SIZE = 20;

function getDateGroupKey(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function groupReportsByDate(reports: ReportFeedback[], locale: ReturnType<typeof useReport>["locale"]) {
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
            label: formatDateOnly(groupedReports[0]!.created_at, locale),
            reports: groupedReports,
        });
    }

    return groups;
}

export function ReportFeedbackList() {
    const {
        filters,
        setFilters,
        filteredReports,
        reports,
        listScope,
        setListScope,
        canListAllFeedback,
        locale,
        messages,
        isError,
        isFetching,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isDeleting,
        queryErrorMessage,
        visibleShortcutKeys,
        searchInputRef,
        locateFeedback,
        refetch,
        handleDelete,
        canCreateGitHubIssueFromList,
        creatingGitHubIssueId,
        handleCreateGitHubIssue,
    } = useReport();

    const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
    const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

        const observer = new IntersectionObserver(
            (entries) => {
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
            },
            { rootMargin: "120px" },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [fetchNextPage, filteredReports.length, hasNextPage, isFetchingNextPage, visibleCount]);

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

    return (
        <section className="flex min-h-0 max-h-[51.2rem] flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
            <div className="shrink-0 border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]">
                {filters.dateKey ? (
                    <div className="flex items-center justify-between gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[8px] py-[6px]">
                        <p className="text-[11px] font-[600] text-[var(--adaptive-blue500)]">
                            {messages.activityHeatmap.dateFilterLabel.replace("{date}", formatDateOnly(`${filters.dateKey}T12:00:00`, locale))}
                        </p>
                        <button
                            type="button"
                            onClick={() => setFilters((current) => ({ ...current, dateKey: null }))}
                            className="text-[11px] font-[600] text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]"
                        >
                            {messages.activityHeatmap.clearDateFilter}
                        </button>
                    </div>
                ) : null}

                <div className="flex items-center gap-[6px] px-[8px] py-[8px]">
                    {canListAllFeedback ? (
                        <PanelDropdownMenu
                            open={scopeMenuOpen}
                            onClose={() => setScopeMenuOpen(false)}
                            align="left"
                            trigger={
                                <button
                                    type="button"
                                    onClick={() => setScopeMenuOpen((current) => !current)}
                                    aria-expanded={scopeMenuOpen}
                                    aria-haspopup="menu"
                                    aria-label={messages.feedbackList.scopeAriaLabel}
                                    className="flex h-[28px] min-w-[72px] items-center justify-between gap-[4px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none hover:bg-[var(--adaptive-black100)]"
                                >
                                    <span className="truncate">{scopeLabel}</span>
                                    <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${scopeMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                            }
                        >
                            {(["current", "all"] as const).map((scope) => (
                                <PanelDropdownMenuItem
                                    key={scope}
                                    active={listScope === scope}
                                    onClick={() => {
                                        setScopeMenuOpen(false);
                                        setListScope(scope);
                                    }}
                                >
                                    {scope === "current" ? messages.feedbackList.scopeCurrentPage : messages.feedbackList.scopeAllPages}
                                </PanelDropdownMenuItem>
                            ))}
                        </PanelDropdownMenu>
                    ) : null}

                    <PanelDropdownMenu
                        open={statusMenuOpen}
                        onClose={() => setStatusMenuOpen(false)}
                        align="left"
                        trigger={
                            <button
                                type="button"
                                onClick={() => setStatusMenuOpen((current) => !current)}
                                aria-expanded={statusMenuOpen}
                                aria-haspopup="menu"
                                aria-label={messages.feedbackList.filterStatusAriaLabel}
                                className="flex h-[28px] min-w-[72px] items-center justify-between gap-[4px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none hover:bg-[var(--adaptive-black100)]"
                            >
                                <span className="truncate">{statusLabel}</span>
                                <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${statusMenuOpen ? "rotate-180" : ""}`} />
                            </button>
                        }
                    >
                        <PanelDropdownMenuItem
                            active={filters.status === "all"}
                            onClick={() => {
                                setStatusMenuOpen(false);
                                setFilters((current) => ({ ...current, status: "all" }));
                            }}
                        >
                            {messages.feedbackList.filterStatusAll}
                        </PanelDropdownMenuItem>
                        {(Object.keys(messages.status.routeDetail) as RouteDetailStatus[]).map((status) => (
                            <PanelDropdownMenuItem
                                key={status}
                                active={filters.status === status}
                                onClick={() => {
                                    setStatusMenuOpen(false);
                                    setFilters((current) => ({ ...current, status }));
                                }}
                            >
                                {messages.status.routeDetail[status]}
                            </PanelDropdownMenuItem>
                        ))}
                    </PanelDropdownMenu>

                    <div className="relative min-w-0 flex-1">
                        <input
                            ref={searchInputRef}
                            value={filters.keyword}
                            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                            placeholder={messages.feedbackList.searchPlaceholder}
                            className="h-[28px] w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] pr-[30px] text-[12px] text-[var(--adaptive-black800)] outline-none"
                        />
                        <SearchIcon className="pointer-events-none absolute right-[8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adaptive-black500)]" />
                        <div className="absolute right-[30px] top-1/2 -translate-y-1/2">
                            <ShortcutHint
                                binding={REPORT_SHORTCUTS.focusSearch}
                                visible={visibleShortcutKeys}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[var(--adaptive-black50)]">
                {isError ? (
                    <div className="m-[8px] space-y-1 rounded-md border border-[var(--adaptive-border-subtle)] bg-rose-50 p-2 text-xs text-rose-800">
                        <strong className="text-sm font-semibold">{messages.feedbackList.loadFailedTitle}</strong>
                        <p>{queryErrorMessage ?? messages.feedbackList.loadFailedRetry}</p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="inline-flex items-center justify-center rounded-md border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-3 py-1 text-xs font-medium text-[var(--adaptive-text-secondary)]"
                        >
                            {messages.common.retry}
                        </button>
                    </div>
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div className="flex flex-col gap-[4px] bg-[var(--adaptive-black200)] p-[12px]">
                        <h6 className="font-semibold text-[var(--adaptive-black900)]">{messages.feedbackList.emptyTitle}</h6>
                        <p className="whitespace-break-spaces text-[12px] leading-[1.5] text-[var(--adaptive-black500)]">
                            {reports.length === 0 ? messages.feedbackList.emptyNoFeedback : messages.feedbackList.emptyNoMatch}
                        </p>
                    </div>
                ) : null}

                <section className="flex flex-col">
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
                                    className="sticky top-0 z-10 flex w-full items-center justify-between bg-[var(--adaptive-black100)] p-[4px_8px]"
                                >
                                    <p className="text-[12px] font-[600] text-[var(--adaptive-black700)]">{label}</p>
                                    <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>

                                {isExpanded
                                    ? groupReports.map((report) => (
                                          <FeedbackListItem
                                              key={report.id}
                                              report={report}
                                              locale={locale}
                                              messages={messages}
                                              listScope={listScope}
                                              disabled={isDeleting}
                                              canCreateGitHubIssue={canCreateGitHubIssueFromList}
                                              creatingGitHubIssueId={creatingGitHubIssueId}
                                              onLocate={locateFeedback}
                                              onDelete={handleDelete}
                                              onCreateGitHubIssue={handleCreateGitHubIssue}
                                          />
                                      ))
                                    : null}
                            </div>
                        );
                    })}
                </section>

                {visibleCount < filteredReports.length || hasNextPage ? (
                    <div
                        ref={loadMoreRef}
                        className="py-[8px] text-center text-[12px] text-[var(--adaptive-black500)]"
                    >
                        {isFetchingNextPage ? messages.feedbackList.loadingMore : ""}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
