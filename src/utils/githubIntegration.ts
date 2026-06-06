import type {
    ReportFeedback,
    ReportGitHubConfig,
    ReportGitHubIntegrationMode,
    ReportGitHubIssueCreateResult,
    ReportReply,
    UpdateReportFeedbackPayload,
} from "../types/report.js";
import { createReplyId } from "./format.js";

const DEFAULT_GITHUB_MODES: ReportGitHubIntegrationMode[] = ["from-list"];

export function isGitIssued(report: ReportFeedback) {
    return report.status === "git_issued";
}

export function hasGitHubIssue(report: ReportFeedback) {
    return isGitIssued(report);
}

export function getGitHubIssueUrl(report: ReportFeedback) {
    return report.integrations?.github?.issue_url;
}

export function resolveGitHubIntegrationModes(github: ReportGitHubConfig | undefined) {
    return github?.modes ?? DEFAULT_GITHUB_MODES;
}

export function isGitHubIssueIntegrationEnabled(github: ReportGitHubConfig | undefined) {
    if (!github?.onCreate) {
        return false;
    }

    if (github.enabled === false) {
        return false;
    }

    return true;
}

export function canCreateGitHubIssueFromList(github: ReportGitHubConfig | undefined) {
    return isGitHubIssueIntegrationEnabled(github) && resolveGitHubIntegrationModes(github).includes("from-list");
}

export function canCreateGitHubIssueOnCreate(github: ReportGitHubConfig | undefined) {
    return isGitHubIssueIntegrationEnabled(github) && resolveGitHubIntegrationModes(github).includes("on-create");
}

export function createGitIssuedReply(message: string): ReportReply {
    return {
        id: createReplyId(),
        message,
        created_at: new Date().toISOString(),
        status: "suggested",
        author_type: "system",
    };
}

export function isGitIssuedSystemReply(reply: ReportReply, report: ReportFeedback) {
    return reply.author_type === "system" && isGitIssued(report);
}

export function buildGitHubIssueUpdate(report: ReportFeedback, result: ReportGitHubIssueCreateResult, gitIssuedMessage: string): UpdateReportFeedbackPayload {
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
