import { useEffect, useState, type MouseEvent } from "react";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportLocale, ReportMessages } from "@/i18n/types.js";
import { formatTimeOnly } from "@/utils/format.js";
import { getIssueSummary } from "@/utils/reportCases.js";
import { getReplyCount } from "@/utils/feedbackThread.js";
import { getFeedbackCaseId } from "@/utils/feedbackCaseId.js";
import { getFeedbackListStatusTag } from "@/utils/feedbackListStatus.js";
import { isFeedbackCategory } from "@/constants/feedbackCategory.js";
import { copyTextToClipboard, serializeFeedbackItem } from "@/utils/feedbackDataTransfer.js";
import { GitIssueButton } from "./GitIssueButton.js";
import { CopyIcon, TrashIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";

type FeedbackListItemProps = {
    report: ReportFeedback;
    locale: ReportLocale;
    messages: ReportMessages;
    listScope: "current" | "all";
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

function FeedbackListDeleteAction({ report, onDelete, disabled = false, messages }: { report: ReportFeedback; onDelete: (id: string) => Promise<void>; disabled?: boolean; messages: ReportMessages }) {
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
        <HoverTooltip label={confirming ? messages.feedbackList.deleteConfirmTitle : messages.feedbackList.deleteTitle}>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={handleDelete}
                disabled={disabled}
                aria-label={confirming ? messages.feedbackList.deleteConfirmAriaLabel : messages.feedbackList.deleteAriaLabel}
                className={`flex h-[20px] w-[20px] items-center justify-center disabled:opacity-50 ${
                    confirming ? "text-rose-200 hover:text-white" : "text-[var(--adaptive-black50)] hover:text-white"
                }`}
            >
                {confirming ? <span className="text-[9px] font-semibold">!</span> : <TrashIcon className="h-[12px] w-[12px]" />}
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
    disabled = false,
    canCreateGitHubIssue = false,
    creatingGitHubIssueId = null,
    onLocate,
    onDelete,
    onCreateGitHubIssue,
}: FeedbackListItemProps) {
    const [hovered, setHovered] = useState(false);
    const caseId = getFeedbackCaseId(report);
    const replyCount = getReplyCount(report);
    const statusTag = getFeedbackListStatusTag(report);
    const category = isFeedbackCategory(report.category) ? report.category : null;
    const summary = getIssueSummary(report, { summaryMore: messages.cases.summaryMore });
    const activityAt = report.created_at;

    return (
        <div
            className="group border-b border-[var(--adaptive-border-subtle)] last:border-b-0"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                type="button"
                onClick={() => onLocate(report.id)}
                className="flex w-full flex-col gap-[6px] px-[12px] py-[10px] text-left"
            >
                <div className="flex min-w-0 items-center justify-between gap-[8px]">
                    <div className="flex min-w-0 items-center gap-[6px]">
                        <span className="truncate text-[13px] font-bold leading-[1.3] text-[var(--adaptive-black900)]">{caseId ?? "#FC-—"}</span>
                        {replyCount > 0 ? (
                            <span className="rounded-[4px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[5px] py-[1px] text-[11px] font-semibold tabular-nums text-[var(--adaptive-black700)]">
                                {messages.feedbackList.replyCountBadge(replyCount)}
                            </span>
                        ) : null}
                    </div>

                    {hovered ? (
                        <div
                            className="flex shrink-0 items-center gap-[2px] rounded-full bg-[var(--adaptive-black900)] px-[6px] py-[2px]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <FeedbackListCopyAction
                                report={report}
                                messages={messages}
                            />
                            {canCreateGitHubIssue && onCreateGitHubIssue ? (
                                <FeedbackListGitIssueAction
                                    report={report}
                                    messages={messages}
                                    disabled={disabled}
                                    isSubmitting={creatingGitHubIssueId === report.id}
                                    onCreateIssue={onCreateGitHubIssue}
                                />
                            ) : null}
                            <FeedbackListDeleteAction
                                report={report}
                                onDelete={onDelete}
                                disabled={disabled}
                                messages={messages}
                            />
                        </div>
                    ) : (
                        <span className="flex shrink-0 items-center gap-[4px] text-[12px] tabular-nums text-[var(--adaptive-black500)]">
                            <ClockIcon className="h-[12px] w-[12px]" />
                            {formatTimeOnly(activityAt, locale)}
                        </span>
                    )}
                </div>

                <p className="line-clamp-2 text-[12px] leading-[1.45] text-[var(--adaptive-black600)]">{summary}</p>

                <div className="flex flex-wrap items-center gap-[6px]">
                    {category ? (
                        <span className="inline-flex items-center gap-[4px] rounded-[6px] bg-[var(--adaptive-black100)] px-[8px] py-[3px] text-[11px] font-medium text-[var(--adaptive-black700)]">
                            <CategoryShieldIcon className="h-[11px] w-[11px] text-[var(--adaptive-black500)]" />
                            {messages.feedbackList.categoryTag[category]}
                        </span>
                    ) : null}
                    <span className="inline-flex items-center rounded-[6px] bg-[var(--adaptive-black100)] px-[8px] py-[3px] text-[11px] font-medium text-[var(--adaptive-black700)]">
                        {messages.feedbackList.statusTag[statusTag]}
                    </span>
                </div>

                {listScope === "all" ? <p className="truncate text-[11px] text-[var(--adaptive-black400)]">{report.pathname}</p> : null}
            </button>
        </div>
    );
}
