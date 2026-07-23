import { useState, type MouseEvent } from "react";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportLocale, ReportMessages } from "@/i18n/types.js";
import { formatTimeOnly } from "@/utils/shared/format.js";
import { getIssueSummary } from "@/utils/report/reportCases.js";
import { getReplyCount } from "@/utils/feedback/feedbackThread.js";
import { getFeedbackCaseId } from "@/utils/feedback/feedbackCaseId.js";
import { getFeedbackListStatusTag } from "@/utils/feedback/feedbackListStatus.js";
import { isFeedbackCategory } from "@/constants/feedbackCategory.js";
import { copyTextToClipboard, serializeFeedbackItem } from "@/utils/feedback/feedbackDataTransfer.js";
import { GitIssueButton } from "./GitIssueButton.js";
import { FeedbackPinToggleButton } from "./FeedbackPinToggleButton.js";
import { FeedbackDeleteAction } from "./FeedbackDeleteAction.js";
import { canDeleteFeedback } from "@/utils/feedback/feedbackPermissions.js";
import { useReport } from "@/providers/reportContext.js";
import { CopyIcon } from "@/components/icons/Icons.js";
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
    const { sessionActor } = useReport();
    const canDelete = canDeleteFeedback(report, sessionActor);
    const caseId = getFeedbackCaseId(report);
    const replyCount = getReplyCount(report);
    const statusTag = getFeedbackListStatusTag(report);
    const category = isFeedbackCategory(report.category) ? report.category : null;
    const summary = getIssueSummary(report, { summaryMore: messages.cases.summaryMore });
    const activityAt = report.created_at;

    return (
        <div className="group relative border-b border-[var(--adaptive-border-subtle)] last:border-b-0">
            <button
                type="button"
                onClick={() => onLocate(report.id)}
                className="flex w-full flex-col gap-[8px] px-[16px] py-[8px] text-left hover:bg-[var(--adaptive-neutralTintOpacity900)]"
            >
                <section className="flex flex-col gap-[4px]">
                    <div className="flex min-w-0 items-center justify-between gap-[4px]">
                        <div className="flex min-w-0 items-center gap-[4px]">
                            <span className="truncate text-[14px] font-semibold text-[var(--adaptive-black900)]">{caseId ?? "#FC-—"}</span>

                            {replyCount > 0 ? (
                                <span className="rounded-[4px] border-[1.5px] border-[var(--adaptive-black900)] px-[2px] text-[10px] font-bold text-[var(--adaptive-black900)]">
                                    {messages.feedbackList.replyCountBadge(replyCount)}
                                </span>
                            ) : null}
                        </div>

                        <span className="flex shrink-0 items-center gap-[4px] pr-[22px] text-[12px] tabular-nums text-[var(--adaptive-black500)]">
                            <ClockIcon className="h-[12px] w-[12px]" />
                            {formatTimeOnly(activityAt, locale)}
                        </span>
                    </div>

                    <p className="line-clamp-2 text-[14px] text-[var(--adaptive-black900)]">{summary}</p>
                </section>

                <div className="flex flex-wrap items-center gap-[6px]">
                    {category ? (
                        <span className="inline-flex items-center gap-[4px] rounded-[4px] bg-[var(--adaptive-black200)] px-[4px] py-[1px] text-[12px] font-medium text-[var(--adaptive-black700)]">
                            <CategoryShieldIcon className="h-[11px] w-[11px] text-[var(--adaptive-black500)]" />
                            {messages.feedbackList.categoryTag[category]}
                        </span>
                    ) : null}
                    <span className="inline-flex items-center rounded-[4px] bg-[var(--adaptive-black200)] px-[4px] py-[1px] text-[12px] font-medium text-[var(--adaptive-black700)]">
                        {messages.feedbackList.statusTag[statusTag]}
                    </span>
                </div>

                {listScope === "all" ? <p className="truncate text-[11px] text-[var(--adaptive-black400)]">{report.pathname}</p> : null}
            </button>

            <div className="absolute right-[10px] top-[6px] z-[1] flex items-center gap-[2px]">
                <div className="flex items-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {canCreateGitHubIssue && onCreateGitHubIssue ? (
                        <FeedbackListGitIssueAction
                            report={report}
                            messages={messages}
                            disabled={disabled}
                            isSubmitting={creatingGitHubIssueId === report.id}
                            onCreateIssue={onCreateGitHubIssue}
                        />
                    ) : null}
                    <FeedbackListCopyAction
                        report={report}
                        messages={messages}
                    />
                    {canDelete ? (
                        <FeedbackDeleteAction
                            reportId={report.id}
                            onDelete={onDelete}
                            disabled={disabled}
                            messages={messages}
                        />
                    ) : null}
                </div>
                <FeedbackPinToggleButton
                    report={report}
                    className="h-[20px] w-[20px]"
                    iconClassName="h-[12px] w-[12px]"
                />
            </div>
        </div>
    );
}
