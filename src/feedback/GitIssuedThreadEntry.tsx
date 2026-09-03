import { useState, type MouseEvent } from "react";
import type { ReportReply } from "@/types/report.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { formatDate } from "@/utils/shared/format.js";
import { copyTextToClipboard } from "@/utils/feedback/feedbackDataTransfer.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
// import { CopyIcon } from "@/components/icons/Icons.js";
import { LinkIcon, ArrowTRIcon } from "@/components/icons/Icons.js";

type GitIssuedThreadEntryProps = {
    reply: ReportReply;
    issueUrl: string;
};

export function GitIssuedThreadEntry({ reply, issueUrl }: GitIssuedThreadEntryProps) {
    const { locale, messages } = useReportPreferences();
    const [copied, setCopied] = useState(false);

    const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        void copyTextToClipboard(issueUrl)
            .then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
            })
            .catch(() => {
                setCopied(false);
            });
    };

    return (
        <article className="flex flex-col gap-[8px] border-t border-[var(--adaptive-border-subtle)] p-[16px]">
            <div className="flex items-start justify-between gap-[8px]">
                <FeedbackStatusBadge status="git_issued" />
                <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(reply.created_at, locale)}</span>
            </div>

            <p className="leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)] whitespace-break-spaces">{reply.message}</p>

            <div className="flex flex-wrap items-center gap-[8px]">
                <a
                    href={issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-fivepixels-interactive=""
                    onClick={(event) => event.stopPropagation()}
                    className="flex items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-text-muted)] hover:bg-[var(--adaptive-surface-muted)]"
                >
                    {messages.resolution.gitIssuedOpenLink}
                    <ArrowTRIcon className="h-[12px] w-[12px]" />
                </a>

                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={handleCopy}
                    aria-label={messages.resolution.gitIssuedCopyLinkAriaLabel}
                    title={copied ? messages.resolution.gitIssuedCopiedTitle : messages.resolution.gitIssuedCopyLinkTitle}
                    className="flex items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-text-muted)] hover:bg-[var(--adaptive-surface-muted)] hover:text-[var(--adaptive-text-primary)]"
                >
                    {copied ? messages.resolution.gitIssuedCopiedTitle : messages.resolution.gitIssuedCopyLinkTitle}
                    <LinkIcon className="h-[12px] w-[12px]" />
                </button>
            </div>
        </article>
    );
}
