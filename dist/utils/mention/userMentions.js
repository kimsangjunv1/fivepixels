function normalizeSearch(text) {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
}
export function findUserMentionCandidates(query, members, limit = 8) {
    const normalizedQuery = normalizeSearch(query);
    const seen = new Set();
    const matches = [];
    for (const member of members) {
        const id = member.id?.trim();
        const name = member.name?.trim();
        if (!id || !name || seen.has(id)) {
            continue;
        }
        seen.add(id);
        if (normalizedQuery && !normalizeSearch(name).includes(normalizedQuery) && !normalizeSearch(id).includes(normalizedQuery)) {
            continue;
        }
        matches.push({ id, name });
        if (matches.length >= limit) {
            break;
        }
    }
    return matches.sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
}
export function toStoredUserMention(candidate) {
    return { id: candidate.id, name: candidate.name };
}
export function resolveMentionMemberDirectory(authors, apiTeamMembers) {
    const byId = new Map();
    for (const member of [...authors, ...(apiTeamMembers ?? [])]) {
        const id = member.id?.trim();
        if (!id || byId.has(id)) {
            continue;
        }
        byId.set(id, member);
    }
    return Array.from(byId.values());
}
//# sourceMappingURL=userMentions.js.map