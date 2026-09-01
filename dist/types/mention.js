export const MENTION_TOKEN_PATTERN = /@\{([A-Za-z0-9_-]+)\}/g;
export const USER_MENTION_TOKEN_PATTERN = /@u\{([A-Za-z0-9_-]+)\}/g;
export function createMentionId() {
    return `m_${Math.random().toString(36).slice(2, 10)}`;
}
export function serializeMentionToken(mentionId) {
    return `@{${mentionId}}`;
}
export function serializeUserMentionToken(userId) {
    return `@u{${userId}}`;
}
export function mentionPlainLabel(mention) {
    return `@${mention.label}`;
}
export function userMentionPlainLabel(mention) {
    return `@${mention.name}`;
}
//# sourceMappingURL=mention.js.map