import type { ElementMention } from "../../../types/mention.js";
type MentionComposerInputProps = {
    value: string;
    mentions: ElementMention[];
    onChange: (next: {
        message: string;
        mentions: ElementMention[];
    }) => void;
    placeholder: string;
    autoFocus?: boolean;
    onSubmitShortcut?: () => void;
    onMultilineChange?: (isMultiline: boolean) => void;
    reserveInlineStart?: number;
};
export declare function MentionComposerInput({ value, mentions, onChange, placeholder, autoFocus, onSubmitShortcut, onMultilineChange, reserveInlineStart, }: MentionComposerInputProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MentionComposerInput.d.ts.map