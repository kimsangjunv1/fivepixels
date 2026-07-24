import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { CopyIcon, InfoIcon, StarIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { useReportPreferences, useReportSession } from "../../../providers/reportContext.js";
import { buildReportIdAttributeSnippet } from "../../../utils/marker/targetSelector.js";
import { Text } from "../../../components/ui/Text";
const TIP_SHIMMER = { start: "#ffffff", end: "#000000" };
const ALERT_SHIMMER = { start: "#000000", end: "#ef4444" };
export function PickTargetSnippet({ suggestedReportId, reportType = "item", alertMessage = null }) {
    const { messages } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const [copied, setCopied] = useState(false);
    const isAlert = Boolean(alertMessage);
    const tipLabel = "현재 요소에 ID를 설정하면 추적이 더 쉬워집니다";
    const displayMessage = alertMessage ?? tipLabel;
    const snippet = suggestedReportId ? buildReportIdAttributeSnippet(suggestedReportId, reportType) : "";
    const infoTooltipContent = useMemo(() => (snippet ? `${messages.pickTarget.snippetTooltipIntro}\n${snippet}` : messages.pickTarget.snippetTooltipIntro), [messages.pickTarget.snippetTooltipIntro, snippet]);
    const handleCopy = async () => {
        if (!snippet) {
            return;
        }
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
    return (_jsxs("section", { className: "flex items-center justify-between gap-[6px] px-[12px] py-[4px]", role: isAlert ? "alert" : undefined, children: [_jsxs("section", { className: "flex min-w-0 items-center gap-[4px]", children: [_jsx(StarIcon, { className: `h-[12px] w-[12px] shrink-0 ${isAlert ? "text-rose-500" : "text-emerald-600 dark:text-emerald-300"}` }), _jsx(Text.Shimmer, { className: "min-w-0 truncate text-[12px]", color: isAlert ? ALERT_SHIMMER : TIP_SHIMMER, duration: isAlert ? 4 : 10, children: displayMessage })] }), !isAlert && suggestedReportId ? (_jsxs("section", { className: "flex shrink-0", children: [_jsx(HoverTooltip, { multiline: true, content: infoTooltipContent, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.pickTarget.snippetInfoAriaLabel, className: "flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: _jsx(InfoIcon, { className: "h-[14px] w-[14px]" }) }) }), _jsx(HoverTooltip, { label: copied ? messages.common.copied : messages.common.copy, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => void handleCopy(), "aria-label": messages.pickTarget.snippetCopyAriaLabel, className: "flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: copied ? _jsx("span", { className: "text-[9px] font-semibold", children: messages.common.ok }) : _jsx(CopyIcon, { className: "h-[12px] w-[12px]" }) }) })] })) : null] }));
}
//# sourceMappingURL=PickTargetSnippet.js.map