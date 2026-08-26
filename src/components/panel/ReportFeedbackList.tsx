import { useEffect, useMemo, useRef, useState } from "react";
import { REPORT_SHORTCUTS } from "@/constants/reportShortcuts.js";
import { useReport } from "@/providers/reportContext.js";
import { formatDateOnly } from "@/utils/shared/format.js";
import { type RouteDetailStatus } from "@/utils/panel/routeDetailStatus.js";
import { ShortcutHint } from "@/components/ShortcutHint.js";
import { SearchIcon, ChevronDownIcon, LockIcon } from "@/components/icons/Icons.js";
import type { ReportFeedback } from "@/types/report.js";
import { IntegrationLockTip, useIntegrationLock } from "@/components/ui/IntegrationLock.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { FeedbackListItem } from "./feedback/FeedbackListItem.js";
import { ReportPanelNoticeDialog } from "./ReportPanelNoticeDialog.js";
import { casesToSearchText, getReportCases } from "@/utils/report/reportCases.js";

const FEEDBACK_PAGE_SIZE = 20;

export type FeedbackListKind = "feedback" | "memo";

function isMemoReport(report: ReportFeedback) {
    return report.category === "memo";
}

function matchesMemoKeyword(report: ReportFeedback, keyword: string) {
    if (!keyword) {
        return true;
    }

    const haystack = [casesToSearchText(getReportCases(report)), report.pathname, typeof report.fc_number === "number" ? `#mm-${report.fc_number}` : ""]
        .join(" ")
        .toLowerCase();

    return haystack.includes(keyword);
}

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

export function ReportFeedbackList({ listKind = "feedback" }: { listKind?: FeedbackListKind }) {
    const {
        filters,
        setFilters,
        filteredReports: allFilteredReports,
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
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
            <div className="relative z-[20] shrink-0 border-b border-b-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]">
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

                <div className="flex items-center">
                    {!isMemoList ? (
                        <section className="h-[32px] flex items-center">
                            {showScopeControl ? (
                                <IntegrationLockTip
                                    locked={listAllLock.locked}
                                    label={listAllLock.tooltipLabel}
                                >
                                    <PanelDropdownMenu
                                        open={scopeMenuOpen && !listAllLock.locked}
                                        onClose={() => setScopeMenuOpen(false)}
                                        align="left"
                                        trigger={
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (listAllLock.locked) {
                                                        return;
                                                    }
                                                    setScopeMenuOpen((current) => !current);
                                                }}
                                                disabled={listAllLock.locked}
                                                aria-expanded={scopeMenuOpen}
                                                aria-haspopup="menu"
                                                aria-label={messages.feedbackList.scopeAriaLabel}
                                                className={`${scopeMenuOpen ? "bg-[var(--adaptive-accent-coral)] hover:bg-[var(--adaptive-accent-coral-hover)]" : "hover:bg-[var(--adaptive-black50)]"} flex h-full min-w-[72px] items-center justify-center gap-[4px] px-[8px] text-[14px] text-[var(--adaptive-black800)] outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                            >
                                                <span className={`${scopeMenuOpen ? "text-white" : ""} truncate`}>{listAllLock.locked ? messages.feedbackList.scopeAllPages : scopeLabel}</span>
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
                                </IntegrationLockTip>
                            ) : null}

                            <div className="h-full w-[1px] bg-[var(--adaptive-border-subtle)]" />

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
                                        className={`${statusMenuOpen ? "bg-[var(--adaptive-accent-coral)] hover:bg-[var(--adaptive-accent-coral-hover)]" : "hover:bg-[var(--adaptive-black50)]"} flex h-full min-w-[72px] items-center justify-center gap-[4px] px-[8px] text-[14px] text-[var(--adaptive-black800)] outline-none`}
                                    >
                                        <span className={`${statusMenuOpen ? "text-white" : ""} truncate`}>{statusLabel}</span>
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
                        </section>
                    ) : null}

                    {!isMemoList ? <div className="h-[32px] w-[1px] bg-[var(--adaptive-border-subtle)]" /> : null}

                    <div className="relative w-full">
                        <input
                            ref={searchInputRef}
                            value={filters.keyword}
                            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                            placeholder={isMemoList ? messages.feedbackList.memoSearchPlaceholder : messages.feedbackList.searchPlaceholder}
                            className="h-[32px] w-full px-[8px] pr-[30px] text-[14px] text-[var(--adaptive-black800)] outline-none"
                        />
                        <SearchIcon className="pointer-events-none absolute right-[8px] top-[25%] h-4 w-4 -translate-y-1/2 text-[var(--adaptive-black500)]" />

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
                    <ReportPanelNoticeDialog
                        role="alertdialog"
                        title={messages.feedbackList.loadFailedTitle}
                        description={queryErrorMessage ?? messages.feedbackList.loadFailedRetry}
                        actions={[
                            {
                                id: "retry",
                                label: messages.common.retry,
                                variant: "primary",
                                onClick: () => void refetch(),
                            },
                        ]}
                    />
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div className="flex flex-col gap-[4px] bg-[var(--adaptive-black200)] p-[12px]">
                        {persistenceLock.locked ? (
                            <>
                                <h6 className="inline-flex items-center gap-[6px] font-semibold text-[var(--adaptive-black900)]">
                                    {messages.feedbackList.emptyPersistenceRequired}
                                    <HoverTooltip
                                        label={persistenceLock.tooltipLabel}
                                        multiline
                                    >
                                        <span className="inline-flex text-[var(--adaptive-black500)]">
                                            <LockIcon className="h-[14px] w-[14px]" />
                                        </span>
                                    </HoverTooltip>
                                </h6>
                                <p className="whitespace-break-spaces text-[12px] leading-[1.5] text-[var(--adaptive-black500)]">{messages.feedbackList.emptyPersistenceRequiredHint}</p>
                                <p className="mt-[4px] font-mono text-[11px] leading-[1.4] text-[var(--adaptive-black600)]">{persistenceLock.missingHandlers.join(", ")}</p>
                            </>
                        ) : (
                            <>
                                <h6 className="font-semibold text-[var(--adaptive-black900)]">{messages.feedbackList.emptyTitle}</h6>
                                <p className="whitespace-break-spaces text-[12px] leading-[1.5] text-[var(--adaptive-black500)]">
                                    {reports.length === 0 || (listKind === "memo" ? !reports.some(isMemoReport) : !reports.some((report) => !isMemoReport(report)))
                                        ? listKind === "memo"
                                            ? messages.feedbackList.emptyNoMemo
                                            : messages.feedbackList.emptyNoFeedback
                                        : messages.feedbackList.emptyNoMatch}
                                </p>
                            </>
                        )}
                    </div>
                ) : null}

                <section className="flex flex-col">
                    {groupedReports.map(({ dateKey, label, reports: groupReports }, index) => {
                        const isExpanded = expandedGroups.has(dateKey);
                        const isFirst = groupedReports.length - (groupedReports.length - 1) === index + 1;

                        return (
                            <div
                                key={dateKey}
                                className="flex flex-col"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(dateKey)}
                                    aria-expanded={isExpanded}
                                    className={`${isFirst ? "border-b border-b-[var(--adaptive-border-subtle)]" : "border-y border-y-[var(--adaptive-border-subtle)]"} bg-[var(--adaptive-black50)] sticky top-0 z-10 flex w-full items-center justify-between p-[4px_16px]`}
                                >
                                    <div className="w-[3px] h-[3px] bg-[var(--adaptive-black500)] rounded-full" />
                                    <section className="flex items-center">
                                        <p className="text-[12px] text-[var(--adaptive-black900)]">{label}</p>
                                        <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                    </section>
                                    <div className="w-[3px] h-[3px] bg-[var(--adaptive-black500)] rounded-full" />
                                </button>

                                {isExpanded
                                    ? groupReports.map((report) => (
                                          <FeedbackListItem
                                              key={report.id}
                                              report={report}
                                              locale={locale}
                                              messages={messages}
                                              listScope={listScope}
                                              listKind={listKind}
                                              disabled={isDeleting}
                                              canCreateGitHubIssue={!isMemoList && canCreateGitHubIssueFromList}
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
