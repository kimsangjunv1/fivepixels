import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { CopyIcon, InfoIcon, StarIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { useReport } from "../../../providers/reportContext.js";
import { buildReportIdAttributeSnippet } from "../../../utils/targetSelector.js";
import { Text } from "../../../components/ui/Text";
export function PickTargetSnippet({ suggestedReportId, reportType = "item" }) {
    const { messages, setErrorMessage } = useReport();
    const [copied, setCopied] = useState(false);
    const snippet = buildReportIdAttributeSnippet(suggestedReportId, reportType);
    const infoTooltipContent = useMemo(() => `${messages.pickTarget.snippetTooltipIntro}\n${snippet}`, [messages.pickTarget.snippetTooltipIntro, snippet]);
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
    return (_jsxs("section", { className: "flex items-center justify-between gap-[6px] px-[12px] py-[4px]", children: [_jsxs("section", { className: "flex gap-[4px]", children: [_jsx(StarIcon, { className: "h-[12px] w-[12px] shrink-0 text-emerald-600 dark:text-emerald-300" }), _jsx("section", { className: "flex flex-col gap-[4px]", children: _jsx(Text.Shimmer, { className: "text-[12px]", color: { start: "#ffffff", end: "#000000" }, duration: 10, children: "\uD604\uC7AC \uC694\uC18C\uC5D0 ID\uB97C \uC124\uC815\uD558\uBA74 \uCD94\uC801\uC774 \uB354 \uC26C\uC6CC\uC9D1\uB2C8\uB2E4" }) })] }), _jsxs("section", { className: "flex", children: [_jsx(HoverTooltip, { multiline: true, content: infoTooltipContent, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.pickTarget.snippetInfoAriaLabel, className: "flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: _jsx(InfoIcon, { className: "h-[14px] w-[14px]" }) }) }), _jsx(HoverTooltip, { label: copied ? messages.common.copied : messages.common.copy, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => void handleCopy(), "aria-label": messages.pickTarget.snippetCopyAriaLabel, className: "flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: copied ? _jsx("span", { className: "text-[9px] font-semibold", children: messages.common.ok }) : _jsx(CopyIcon, { className: "h-[12px] w-[12px]" }) }) })] })] }));
}
//# sourceMappingURL=PickTargetSnippet.js.map