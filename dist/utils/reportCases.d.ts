import type { ReportCase, ReportFeedback, ReportStatus } from "../types/report.js";
export declare function createCaseId(): string;
export declare function createReportCase(text: string, overrides?: Partial<Omit<ReportCase, "text">>): ReportCase;
export declare function getReportCases(report: Pick<ReportFeedback, "cases">): ReportCase[];
export declare function getOpenCases(report: Pick<ReportFeedback, "cases">): ReportCase[];
export declare function getResolvedCases(report: Pick<ReportFeedback, "cases">): ReportCase[];
export declare function getResolvedCaseCount(report: Pick<ReportFeedback, "cases">): number;
export declare function allCasesResolved(report: Pick<ReportFeedback, "cases">): boolean;
export declare function hasOpenCases(report: Pick<ReportFeedback, "cases">): boolean;
export declare function resolveCases(cases: ReportCase[], caseIds: string[], resolvedAt?: string): ReportCase[];
export declare function syncIssueStatusFromCases(report: Pick<ReportFeedback, "cases" | "status">): ReportStatus;
export declare function applyCaseStatusSync(report: ReportFeedback): ReportFeedback;
export declare function getIssueSummary(report: Pick<ReportFeedback, "cases">, options?: {
    summaryMore?: (count: number) => string;
}): string;
export declare function shouldShowCaseProgress(report: Pick<ReportFeedback, "cases">): boolean;
export declare function getIssueProgressLabel(report: Pick<ReportFeedback, "cases">): string;
export declare function casesToSearchText(cases: ReportCase[]): string;
export declare function normalizeReportCase(value: unknown, fallbackTimestamp: string): ReportCase | null;
export declare function normalizeReportCases(value: unknown, fallbackTimestamp: string): ReportCase[];
export declare function normalizeReplyCaseIds(value: unknown): string[];
export declare function normalizeFeedbackCases(item: Pick<ReportFeedback, "cases" | "created_at"> & {
    message?: string;
}): ReportCase[];
type CaseValidationMessages = {
    casesRequired: string;
    caseTextRequired: (index: number) => string;
};
export declare function canEditReportCases(report: Pick<ReportFeedback, "status">): boolean;
export declare function getOpenCaseIds(report: Pick<ReportFeedback, "cases">): string[];
export declare function isValidCaseSelection(report: Pick<ReportFeedback, "cases">, selectedCaseIds: string[]): boolean;
export declare function getCaseLabels(report: Pick<ReportFeedback, "cases">, caseIds: string[]): string[];
export declare function buildResolvedCasesUpdate(report: ReportFeedback, caseIds: string[]): ReportCase[];
export declare function validateCasesForSubmit(cases: Array<Pick<ReportCase, "text">>, messages: CaseValidationMessages): string;
export {};
//# sourceMappingURL=reportCases.d.ts.map