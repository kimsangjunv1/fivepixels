import { useState, type MouseEvent } from "react";
import type { ReportReply } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";
import { formatDate } from "@/utils/format.js";
import { copyTextToClipboard } from "@/utils/feedbackDataTransfer.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
// import { CopyIcon } from "@/components/icons/CopyIcon.js";
import { LinkIcon } from "@/components/icons/LinkIcon.js";
import { ArrowTRIcon } from "@/components/icons/ArrowTRIcon.js";

type GitIssuedThreadEntryProps = {
    reply: ReportReply;
    issueUrl: string;
};

export function GitIssuedThreadEntry({ reply, issueUrl }: GitIssuedThreadEntryProps) {
    const { locale, messages } = useReport();
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
        <article className="flex flex-col gap-[8px] border-t border-[var(--adaptive-black800)] p-[16px]">
            <div className="flex items-start justify-between gap-[8px]">
                <FeedbackStatusBadge status="git_issued" />
                <span className="text-[12px] text-[var(--adaptive-black500)]">{formatDate(reply.created_at, locale)}</span>
            </div>

            <p className="leading-[1.5] text-[14px] text-[var(--adaptive-black50)]">{reply.message}</p>

            <div className="flex flex-wrap items-center gap-[8px]">
                <a
                    href={issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-stitchable-interactive=""
                    onClick={(event) => event.stopPropagation()}
                    className="flex items-center justify-center gap-[4px] rounded-full text border border-[var(--adaptive-black700)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black900)]"
                >
                    {messages.resolution.gitIssuedOpenLink}
                    <ArrowTRIcon className="h-[12px] w-[12px]" />
                </a>

                <button
                    type="button"
                    data-stitchable-interactive=""
                    onClick={handleCopy}
                    aria-label={messages.resolution.gitIssuedCopyLinkAriaLabel}
                    title={copied ? messages.resolution.gitIssuedCopiedTitle : messages.resolution.gitIssuedCopyLinkTitle}
                    className="flex items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-black700)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black900)] hover:text-[var(--adaptive-black50)]"
                >
                    {copied ? messages.resolution.gitIssuedCopiedTitle : messages.resolution.gitIssuedCopyLinkTitle}
                    <LinkIcon className="h-[12px] w-[12px]" />
                </button>
            </div>
        </article>
    );
}
