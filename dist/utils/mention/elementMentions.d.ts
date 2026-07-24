import type { ElementMention, ElementMentionCandidate } from "../../types/mention.js";
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
};
export declare function parseMentionMessage(message: string, mentions?: ElementMention[]): MentionMessagePart[];
export declare function mentionMessageToPlainText(message: string, mentions?: ElementMention[]): string;
export declare function stripMentionTokensForEmptyCheck(message: string, mentions?: ElementMention[]): string;
export declare function toStoredMention(candidate: ElementMentionCandidate): ElementMention;
export declare function insertMentionToken(message: string, cursor: number, atStart: number, mention: ElementMention): {
    message: string;
    cursor: number;
};
/** Detect an in-progress `@query` at the end of caret text or serialized draft. */
export declare function getAtQuery(textBeforeCursor: string): {
    query: string;
    atOffsetInBefore: number;
} | null;
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
export declare function replaceActiveMentionQuery(message: string, query: string, mention: ElementMention, atOffsetInBefore?: number): string | null;
//# sourceMappingURL=elementMentions.d.ts.map