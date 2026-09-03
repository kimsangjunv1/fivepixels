import type { ElementMention, UserMention } from "../../shared/types/mention.js";
type MentionMessageProps = {
    message: string;
    mentions?: ElementMention[];
    userMentions?: UserMention[];
    className?: string;
};
export declare function MentionMessage({ message, mentions, userMentions, className }: MentionMessageProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MentionMessage.d.ts.map