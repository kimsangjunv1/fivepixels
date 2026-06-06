export function hasGitHubIssue(report) {
    return Boolean(report.integrations?.github?.issue_url);
}
export function getGitHubIssueUrl(report) {
    return report.integrations?.github?.issue_url;
}
export function isGitHubIssueIntegrationEnabled(integrations, onGitHubIssueCreate) {
    if (!onGitHubIssueCreate) {
        return false;
    }
    if (integrations?.github?.enabled === false) {
        return false;
    }
    return true;
}
//# sourceMappingURL=githubIntegration.js.map