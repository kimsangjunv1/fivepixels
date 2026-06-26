import type { ReportAuthor, ReportIdentify, ReportTeam } from "@/types/report.js";

export type ResolvedReportTeam = {
    user?: ReportIdentify;
    reviewers: ReportAuthor[];
    requireReviewerKey: boolean;
};

export type ResolveReportTeamOptions = {
    team?: ReportTeam;
};

export function resolveReportTeam({ team }: ResolveReportTeamOptions): ResolvedReportTeam {
    return {
        user: team?.user,
        reviewers: team?.reviewers ?? [],
        requireReviewerKey: team?.requireReviewerKey ?? false,
    };
}
