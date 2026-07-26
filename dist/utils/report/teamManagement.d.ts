import type { ReportAuthor, ReportAuthorRole, ReportTeamHandlers } from "../../types/report.js";
import type { PersistenceStatus } from "../../utils/shared/storage.js";
/** Map legacy `reviewer` (and unknown) to `member`. */
export declare function resolveAuthorRole(author: Pick<ReportAuthor, "role"> | null | undefined): ReportAuthorRole;
export declare function getAuthorRoleRank(role: ReportAuthorRole): number;
export declare function isReportAuthorAdmin(author: ReportAuthor | null | undefined): boolean;
export declare function isReportAuthorSubAdmin(author: ReportAuthor | null | undefined): boolean;
/** Settings → Team tab: admin and sub_admin only. */
export declare function canAccessTeamSettings(author: ReportAuthor | null | undefined): boolean;
/** Can perform any team write (approve / register / update) in API mode. */
export declare function canManageTeamMembers(author: ReportAuthor | null | undefined): boolean;
export declare function canViewTeamMember(viewer: ReportAuthor | null | undefined, target: ReportAuthor): boolean;
/** Same-rank peers are visible but not editable. Only strictly lower ranks. */
export declare function canEditTeamMember(actor: ReportAuthor | null | undefined, target: ReportAuthor): boolean;
export declare function canAssignTeamRole(actor: ReportAuthor | null | undefined, nextRole: ReportAuthorRole): boolean;
export declare function listAssignableRoles(actor: ReportAuthor | null | undefined): ReportAuthorRole[];
export declare function filterVisibleTeamMembers(viewer: ReportAuthor | null | undefined, members: ReportAuthor[]): ReportAuthor[];
export declare function isTeamWriteEnabled(persistenceStatus: PersistenceStatus): boolean;
export declare function hasTeamAdminHandlers(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean;
export declare function hasTeamRequestHandler(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean;
export declare function sortTeamReviewers(reviewers: ReportAuthor[]): ReportAuthor[];
//# sourceMappingURL=teamManagement.d.ts.map