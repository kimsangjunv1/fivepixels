import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { buildReportIdAttributeSnippet } from "../../../utils/targetSelector.js";
export function PickTargetSnippet({ suggestedReportId, reportType = "item" }) {
    const { messages, setErrorMessage } = useReport();
    const [copied, setCopied] = useState(false);
    const snippet = buildReportIdAttributeSnippet(suggestedReportId, reportType);
    const handleCopy = async () => {
        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(snippet);
            }
            else {
                throw new Error("clipboard unavailable");
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }
        catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };
    return (_jsxs("section", { className: "flex flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]", children: [_jsx("p", { className: "text-[12px] font-medium text-[var(--adaptive-black900)]", children: messages.pickTarget.snippetTitle }), _jsx("p", { className: "text-[11px] leading-[1.4] text-[var(--adaptive-black500)]", children: messages.pickTarget.snippetDescription }), _jsxs("div", { className: "flex items-start gap-[8px] rounded-[8px] bg-[var(--adaptive-black100)] p-[8px]", children: [_jsx("code", { className: "min-w-0 flex-1 break-all font-[var(--coding-font)] text-[11px] text-[var(--adaptive-black900)]", children: snippet }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => void handleCopy(), className: "shrink-0 rounded-[6px] bg-[var(--adaptive-black200)] px-[8px] py-[4px] text-[11px] font-medium text-[var(--adaptive-black900)]", children: copied ? messages.common.copied : messages.common.copy })] })] }));
}
//# sourceMappingURL=PickTargetSnippet.js.map