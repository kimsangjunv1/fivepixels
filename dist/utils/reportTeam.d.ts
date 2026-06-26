import type { ReportAuthor, ReportIdentify, ReportTeam } from "@/types/report.js";
export type ResolvedReportTeam = {
    user?: ReportIdentify;
    reviewers: ReportAuthor[];
    requireReviewerKey: boolean;
};
export type ResolveReportTeamOptions = {
    team?: ReportTeam;
};
export declare function resolveReportTeam({ team }: ResolveReportTeamOptions): ResolvedReportTeam;
//# sourceMappingURL=reportTeam.d.ts.map