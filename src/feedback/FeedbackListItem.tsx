import { useState, type MouseEvent } from "react";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportLocale, ReportMessages } from "@/i18n/types.js";
import { formatTimeOnly } from "@/utils/shared/format.js";
import { getIssueSummary } from "@/utils/report/reportCases.js";
import { getReplyCount } from "@/utils/feedback/feedbackThread.js";
import { getFeedbackCaseId, getMemoCaseId } from "@/utils/feedback/feedbackCaseId.js";
import { getFeedbackListStatusTag } from "@/utils/feedback/feedbackListStatus.js";
import { isFeedbackCategory } from "@/constants/feedbackCategory.js";
import { copyTextToClipboard, serializeFeedbackItem } from "@/utils/feedback/feedbackDataTransfer.js";
import { GitIssueButton } from "./GitIssueButton.js";
import { FeedbackDeleteAction } from "./FeedbackDeleteAction.js";
import { canDeleteFeedback } from "@/utils/feedback/feedbackPermissions.js";
import { useReportSession } from "@/providers/reportContext.js";
import { CopyIcon, LockIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/tooltip/HoverTooltip.js";
import { useIntegrationLock } from "@/components/ui/IntegrationLock.js";

type FeedbackListItemProps = {
    report: ReportFeedback;
    locale: ReportLocale;
    messages: ReportMessages;
    listScope: "current" | "all";
    listKind?: "feedback" | "memo";
    disabled?: boolean;
    canCreateGitHubIssue?: boolean;
    creatingGitHubIssueId?: string | null;
    onLocate: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
    onCreateGitHubIssue?: (report: ReportFeedback) => Promise<void>;
};

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className={className}
        >
            <circle
                cx="8"
                cy="8"
                r="6.25"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M8 4.5V8l2.25 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CategoryShieldIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            className={className}
        >
            <path d="M8 1.5 3.5 3.4v3.7c0 3.1 2.1 5.9 4.5 6.9 2.4-1 4.5-3.8 4.5-6.9V3.4L8 1.5Zm0 1.7 3.2 1.3v2.6c0 2.2-1.4 4.2-3.2 5.1-1.8-.9-3.2-2.9-3.2-5.1V4.5L8 3.2Z" />
        </svg>
    );
}

function FeedbackListCopyAction({ report, messages }: { report: ReportFeedback; messages: ReportMessages }) {
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
        <HoverTooltip label={copied ? messages.feedbackList.copiedTitle : messages.feedbackList.copyTitle}>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={handleCopy}
                aria-label={messages.feedbackList.copyAriaLabel}
                className="flex h-[20px] w-[20px] items-center justify-center text-[var(--adaptive-black50)] hover:text-white"
            >
                {copied ? <span className="text-[9px] font-semibold">{messages.common.ok}</span> : <CopyIcon className="h-[12px] w-[12px]" />}
            </button>
        </HoverTooltip>
    );
}

function FeedbackListGitIssueAction({
    report,
    messages,
    disabled,
    isSubmitting,
    onCreateIssue,
}: {
    report: ReportFeedback;
    messages: ReportMessages;
    disabled?: boolean;
    isSubmitting?: boolean;
    onCreateIssue: (report: ReportFeedback) => Promise<void>;
}) {
    return (
        <div
            className="flex items-center [&_button]:h-[20px] [&_button]:w-[20px] [&_button]:p-0 [&_button]:text-[var(--adaptive-black50)] [&_button:hover]:bg-transparent [&_button:hover]:text-white [&_a]:h-[20px] [&_a]:w-[20px] [&_a]:p-0 [&_a]:text-[var(--adaptive-black50)] [&_a:hover]:bg-transparent [&_a:hover]:text-white [&_svg]:h-[12px] [&_svg]:w-[12px]"
            onClick={(event) => event.stopPropagation()}
        >
            <GitIssueButton
                report={report}
                messages={messages}
                disabled={disabled}
                isSubmitting={isSubmitting}
                onCreateIssue={onCreateIssue}
            />
        </div>
    );
}

export function FeedbackListItem({
    report,
    locale,
    messages,
    listScope,
    listKind = "feedback",
    disabled = false,
    canCreateGitHubIssue = false,
    creatingGitHubIssueId = null,
    onLocate,
    onDelete,
    onCreateGitHubIssue,
}: FeedbackListItemProps) {
    const { sessionActor } = useReportSession();
    const canDelete = canDeleteFeedback(report, sessionActor);
    const deleteLock = useIntegrationLock("deleteFeedback");
    const githubLock = useIntegrationLock("githubIssue");
    const isMemoItem = listKind === "memo" || report.category === "memo";
    const caseId = isMemoItem ? getMemoCaseId(report) : getFeedbackCaseId(report);
    const replyCount = getReplyCount(report);
    const statusTag = getFeedbackListStatusTag(report);
    const category = isFeedbackCategory(report.category) ? report.category : null;
    const summary = getIssueSummary(report, { summaryMore: messages.cases.summaryMore });
    const activityAt = report.created_at;
    const showGitHubAction = !isMemoItem && (canCreateGitHubIssue || githubLock.locked);
    const showDeleteAction = canDelete;
    const caseIdFallback = isMemoItem ? "#MM-—" : "#FC-—";

    return (
        <div className="group flex flex-col relative border-b border-[var(--adaptive-border-subtle)] last:border-b-0 bg-[var(--adaptive-tintOpacity50)]">
            <button
                type="button"
                onClick={() => onLocate(report.id)}
                className="flex flex-1 flex-col gap-[8px] text-left hover:bg-[var(--adaptive-black300)]"
            >
                <section className="flex">
                    <span className="truncate text-[14px] font-semibold text-[var(--adaptive-black900)] min-w-[72px] flex items-center justify-center border-r border-r-[var(--adaptive-border-subtle)]">
                        {caseId ?? caseIdFallback}
                    </span>

                    <section className="flex flex-col gap-[4px] p-[8px_12px] flex-1">
                        <p className="line-clamp-2 text-[14px] text-[var(--adaptive-black900)] font-medium whitespace-break-spaces leading-[1.5]">{summary}</p>

                        <div className="flex items-center justify-between gap-[6px]">
                            {isMemoItem ? (
                                <p
                                    className="min-w-0 truncate text-[12px] text-[var(--adaptive-black500)]"
                                    title={report.pathname}
                                >
                                    {report.pathname || "/"}
                                </p>
                            ) : (
                                <section className="flex gap-[4px]">
                                    {category ? (
                                        <section className="flex items-center rounded-[4px] border-[1px] border-[var(--adaptive-black900)]">
                                            <span className="px-[2px] py-[1px] text-[10px] font-medium text-[var(--adaptive-black900)]">{messages.feedbackList.categoryTag[category]}</span>
                                        </section>
                                    ) : null}

                                    <section className="flex items-center rounded-[4px] border-[1px] border-[var(--adaptive-black900)]">
                                        <span className="px-[4px] py-[1px] text-[10px] font-medium text-[var(--adaptive-black900)]">{messages.feedbackList.statusTag[statusTag]}</span>
                                    </section>
                                    <div className="flex min-w-0 items-center gap-[4px]">
                                        {replyCount > 0 ? (
                                            <span className="rounded-[4px] border-[1.5px] border-[var(--adaptive-black900)] px-[1px] text-[10px] font-bold text-[var(--adaptive-black900)]">
                                                {messages.feedbackList.replyCountBadge(replyCount)}
                                            </span>
                                        ) : null}
                                    </div>
                                </section>
                            )}

                            <section>
                                <div className="flex min-w-0 items-center justify-between gap-[4px]">
                                    <span className="flex shrink-0 items-center gap-[4px] text-[12px] tabular-nums text-[var(--adaptive-black900)]">
                                        <ClockIcon className="h-[12px] w-[12px]" />

                                        {formatTimeOnly(activityAt, locale)}
                                    </span>
                                </div>
                            </section>
                        </div>
                    </section>
                </section>

                {!isMemoItem && listScope === "all" ? <p className="truncate text-[11px] text-[var(--adaptive-black400)]">{report.pathname}</p> : null}
            </button>

            <div className="absolute right-[10px] top-[6px] z-[1] flex items-center gap-[2px]">
                <div className="flex items-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {showGitHubAction ? (
                        githubLock.locked || !onCreateGitHubIssue ? (
                            <HoverTooltip
                                label={githubLock.tooltipLabel}
                                multiline
                            >
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    disabled
                                    aria-label={githubLock.tooltipLabel}
                                    className="flex h-[20px] w-[20px] items-center justify-center text-[var(--adaptive-black50)] opacity-70"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <LockIcon className="h-[12px] w-[12px]" />
                                </button>
                            </HoverTooltip>
                        ) : (
                            <FeedbackListGitIssueAction
                                report={report}
                                messages={messages}
                                disabled={disabled}
                                isSubmitting={creatingGitHubIssueId === report.id}
                                onCreateIssue={onCreateGitHubIssue}
                            />
                        )
                    ) : null}
                    <FeedbackListCopyAction
                        report={report}
                        messages={messages}
                    />
                    {showDeleteAction ? (
                        <FeedbackDeleteAction
                            reportId={report.id}
                            onDelete={onDelete}
                            disabled={disabled}
                            locked={deleteLock.locked}
                            lockLabel={deleteLock.tooltipLabel}
                            messages={messages}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
