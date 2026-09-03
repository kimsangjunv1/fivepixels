import type { ElementMention, UserMention } from "../types/mention.js";
import type { ReportAuthor } from "../types/report.js";
type MentionComposerInputProps = {
    value: string;
    mentions: ElementMention[];
    userMentions?: UserMention[];
    teamMembers?: ReportAuthor[];
    onChange: (next: {
        message: string;
        mentions: ElementMention[];
        userMentions: UserMention[];
    }) => void;
    placeholder: string;
    autoFocus?: boolean;
    onSubmitShortcut?: () => void;
    onMultilineChange?: (isMultiline: boolean) => void;
    reserveInlineStart?: number;
};
export declare function MentionComposerInput({ value, mentions, userMentions, teamMembers, onChange, placeholder, autoFocus, onSubmitShortcut, onMultilineChange, }: MentionComposerInputProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MentionComposerInput.d.ts.map