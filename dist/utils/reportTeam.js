export function resolveReportTeam({ team, identify, authors }) {
    return {
        user: team?.user ?? identify,
        reviewers: team?.reviewers ?? authors ?? [],
    };
}
//# sourceMappingURL=reportTeam.js.map