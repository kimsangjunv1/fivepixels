import type { ReportFeedback, ReportIntegrationsConfig } from "../types/report.js";
export declare function hasGitHubIssue(report: ReportFeedback): boolean;
export declare function getGitHubIssueUrl(report: ReportFeedback): string | undefined;
export declare function isGitHubIssueIntegrationEnabled(integrations: ReportIntegrationsConfig | undefined, onGitHubIssueCreate: ((feedback: ReportFeedback) => Promise<unknown>) | undefined): boolean;
//# sourceMappingURL=githubIntegration.d.ts.map