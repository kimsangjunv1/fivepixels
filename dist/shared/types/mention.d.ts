import type { TargetSnapshot } from "../../shared/types/report-ui.js";
export type ElementMention = {
    id: string;
    label: string;
    targetSelector: string | null;
    reportId: string | null;
    suggestedReportId: string | null;
};
export type ElementMentionCandidate = ElementMention & {
    element: HTMLElement;
    snapshot: TargetSnapshot;
};
/** Team member / reviewer mention — distinct token namespace from element mentions. */
export type UserMention = {
    id: string;
    name: string;
};
export type UserMentionCandidate = UserMention;
export declare const MENTION_TOKEN_PATTERN: RegExp;
export declare const USER_MENTION_TOKEN_PATTERN: RegExp;
export declare function createMentionId(): string;
export declare function serializeMentionToken(mentionId: string): string;
export declare function serializeUserMentionToken(userId: string): string;
export declare function mentionPlainLabel(mention: Pick<ElementMention, "label">): string;
export declare function userMentionPlainLabel(mention: Pick<UserMention, "name">): string;
//# sourceMappingURL=mention.d.ts.map