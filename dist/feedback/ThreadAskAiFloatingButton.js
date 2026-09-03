import { jsx as _jsx } from "react/jsx-runtime";
import { AskAiIcon } from "../components/icons/Icons.js";
import { copyTextToClipboard } from "../utils/feedback/feedbackDataTransfer.js";
import { buildAiPromptLabels, formatFeedbackForAiPrompt } from "../utils/feedback/formatFeedbackForAiPrompt.js";
import { AskAiCopyDropdown } from "./AskAiCopyDropdown.js";
export function ThreadAskAiFloatingButton({ report, fields, messages, caseId }) {
    const copyPrompt = (options) => {
        const text = formatFeedbackForAiPrompt(report, fields, options, buildAiPromptLabels(messages));
        if (!text) {
            return Promise.reject(new Error("empty prompt"));
        }
        return copyTextToClipboard(text);
    };
    return (_jsx(AskAiCopyDropdown, { align: "right", menuClassName: "min-w-[188px]", items: [
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
        ], trigger: ({ open, copied, toggle }) => (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: toggle, "aria-expanded": open, "aria-haspopup": "menu", "aria-label": messages.marker.askAi.threadFloatingAriaLabel, title: copied ? messages.marker.askAi.copied : messages.marker.askAi.title, className: `flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--adaptive-black100)] text-[var(--adaptive-black700)] shadow-[var(--adaptive-popup-shadow)] transition-colors hover:bg-[var(--adaptive-black200)] hover:text-[var(--adaptive-black900)] ${open ? "text-[var(--adaptive-blue500)]" : ""}`, children: _jsx(AskAiIcon, { className: "h-[14px] w-[14px]" }) })) }));
}
//# sourceMappingURL=ThreadAskAiFloatingButton.js.map