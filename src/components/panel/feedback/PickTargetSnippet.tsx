import { useMemo, useState } from "react";
import { CopyIcon, InfoIcon, StarIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { buildReportIdAttributeSnippet } from "@/utils/marker/targetSelector.js";
import { Text } from "@/components/ui/Text";

type PickTargetSnippetProps = {
    suggestedReportId: string;
    reportType?: "group" | "item";
};

export function PickTargetSnippet({ suggestedReportId, reportType = "item" }: PickTargetSnippetProps) {
    const { messages } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const [copied, setCopied] = useState(false);
    const snippet = buildReportIdAttributeSnippet(suggestedReportId, reportType);
    const infoTooltipContent = useMemo(() => `${messages.pickTarget.snippetTooltipIntro}\n${snippet}`, [messages.pickTarget.snippetTooltipIntro, snippet]);

    const handleCopy = async () => {
        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(snippet);
            } else {
                throw new Error("clipboard unavailable");
            }

            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };

    return (
        <section className="flex items-center justify-between gap-[6px] px-[12px] py-[4px]">
            <section className="flex gap-[4px]">
                <StarIcon className="h-[12px] w-[12px] shrink-0 text-emerald-600 dark:text-emerald-300" />
                <section className="flex flex-col gap-[4px]">
                    {/* <span className="min-w-0 flex-1 text-[12px] font-medium text-[var(--adaptive-black900)]">{messages.pickTarget.snippetTitle}</span> */}
                    <Text.Shimmer
                        className="text-[12px]"
                        color={{ start: "#ffffff", end: "#000000" }}
                        duration={10}
                    >
                        현재 요소에 ID를 설정하면 추적이 더 쉬워집니다
                    </Text.Shimmer>
                </section>
            </section>

            <section className="flex">
                <HoverTooltip
                    multiline
                    content={infoTooltipContent}
                >
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        aria-label={messages.pickTarget.snippetInfoAriaLabel}
                        className="flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]"
                    >
                        <InfoIcon className="h-[14px] w-[14px]" />
                    </button>
                </HoverTooltip>

                <HoverTooltip label={copied ? messages.common.copied : messages.common.copy}>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onClick={() => void handleCopy()}
                        aria-label={messages.pickTarget.snippetCopyAriaLabel}
                        className="flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]"
                    >
                        {copied ? <span className="text-[9px] font-semibold">{messages.common.ok}</span> : <CopyIcon className="h-[12px] w-[12px]" />}
                    </button>
                </HoverTooltip>
            </section>
        </section>
    );
}
