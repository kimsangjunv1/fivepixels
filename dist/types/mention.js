export const MENTION_TOKEN_PATTERN = /@\{([A-Za-z0-9_-]+)\}/g;
export function createMentionId() {
    return `m_${Math.random().toString(36).slice(2, 10)}`;
}
export function serializeMentionToken(mentionId) {
    return `@{${mentionId}}`;
}
export function mentionPlainLabel(mention) {
    return `@${mention.label}`;
}
//# sourceMappingURL=mention.js.map