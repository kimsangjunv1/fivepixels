import { createReplyId } from "./format.js";
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
export function createGitIssuedReply(message) {
    return {
        id: createReplyId(),
        message,
        created_at: new Date().toISOString(),
        status: "suggested",
        author_type: "system",
    };
}
export function isGitIssuedSystemReply(reply, report) {
    return reply.author_type === "system" && isGitIssued(report);
}
export function buildGitHubIssueUpdate(report, result, gitIssuedMessage) {
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
        replies: [...report.replies, createGitIssuedReply(gitIssuedMessage)],
    };
}
//# sourceMappingURL=githubIntegration.js.map