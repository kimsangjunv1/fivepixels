import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { REPORT_SHORTCUTS } from "@/constants/reportShortcuts.js";
import { useReport } from "@/providers/reportContext.js";
import { formatDateOnly, formatTimeOnly } from "@/utils/format.js";
import { getFieldTags } from "@/utils/fields.js";
import { getRouteDetailStatus, type RouteDetailStatus } from "@/utils/routeDetailStatus.js";
import { ShortcutHint } from "@/components/ShortcutHint.js";
import { FeedbackFieldTags } from "./feedback/FeedbackFieldTags.js";
import { SearchIcon } from "@/components/icons/SearchIcon.js";
import { CopyIcon } from "@/components/icons/CopyIcon.js";
import { TrashIcon } from "@/components/icons/TrashIcon.js";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon.js";
import { copyTextToClipboard, serializeFeedbackItem } from "@/utils/feedbackDataTransfer.js";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
import type { ReportLocale } from "@/i18n/types.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { GitIssueButton } from "./feedback/GitIssueButton.js";

const FEEDBACK_PAGE_SIZE = 20;

function getDateGroupKey(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function groupReportsByDate(reports: ReportFeedback[], locale: ReportLocale) {
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

function getRouteStatusTone(status: RouteDetailStatus) {
    if (status === "resolved") {
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
    }

    if (status === "git_issued") {
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
    }

    if (status === "suggested") {
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
    }

    return { backgroundColor: "#fff7ed", color: "#c2410c" };
}

function FeedbackListDeleteButton({
    report,
    onDelete,
    disabled = false,
    messages,
}: {
    report: ReportFeedback;
    onDelete: (id: string) => Promise<void>;
    disabled?: boolean;
    messages: ReportMessages;
}) {
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

    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (!confirming) {
            setConfirming(true);
            return;
        }

        void onDelete(report.id).finally(() => {
            setConfirming(false);
        });
    };

    return (
        <button
            type="button"
            data-stitchable-interactive=""
            onClick={handleDelete}
            disabled={disabled}
            aria-label={confirming ? messages.feedbackList.deleteConfirmAriaLabel : messages.feedbackList.deleteAriaLabel}
            title={confirming ? messages.feedbackList.deleteConfirmTitle : messages.feedbackList.deleteTitle}
            className={`flex shrink-0 items-center justify-center gap-[2px] self-start rounded-[6px] p-[6px] disabled:opacity-50 ${
                confirming ? "text-rose-700 hover:bg-rose-50" : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-rose-700"
            }`}
        >
            <TrashIcon className="h-[16px] w-[16px]" />
            {confirming ? <span className="text-[10px] font-semibold">{messages.feedbackList.deleteConfirmLabel}</span> : null}
        </button>
    );
}

function FeedbackListCopyButton({ report, messages }: { report: ReportFeedback; messages: ReportMessages }) {
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
            aria-label={messages.feedbackList.copyAriaLabel}
            title={copied ? messages.feedbackList.copiedTitle : messages.feedbackList.copyTitle}
            className="flex shrink-0 items-center justify-center self-start rounded-[6px] p-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black800)]"
        >
            {copied ? <span className="text-[10px] font-semibold text-[var(--adaptive-blue500)]">{messages.common.ok}</span> : <CopyIcon className="h-[16px] w-[16px]" />}
        </button>
    );
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
        fields,
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
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [reportTypeMenuOpen, setReportTypeMenuOpen] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const statusLabel = filters.status === "all" ? messages.feedbackList.filterStatusAll : messages.status.routeDetail[filters.status];
    const reportTypeLabel = filters.reportType === "all" ? messages.feedbackList.filterTypeAll : filters.reportType === "item" ? messages.feedbackList.reportTypeItem : messages.feedbackList.reportTypeGroup;
    const visibleReports = useMemo(() => filteredReports.slice(0, visibleCount), [filteredReports, visibleCount]);
    const groupedReports = useMemo(() => groupReportsByDate(visibleReports, locale), [locale, visibleReports]);

    useEffect(() => {
        setVisibleCount(FEEDBACK_PAGE_SIZE);
    }, [filters.keyword, filters.reportType, filters.status, listScope, reports.length]);

    useEffect(() => {
        const firstGroupKey = groupedReports[0]?.dateKey;

        if (firstGroupKey) {
            setExpandedGroups(new Set([firstGroupKey]));
        } else {
            setExpandedGroups(new Set());
        }
    }, [filters.keyword, filters.reportType, filters.status, listScope, reports.length]);

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

        if (!node || (visibleCount >= filteredReports.length && !hasNextPage)) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    if (visibleCount < filteredReports.length) {
                        setVisibleCount((current) => Math.min(current + FEEDBACK_PAGE_SIZE, filteredReports.length));
                    } else {
                        void fetchNextPage();
                    }
                }
            },
            { root: node.parentElement, rootMargin: "120px" },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [fetchNextPage, filteredReports.length, hasNextPage, visibleCount]);

    return (
        <section className="flex min-h-0 flex-1 flex-col bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]">
            {canListAllFeedback ? (
                <div
                    className="flex border-t border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[4px]"
                    role="group"
                    aria-label={messages.feedbackList.scopeAriaLabel}
                >
                    {(["current", "all"] as const).map((scope) => (
                        <button
                            key={scope}
                            type="button"
                            aria-pressed={listScope === scope}
                            onClick={() => setListScope(scope)}
                            className={`flex-1 rounded-[6px] px-[8px] py-[4px] text-[12px] font-[600] ${
                                listScope === scope
                                    ? "bg-[var(--adaptive-black200)] text-[var(--adaptive-black900)]"
                                    : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)]"
                            }`}
                        >
                            {scope === "current" ? messages.feedbackList.scopeCurrentPage : messages.feedbackList.scopeAllPages}
                        </button>
                    ))}
                </div>
            ) : null}

            <div className="flex bg-[var(--adaptive-black50)] border-y border-y-[var(--adaptive-border-subtle)]">
                <section className="flex flex-1 items-center gap-[4px]">
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
                                className="flex items-center gap-[4px] px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none"
                            >
                                <span>{statusLabel}</span>
                                <ChevronDownIcon className={`h-[14px] w-[14px] text-[var(--adaptive-black600)] transition-transform ${statusMenuOpen ? "rotate-180" : ""}`} />
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

                    <PanelDropdownMenu
                        open={reportTypeMenuOpen}
                        onClose={() => setReportTypeMenuOpen(false)}
                        align="left"
                        trigger={
                            <button
                                type="button"
                                onClick={() => setReportTypeMenuOpen((current) => !current)}
                                aria-expanded={reportTypeMenuOpen}
                                aria-haspopup="menu"
                                aria-label={messages.feedbackList.filterTypeAriaLabel}
                                className="flex items-center gap-[4px] px-[8px] text-[12px] text-[var(--adaptive-black800)] outline-none"
                            >
                                <span>{reportTypeLabel}</span>
                                <ChevronDownIcon className={`h-[14px] w-[14px] text-[var(--adaptive-black600)] transition-transform ${reportTypeMenuOpen ? "rotate-180" : ""}`} />
                            </button>
                        }
                    >
                        <PanelDropdownMenuItem
                            active={filters.reportType === "all"}
                            onClick={() => {
                                setReportTypeMenuOpen(false);
                                setFilters((current) => ({ ...current, reportType: "all" }));
                            }}
                        >
                            {messages.feedbackList.filterTypeAll}
                        </PanelDropdownMenuItem>
                        <PanelDropdownMenuItem
                            active={filters.reportType === "item"}
                            onClick={() => {
                                setReportTypeMenuOpen(false);
                                setFilters((current) => ({ ...current, reportType: "item" }));
                            }}
                        >
                            {messages.feedbackList.reportTypeItem}
                        </PanelDropdownMenuItem>
                        <PanelDropdownMenuItem
                            active={filters.reportType === "group"}
                            onClick={() => {
                                setReportTypeMenuOpen(false);
                                setFilters((current) => ({ ...current, reportType: "group" }));
                            }}
                        >
                            {messages.feedbackList.reportTypeGroup}
                        </PanelDropdownMenuItem>
                    </PanelDropdownMenu>
                </section>

                <section className="flex-1 relative">
                    <input
                        ref={searchInputRef}
                        value={filters.keyword}
                        onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                        placeholder={messages.feedbackList.searchPlaceholder}
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

            <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]">
                {isError ? (
                    <div className="space-y-1 rounded-md border border-[var(--adaptive-border-subtle)] bg-rose-50 p-2 text-xs text-rose-800">
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
                    <div className="p-[12px] flex flex-col gap-[4px] bg-[var(--adaptive-black200)]">
                        <h6 className="font-semibold text-[var(--adaptive-black900)]">{messages.feedbackList.emptyTitle}</h6>
                        <p className="text-[12px] text-[var(--adaptive-black500)] whitespace-break-spaces leading-[1.5]">
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
                                    className="sticky z-10 flex w-full items-center justify-between bg-[var(--adaptive-black200)] p-[4px_8px]"
                                >
                                    <p className="text-[12px] font-[600] text-[var(--adaptive-black700)]">{label}</p>

                                    <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>

                                {isExpanded
                                    ? groupReports.map((report) => {
                                          const routeStatus = getRouteDetailStatus(report);
                                          const fieldTags = getFieldTags(fields, report.field_values);

                                          return (
                                              <div
                                                  key={report.id}
                                                  className="flex w-full items-start gap-[4px] border-b border-[var(--adaptive-border-subtle)] last:border-b-0"
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
                                                                  {messages.status.routeDetail[routeStatus]}
                                                              </span>
                                                          </div>

                                                          <p className="text-[var(--adaptive-black700)]">{report.message}</p>
                                                          {listScope === "all" ? (
                                                              <p className="truncate text-[11px] text-[var(--adaptive-black500)]">{report.pathname}</p>
                                                          ) : null}
                                                      </section>

                                                      <p className="text-[var(--adaptive-black500)] text-[12px]">{formatTimeOnly(report.created_at, locale)}</p>
                                                  </button>

                                                  <div className="flex shrink-0 items-start gap-[2px] p-[12px] pl-0">
                                                      <FeedbackListCopyButton
                                                          report={report}
                                                          messages={messages}
                                                      />
                                                      {canCreateGitHubIssueFromList ? (
                                                          <GitIssueButton
                                                              report={report}
                                                              messages={messages}
                                                              disabled={isDeleting}
                                                              isSubmitting={creatingGitHubIssueId === report.id}
                                                              onCreateIssue={handleCreateGitHubIssue}
                                                          />
                                                      ) : null}
                                                      <FeedbackListDeleteButton
                                                          report={report}
                                                          onDelete={handleDelete}
                                                          disabled={isDeleting}
                                                          messages={messages}
                                                      />
                                                  </div>
                                              </div>
                                          );
                                      })
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
