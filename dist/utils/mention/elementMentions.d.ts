import type { ElementMention, ElementMentionCandidate, UserMention } from "../../types/mention.js";
import type { TargetSnapshot } from "../../types/report-ui.js";
export declare function buildElementMentionFromElement(element: HTMLElement, labelOverride?: string): ElementMentionCandidate | null;
export declare function findElementMentionCandidates(query: string, limit?: number): ElementMentionCandidate[];
export declare function resolveMentionElement(mention: ElementMention): HTMLElement | null;
export declare function resolveMentionSnapshot(mention: ElementMention): TargetSnapshot | null;
export type MentionMessagePart = {
    type: "text";
    value: string;
} | {
    type: "mention";
    mention: ElementMention;
} | {
    type: "user_mention";
    mention: UserMention;
};
export declare function parseMentionMessage(message: string, mentions?: ElementMention[], userMentions?: UserMention[]): MentionMessagePart[];
export declare function mentionMessageToPlainText(message: string, mentions?: ElementMention[], userMentions?: UserMention[]): string;
export declare function stripMentionTokensForEmptyCheck(message: string, mentions?: ElementMention[], userMentions?: UserMention[]): string;
export declare function toStoredMention(candidate: ElementMentionCandidate): ElementMention;
export declare function insertMentionToken(message: string, cursor: number, atStart: number, mention: ElementMention): {
    message: string;
    cursor: number;
};
/**
 * Detect an in-progress `@query` at the end of caret text or serialized draft.
 * Single spaces are allowed so multi-word labels (e.g. "Staged feedback") can be typed.
 * Two or more consecutive spaces end the mention query (caller should dismiss the menu).
 */
export declare function getAtQuery(textBeforeCursor: string): {
    query: string;
    atOffsetInBefore: number;
} | null;
/** True when the active query already ends with a space (next Space should dismiss). */
export declare function mentionQueryEndsWithSpace(query: string): boolean;
/**
 * Resolve the active mention query using caret text when available,
 * otherwise fall back to the serialized editor message (safe with chips / shadow DOM).
 */
export declare function resolveActiveMentionQuery(options: {
    textBeforeCaret?: string | null;
    serializedMessage?: string | null;
}): {
    query: string;
    atOffsetInBefore: number;
} | null;
export declare function replaceActiveMentionQuery(message: string, query: string, mentionOrToken: ElementMention | string, atOffsetInBefore?: number): string | null;
export declare function replaceActiveUserMentionQuery(message: string, query: string, mention: UserMention, atOffsetInBefore?: number): string | null;
//# sourceMappingURL=elementMentions.d.ts.map