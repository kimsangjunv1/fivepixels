import type { ReportAuthor, ReportAuthorRole, ReportTeamHandlers } from "../../types/report.js";
import type { PersistenceStatus } from "../../utils/shared/storage.js";
export declare function isReportAuthorAdmin(author: ReportAuthor | null | undefined): boolean;
export declare function resolveAuthorRole(author: ReportAuthor): ReportAuthorRole;
export declare function isTeamWriteEnabled(persistenceStatus: PersistenceStatus): boolean;
export declare function hasTeamAdminHandlers(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean;
export declare function hasTeamRequestHandler(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean;
export declare function sortTeamReviewers(reviewers: ReportAuthor[]): ReportAuthor[];
//# sourceMappingURL=teamManagement.d.ts.map