import type { ReportAuthor, ReportIdentify, ReportTeam } from "../types/report.js";

export type ResolvedReportTeam = {
    user?: ReportIdentify;
    reviewers: ReportAuthor[];
};

export type ResolveReportTeamOptions = {
    team?: ReportTeam;
    /** @deprecated Use `team.user`. */
    identify?: ReportIdentify;
    /** @deprecated Use `team.reviewers`. */
    authors?: ReportAuthor[];
};

export function resolveReportTeam({ team, identify, authors }: ResolveReportTeamOptions): ResolvedReportTeam {
    return {
        user: team?.user ?? identify,
        reviewers: team?.reviewers ?? authors ?? [],
    };
}
