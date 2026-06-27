import type { ReportFeedback, ReportGitHubConfig, ReportGitHubIntegrationMode, ReportGitHubIssueCreateResult, ReportReply, UpdateReportFeedbackPayload } from "../types/report.js";
export declare function isGitIssued(report: ReportFeedback): boolean;
export declare function hasGitHubIssue(report: ReportFeedback): boolean;
export declare function getGitHubIssueUrl(report: ReportFeedback): string | undefined;
export declare function resolveGitHubIntegrationModes(github: ReportGitHubConfig | undefined): ReportGitHubIntegrationMode[];
export declare function isGitHubIssueIntegrationEnabled(github: ReportGitHubConfig | undefined): boolean;
export declare function canCreateGitHubIssueFromList(github: ReportGitHubConfig | undefined): boolean;
export declare function canCreateGitHubIssueOnCreate(github: ReportGitHubConfig | undefined): boolean;
export declare function createGitIssuedReply(message: string): ReportReply;
export declare function isGitIssuedSystemReply(reply: ReportReply, report: ReportFeedback): boolean;
export declare function buildGitHubIssueStatusUpdate(report: ReportFeedback, result: ReportGitHubIssueCreateResult): UpdateReportFeedbackPayload;
export declare function buildGitHubIssueUpdate(report: ReportFeedback, result: ReportGitHubIssueCreateResult, gitIssuedMessage: string): UpdateReportFeedbackPayload;
//# sourceMappingURL=githubIntegration.d.ts.map