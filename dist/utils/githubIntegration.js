const DEFAULT_GITHUB_MODES = ["from-list"];
export function isGitIssued(report) {
    return report.status === "git_issued";
}
export function hasGitHubIssue(report) {
    return isGitIssued(report);
}
export function getGitHubIssueUrl(report) {
    return report.integrations?.github?.issue_url;
}
export function resolveGitHubIntegrationModes(github) {
    return github?.modes ?? DEFAULT_GITHUB_MODES;
}
export function isGitHubIssueIntegrationEnabled(github) {
    if (!github?.onCreate) {
        return false;
    }
    if (github.enabled === false) {
        return false;
    }
    return true;
}
export function canCreateGitHubIssueFromList(github) {
    return isGitHubIssueIntegrationEnabled(github) && resolveGitHubIntegrationModes(github).includes("from-list");
}
export function canCreateGitHubIssueOnCreate(github) {
    return isGitHubIssueIntegrationEnabled(github) && resolveGitHubIntegrationModes(github).includes("on-create");
}
export function buildGitHubIssueUpdate(report, result) {
    return {
        status: "git_issued",
        integrations: {
            ...report.integrations,
            github: {
                issue_number: result.issueNumber,
                issue_url: result.issueUrl,
                issued_at: new Date().toISOString(),
            },
        },
    };
}
//# sourceMappingURL=githubIntegration.js.map