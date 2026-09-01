import type { TargetSnapshot } from "@/types/report-ui.js";

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

export const MENTION_TOKEN_PATTERN = /@\{([A-Za-z0-9_-]+)\}/g;
export const USER_MENTION_TOKEN_PATTERN = /@u\{([A-Za-z0-9_-]+)\}/g;

export function createMentionId() {
    return `m_${Math.random().toString(36).slice(2, 10)}`;
}

export function serializeMentionToken(mentionId: string) {
    return `@{${mentionId}}`;
}

export function serializeUserMentionToken(userId: string) {
    return `@u{${userId}}`;
}

export function mentionPlainLabel(mention: Pick<ElementMention, "label">) {
    return `@${mention.label}`;
}

export function userMentionPlainLabel(mention: Pick<UserMention, "name">) {
    return `@${mention.name}`;
}
