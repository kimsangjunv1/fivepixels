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
//# sourceMappingURL=elementMentions.d.ts.map