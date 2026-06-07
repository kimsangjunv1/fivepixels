import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { formatDate } from "../../../utils/format.js";
import { copyTextToClipboard } from "../../../utils/feedbackDataTransfer.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
// import { CopyIcon } from "../../../components/icons/CopyIcon.js";
import { LinkIcon } from "../../../components/icons/LinkIcon.js";
import { ArrowTRIcon } from "../../../components/icons/ArrowTRIcon.js";
export function GitIssuedThreadEntry({ reply, issueUrl }) {
    const { locale, messages } = useReport();
    const [copied, setCopied] = useState(false);
    const handleCopy = (event) => {
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
    return (_jsxs("article", { className: "flex flex-col gap-[8px] border-t border-[var(--adaptive-black800)] p-[16px]", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: "git_issued" }), _jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: formatDate(reply.created_at, locale) })] }), _jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-black50)]", children: reply.message }), _jsxs("div", { className: "flex flex-wrap items-center gap-[8px]", children: [_jsxs("a", { href: issueUrl, target: "_blank", rel: "noopener noreferrer", "data-stitchable-interactive": "", onClick: (event) => event.stopPropagation(), className: "flex items-center justify-center gap-[4px] rounded-full text border border-[var(--adaptive-black700)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black900)]", children: [messages.resolution.gitIssuedOpenLink, _jsx(ArrowTRIcon, { className: "h-[12px] w-[12px]" })] }), _jsxs("button", { type: "button", "data-stitchable-interactive": "", onClick: handleCopy, "aria-label": messages.resolution.gitIssuedCopyLinkAriaLabel, title: copied ? messages.resolution.gitIssuedCopiedTitle : messages.resolution.gitIssuedCopyLinkTitle, className: "flex items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-black700)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black900)] hover:text-[var(--adaptive-black50)]", children: [copied ? messages.resolution.gitIssuedCopiedTitle : messages.resolution.gitIssuedCopyLinkTitle, _jsx(LinkIcon, { className: "h-[12px] w-[12px]" })] })] })] }));
}
//# sourceMappingURL=GitIssuedThreadEntry.js.map