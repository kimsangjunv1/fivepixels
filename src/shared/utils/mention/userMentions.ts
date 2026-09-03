import type { UserMention, UserMentionCandidate } from "@/shared/types/mention.js";
import type { ReportAuthor } from "@/shared/types/report.js";

function normalizeSearch(text: string) {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function findUserMentionCandidates(query: string, members: ReportAuthor[], limit = 8): UserMentionCandidate[] {
    const normalizedQuery = normalizeSearch(query);
    const seen = new Set<string>();
    const matches: UserMentionCandidate[] = [];

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

export function toStoredUserMention(candidate: UserMentionCandidate): UserMention {
    return { id: candidate.id, name: candidate.name };
}

export function resolveMentionMemberDirectory(authors: ReportAuthor[], apiTeamMembers: ReportAuthor[] | null): ReportAuthor[] {
    const byId = new Map<string, ReportAuthor>();

    for (const member of [...authors, ...(apiTeamMembers ?? [])]) {
        const id = member.id?.trim();

        if (!id || byId.has(id)) {
            continue;
        }

        byId.set(id, member);
    }

    return Array.from(byId.values());
}
