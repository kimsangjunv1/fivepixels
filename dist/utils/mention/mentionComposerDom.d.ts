import type { ElementMention } from "../../types/mention.js";
export declare const MENTION_CARET_GUARD = "\u200B";
export declare const MENTION_CHIP_CLASS = "mx-[1px] inline-flex items-center rounded-[6px] bg-[var(--adaptive-blue100)] px-[6px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-blue600)] align-baseline";
export type EditorCaretPoint = {
    node: Node;
    offset: number;
};
/**
 * Serialize contentEditable HTML into a plain mention draft.
 * Chrome/Safari often insert Enter as block <div>s instead of <br>, so block boundaries become `\n`.
 * A trailing/empty `<div><br></div>` is a block break only — the inner BR is a caret placeholder, not an extra line.
 */
export declare function serializeMentionEditor(root: HTMLElement, mentions: ElementMention[]): {
    message: string;
    mentions: ElementMention[];
};
/** Same rules as full serialize, but only content before the current caret. */
export declare function serializeMentionEditorBeforeCaret(root: HTMLElement, mentions: ElementMention[], caret: EditorCaretPoint | null): {
    message: string;
    mentions: ElementMention[];
} | null;
export declare function getEditorCaretPoint(root: HTMLElement): EditorCaretPoint | null;
export declare function getCaretClientRect(root: HTMLElement): DOMRect | null;
export declare function renderMentionEditorContent(root: HTMLElement, message: string, mentions: ElementMention[], chipClassName?: string): void;
export declare function placeCaretAfterMention(editor: HTMLElement, mentionId: string): void;
/** Remove the nearest mention chip behind a collapsed caret (Backspace). */
export declare function deleteMentionChipBeforeCaret(editor: HTMLElement, mentions: ElementMention[]): {
    message: string;
    mentions: ElementMention[];
} | null;
//# sourceMappingURL=mentionComposerDom.d.ts.map