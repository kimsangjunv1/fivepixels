import type { ReportFeedback, ReportIntegrationsConfig } from "../types/report.js";

export function hasGitHubIssue(report: ReportFeedback) {
    return Boolean(report.integrations?.github?.issue_url);
}

export function getGitHubIssueUrl(report: ReportFeedback) {
    return report.integrations?.github?.issue_url;
}

export function isGitHubIssueIntegrationEnabled(
    integrations: ReportIntegrationsConfig | undefined,
    onGitHubIssueCreate: ((feedback: ReportFeedback) => Promise<unknown>) | undefined,
) {
    if (!onGitHubIssueCreate) {
        return false;
    }

    if (integrations?.github?.enabled === false) {
        return false;
    }

    return true;
}
