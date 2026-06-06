import type { ReportFeedback, ReportGitHubConfig, ReportGitHubIntegrationMode, ReportGitHubIssueCreateResult, UpdateReportFeedbackPayload } from "../types/report.js";
export declare function isGitIssued(report: ReportFeedback): boolean;
export declare function hasGitHubIssue(report: ReportFeedback): boolean;
export declare function getGitHubIssueUrl(report: ReportFeedback): string | undefined;
export declare function resolveGitHubIntegrationModes(github: ReportGitHubConfig | undefined): ReportGitHubIntegrationMode[];
export declare function isGitHubIssueIntegrationEnabled(github: ReportGitHubConfig | undefined): boolean;
export declare function canCreateGitHubIssueFromList(github: ReportGitHubConfig | undefined): boolean;
export declare function canCreateGitHubIssueOnCreate(github: ReportGitHubConfig | undefined): boolean;
export declare function buildGitHubIssueUpdate(report: ReportFeedback, result: ReportGitHubIssueCreateResult): UpdateReportFeedbackPayload;
//# sourceMappingURL=githubIntegration.d.ts.map