import type { ReportAuthor, ReportIdentify, ReportTeam } from "../types/report.js";
export type ResolvedReportTeam = {
    user?: ReportIdentify;
    reviewers: ReportAuthor[];
    requireReviewerKey: boolean;
};
export type ResolveReportTeamOptions = {
    team?: ReportTeam;
    /** @deprecated Use `team.user`. */
    identify?: ReportIdentify;
    /** @deprecated Use `team.reviewers`. */
    authors?: ReportAuthor[];
};
export declare function resolveReportTeam({ team, identify, authors }: ResolveReportTeamOptions): ResolvedReportTeam;
//# sourceMappingURL=reportTeam.d.ts.map