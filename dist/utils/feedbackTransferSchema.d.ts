import type { ReportFeedback, ReportProject } from "../types/report.js";
import type { ResolvedReportProject } from "./reportProject.js";
export declare const FEEDBACK_TRANSFER_SCHEMA_VERSION = 1;
export type FeedbackExportPayload = {
    schemaVersion: typeof FEEDBACK_TRANSFER_SCHEMA_VERSION;
    project: ReportProject;
    exportedAt: string;
    items: ReportFeedback[];
};
export type FeedbackStorageEnvelope = {
    project: ReportProject;
    updatedAt: string;
    items: ReportFeedback[];
};
export type FeedbackImportPayload = {
    items: ReportFeedback[];
    project?: ReportProject;
    exportedAt?: string;
};
export declare function normalizeReportProject(value: unknown): ReportProject | undefined;
export declare function toReportProject({ projectId, environment, appVersion }: ResolvedReportProject): ReportProject;
export declare function formatProjectScopeValue(value?: string): string;
export type ProjectComparisonLine = {
    label: string;
    current: string;
    imported: string;
    differs: boolean;
};
export declare function buildProjectComparisonLines(current: ResolvedReportProject, imported?: ReportProject): ProjectComparisonLine[];
export declare function isImportProjectCompatible(current: ResolvedReportProject, imported?: ReportProject): boolean;
export declare function serializeFeedbackExport(project: ReportProject, items: ReportFeedback[], exportedAt?: string): string;
export declare function serializeFeedbackStorageEnvelope(project: ReportProject, items: ReportFeedback[], updatedAt?: string): string;
export declare function parseFeedbackStorageEnvelope(raw: string): FeedbackStorageEnvelope | null;
export declare function serializeFeedbackItem(item: ReportFeedback): string;
export declare function parseFeedbackCommandJson(raw: string): FeedbackImportPayload;
export declare function parseFeedbackImportJson(raw: string): FeedbackImportPayload;
//# sourceMappingURL=feedbackTransferSchema.d.ts.map