import type { ElementMention, UserMention } from "@/shared/types/mention.js";
import { mentionPlainLabel, userMentionPlainLabel } from "@/shared/types/mention.js";
import { parseMentionMessage, resolveMentionElement, resolveMentionSnapshot } from "@/shared/utils/mention/elementMentions.js";
import { useReportSession } from "@/shared/providers/reportContext.js";

type MentionMessageProps = {
    message: string;
    mentions?: ElementMention[];
    userMentions?: UserMention[];
    className?: string;
};

const MENTION_CHIP_CLASS =
    "mx-[1px] inline-flex cursor-pointer items-center rounded-[6px] bg-[var(--adaptive-blue100)] px-[6px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-blue600)] align-baseline transition-opacity hover:opacity-90";

const USER_MENTION_CHIP_CLASS =
    "mx-[1px] inline-flex items-center rounded-[6px] bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_14%,transparent)] px-[6px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-accent-coral)] align-baseline";

export function MentionMessage({ message, mentions = [], userMentions = [], className = "" }: MentionMessageProps) {
    const { setMentionHighlightTarget } = useReportSession();
    const parts = parseMentionMessage(message, mentions, userMentions);

    if (mentions.length === 0 && userMentions.length === 0 && !message.includes("@{") && !message.includes("@u{")) {
        return <span className={className}>{message}</span>;
    }

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.type === "text") {
                    return <span key={`text-${index}`}>{part.value}</span>;
                }

                if (part.type === "user_mention") {
                    return (
                        <span
                            key={`user-mention-${part.mention.id}-${index}`}
                            className={USER_MENTION_CHIP_CLASS}
                        >
                            {userMentionPlainLabel(part.mention)}
                        </span>
                    );
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
