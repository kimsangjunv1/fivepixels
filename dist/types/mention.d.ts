import type { TargetSnapshot } from "../types/report-ui.js";
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
export declare const MENTION_TOKEN_PATTERN: RegExp;
export declare function createMentionId(): string;
export declare function serializeMentionToken(mentionId: string): string;
export declare function mentionPlainLabel(mention: Pick<ElementMention, "label">): string;
//# sourceMappingURL=mention.d.ts.map