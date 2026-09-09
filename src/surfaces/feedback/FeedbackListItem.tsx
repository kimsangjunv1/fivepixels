import { useState, type MouseEvent } from "react";
import type { ReportFeedback } from "@/shared/types/report.js";
import type { ReportLocale, ReportMessages } from "@/shared/i18n/types.js";
import { formatTimeWithSeconds } from "@/shared/utils/shared/format.js";
import { getIssueSummary } from "@/shared/utils/report/reportCases.js";
import { getFeedbackCaseId, getMemoCaseId } from "@/shared/utils/feedback/feedbackCaseId.js";
import { copyTextToClipboard, serializeFeedbackItem } from "@/shared/utils/feedback/feedbackDataTransfer.js";
import { GitIssueButton } from "./GitIssueButton.js";
import { FeedbackDeleteAction } from "./FeedbackDeleteAction.js";
import { canDeleteFeedback } from "@/shared/utils/feedback/feedbackPermissions.js";
import { useReportSession } from "@/shared/providers/reportContext.js";
import { CopyIcon, LockIcon } from "@/shared/components/icons/Icons.js";
import { HoverTooltip } from "@/surfaces/tooltip/HoverTooltip.js";
import { useIntegrationLock } from "@/shared/components/ui/IntegrationLock.js";

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
                {copied ? <span className="text-[12px] font-semibold">{messages.common.ok}</span> : <CopyIcon className="h-[12px] w-[12px]" />}
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
                            <p
                                className="min-w-0 truncate text-[14px] text-[var(--adaptive-black500)]"
                                title={report.pathname}
                            >
                                {report.pathname || "/"}
                            </p>

                            <span className="shrink-0 text-[14px] tabular-nums text-[var(--adaptive-black500)]">
                                {formatTimeWithSeconds(activityAt, locale)}
                            </span>
                        </div>
                    </section>
                </section>
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
