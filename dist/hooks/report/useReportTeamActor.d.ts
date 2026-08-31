import type { ReportAuthor } from "../../types/report.js";
import type { PersistenceStatus } from "../../utils/shared/storage.js";
type UseReportTeamActorParams = {
    authorizedAuthorId: string | null;
    teamReviewers: ReportAuthor[];
    persistenceMode: PersistenceStatus["mode"];
    onListReviewers?: () => Promise<ReportAuthor[]>;
};
export declare function useReportTeamActor({ authorizedAuthorId, teamReviewers, persistenceMode, onListReviewers }: UseReportTeamActorParams): {
    teamActor: ReportAuthor | null;
    apiTeamMembers: ReportAuthor[] | null;
    apiTeamMembersLoading: boolean;
    refreshTeamMembers: () => Promise<ReportAuthor[] | null>;
};
export {};
//# sourceMappingURL=useReportTeamActor.d.ts.map