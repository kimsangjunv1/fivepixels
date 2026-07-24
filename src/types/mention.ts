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

export const MENTION_TOKEN_PATTERN = /@\{([A-Za-z0-9_-]+)\}/g;

export function createMentionId() {
    return `m_${Math.random().toString(36).slice(2, 10)}`;
}

export function serializeMentionToken(mentionId: string) {
    return `@{${mentionId}}`;
}

export function mentionPlainLabel(mention: Pick<ElementMention, "label">) {
    return `@${mention.label}`;
}
