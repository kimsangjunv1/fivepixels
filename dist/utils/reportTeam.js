export function resolveReportTeam({ team, identify, authors }) {
    return {
        user: team?.user ?? identify,
        reviewers: team?.reviewers ?? authors ?? [],
        requireReviewerKey: team?.requireReviewerKey ?? false,
    };
}
//# sourceMappingURL=reportTeam.js.map