import type { ReportFeedback, ReportField } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
import { AskAiIcon } from "@/components/icons/Icons.js";
import { copyTextToClipboard } from "@/utils/feedback/feedbackDataTransfer.js";
import { buildAiPromptLabels, formatFeedbackForAiPrompt } from "@/utils/feedback/formatFeedbackForAiPrompt.js";
import { AskAiCopyDropdown } from "./AskAiCopyDropdown.js";

type ThreadAskAiFloatingButtonProps = {
    report: ReportFeedback;
    fields: ReportField[];
    messages: ReportMessages;
    caseId: string;
};

export function ThreadAskAiFloatingButton({ report, fields, messages, caseId }: ThreadAskAiFloatingButtonProps) {
    const copyPrompt = (options: Parameters<typeof formatFeedbackForAiPrompt>[2]) => {
        const text = formatFeedbackForAiPrompt(report, fields, options, buildAiPromptLabels(messages));

        if (!text) {
            return Promise.reject(new Error("empty prompt"));
        }

        return copyTextToClipboard(text);
    };

    return (
        <AskAiCopyDropdown
            align="right"
            menuClassName="min-w-[188px]"
            items={[
                {
                    id: "thread-modification",
                    label: messages.marker.askAi.threadModification,
                    onSelect: () => copyPrompt({ intent: "modification", scope: "thread", caseId }),
                },
                {
                    id: "thread-review",
                    label: messages.marker.askAi.threadReview,
                    onSelect: () => copyPrompt({ intent: "review", scope: "thread", caseId }),
                },
            ]}
            trigger={({ open, copied, toggle }) => (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={toggle}
                    aria-expanded={open}
                    aria-haspopup="menu"
                    aria-label={messages.marker.askAi.threadFloatingAriaLabel}
                    title={copied ? messages.marker.askAi.copied : messages.marker.askAi.title}
                    className={`flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--adaptive-black100)] text-[var(--adaptive-black700)] shadow-[var(--adaptive-popup-shadow)] transition-colors hover:bg-[var(--adaptive-black200)] hover:text-[var(--adaptive-black900)] ${open ? "text-[var(--adaptive-blue500)]" : ""}`}
                >
                    <AskAiIcon className="h-[14px] w-[14px]" />
                </button>
            )}
        />
    );
}
