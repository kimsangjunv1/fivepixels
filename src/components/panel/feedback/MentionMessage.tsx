import type { ElementMention } from "@/types/mention.js";
import { mentionPlainLabel } from "@/types/mention.js";
import { parseMentionMessage, resolveMentionElement, resolveMentionSnapshot } from "@/utils/mention/elementMentions.js";
import { useReportSession } from "@/providers/reportContext.js";

type MentionMessageProps = {
    message: string;
    mentions?: ElementMention[];
    className?: string;
};

const MENTION_CHIP_CLASS =
    "mx-[1px] inline-flex cursor-pointer items-center rounded-[6px] bg-[var(--adaptive-blue100)] px-[6px] py-[1px] text-[13px] font-semibold text-[var(--adaptive-blue600)] align-baseline transition-opacity hover:opacity-90";

export function MentionMessage({ message, mentions = [], className = "" }: MentionMessageProps) {
    const { setMentionHighlightTarget } = useReportSession();
    const parts = parseMentionMessage(message, mentions);

    if (mentions.length === 0 && !message.includes("@{")) {
        return <span className={className}>{message}</span>;
    }

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.type === "text") {
                    return <span key={`text-${index}`}>{part.value}</span>;
                }

                return (
                    <button
                        key={`mention-${part.mention.id}-${index}`}
                        type="button"
                        data-fivepixels-interactive=""
                        className={MENTION_CHIP_CLASS}
                        onMouseEnter={() => {
                            setMentionHighlightTarget(resolveMentionSnapshot(part.mention));
                        }}
                        onMouseLeave={() => {
                            setMentionHighlightTarget(null);
                        }}
                        onClick={() => {
                            const element = resolveMentionElement(part.mention);
                            setMentionHighlightTarget(resolveMentionSnapshot(part.mention));
                            element?.scrollIntoView({ block: "center", behavior: "smooth" });
                        }}
                    >
                        {mentionPlainLabel(part.mention)}
                    </button>
                );
            })}
        </span>
    );
}
