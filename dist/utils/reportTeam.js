export function resolveReportTeam({ team }) {
    return {
        user: team?.user,
        reviewers: team?.reviewers ?? [],
        requireReviewerKey: team?.requireReviewerKey ?? false,
    };
}
//# sourceMappingURL=reportTeam.js.map