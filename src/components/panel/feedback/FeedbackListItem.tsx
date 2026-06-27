import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportLocale, ReportMessages } from "@/i18n/types.js";
import { formatTimeOnly } from "@/utils/format.js";
import { getFeedbackDisplayStatus, getLatestReply, getRemainingReplyCount } from "@/utils/feedbackThread.js";
import { copyTextToClipboard, serializeFeedbackItem } from "@/utils/feedbackDataTransfer.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
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

function FeedbackListDottedDash() {
    return (
        <span
            className="h-px min-w-[10px] flex-1 self-center bg-[length:5px_1px] bg-repeat-x bg-center"
            style={{
                backgroundImage: "radial-gradient(circle, var(--adaptive-black900) 0.9px, transparent 0.9px)",
            }}
            aria-hidden
        />
    );
}

function FeedbackListRow({ text, trailing }: { text: ReactNode; trailing: ReactNode }) {
    return (
        <div className="flex min-w-0 items-center">
            <div className="min-w-0 shrink truncate">{text}</div>
            <FeedbackListDottedDash />
            <div className="shrink-0">{trailing}</div>
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
    const latestReply = getLatestReply(report);
    const remainingReplyCount = getRemainingReplyCount(report);
    const displayStatus = getFeedbackDisplayStatus(report, false);
    const activityAt = latestReply?.created_at ?? report.created_at;

    return (
        <div
            className="group border-b border-[var(--adaptive-border-subtle)] last:border-b-0"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                type="button"
                onClick={() => onLocate(report.id)}
                className="flex w-full flex-col gap-[6px] p-[10px_12px] text-left"
            >
                <FeedbackListRow
                    text={<p className="truncate text-[13px] leading-[1.4] text-[var(--adaptive-black900)]">{report.message}</p>}
                    trailing={
                        hovered ? (
                            <div
                                className="flex items-center gap-[2px] rounded-full bg-[var(--adaptive-black900)] px-[6px] py-[2px]"
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
                            <span className="rounded-full bg-[var(--adaptive-black900)] px-[8px] py-[2px] text-[12px] tabular-nums text-[var(--adaptive-black50)]">
                                {formatTimeOnly(activityAt, locale)}
                            </span>
                        )
                    }
                />

                <div className="pl-[10px]">
                    <FeedbackListRow
                        text={
                            latestReply ? (
                                <p className="truncate text-[12px] leading-[1.4] text-[var(--adaptive-black600)]">
                                    <span className="text-[var(--adaptive-black400)]">{messages.feedbackList.threadReplyPrefix}</span> {latestReply.message}
                                </p>
                            ) : (
                                <span className="block h-[17px]" />
                            )
                        }
                        trailing={
                            <div className="flex shrink-0 items-center gap-[6px]">
                                <FeedbackStatusBadge status={displayStatus} />
                                {remainingReplyCount > 0 ? (
                                    <>
                                        <span className="text-[11px] text-[var(--adaptive-black400)]">|</span>
                                        <span className="text-[11px] tabular-nums text-[var(--adaptive-black500)]">+{remainingReplyCount}</span>
                                    </>
                                ) : null}
                            </div>
                        }
                    />
                </div>

                {listScope === "all" ? <p className="truncate pl-[10px] text-[11px] text-[var(--adaptive-black400)]">{report.pathname}</p> : null}
            </button>
        </div>
    );
}
