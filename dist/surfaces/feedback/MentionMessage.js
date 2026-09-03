import { jsx as _jsx } from "react/jsx-runtime";
import { mentionPlainLabel, userMentionPlainLabel } from "../../shared/types/mention.js";
import { parseMentionMessage, resolveMentionElement, resolveMentionSnapshot } from "../../shared/utils/mention/elementMentions.js";
import { useReportSession } from "../../shared/providers/reportContext.js";
const MENTION_CHIP_CLASS = "mx-[1px] inline-flex cursor-pointer items-center rounded-[6px] bg-[var(--adaptive-blue100)] px-[6px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-blue600)] align-baseline transition-opacity hover:opacity-90";
const USER_MENTION_CHIP_CLASS = "mx-[1px] inline-flex items-center rounded-[6px] bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_14%,transparent)] px-[6px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-accent-coral)] align-baseline";
export function MentionMessage({ message, mentions = [], userMentions = [], className = "" }) {
    const { setMentionHighlightTarget } = useReportSession();
    const parts = parseMentionMessage(message, mentions, userMentions);
    if (mentions.length === 0 && userMentions.length === 0 && !message.includes("@{") && !message.includes("@u{")) {
        return _jsx("span", { className: className, children: message });
    }
    return (_jsx("span", { className: className, children: parts.map((part, index) => {
            if (part.type === "text") {
                return _jsx("span", { children: part.value }, `text-${index}`);
            }
            if (part.type === "user_mention") {
                return (_jsx("span", { className: USER_MENTION_CHIP_CLASS, children: userMentionPlainLabel(part.mention) }, `user-mention-${part.mention.id}-${index}`));
            }
            return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", className: MENTION_CHIP_CLASS, onMouseEnter: () => {
                    setMentionHighlightTarget(resolveMentionSnapshot(part.mention));
                }, onMouseLeave: () => {
                    setMentionHighlightTarget(null);
                }, onClick: () => {
                    const element = resolveMentionElement(part.mention);
                    setMentionHighlightTarget(resolveMentionSnapshot(part.mention));
                    element?.scrollIntoView({ block: "center", behavior: "smooth" });
                }, children: mentionPlainLabel(part.mention) }, `mention-${part.mention.id}-${index}`));
        }) }));
}
//# sourceMappingURL=MentionMessage.js.map