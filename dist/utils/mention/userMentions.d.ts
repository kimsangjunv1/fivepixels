import type { UserMention, UserMentionCandidate } from "../../types/mention.js";
import type { ReportAuthor } from "../../types/report.js";
export declare function findUserMentionCandidates(query: string, members: ReportAuthor[], limit?: number): UserMentionCandidate[];
export declare function toStoredUserMention(candidate: UserMentionCandidate): UserMention;
export declare function resolveMentionMemberDirectory(authors: ReportAuthor[], apiTeamMembers: ReportAuthor[] | null): ReportAuthor[];
//# sourceMappingURL=userMentions.d.ts.map