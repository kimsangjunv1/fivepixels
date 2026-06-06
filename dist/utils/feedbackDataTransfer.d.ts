import type { ReportFeedback, ReportProject } from "../types/report.js";
import { type FeedbackImportPayload } from "./feedbackTransferSchema.js";
export type FeedbackTransferScope = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};
export type { FeedbackImportPayload } from "./feedbackTransferSchema.js";
export { buildProjectComparisonLines, isImportProjectCompatible, parseFeedbackCommandJson, parseFeedbackImportJson, serializeFeedbackExport, serializeFeedbackItem, toReportProject, } from "./feedbackTransferSchema.js";
export type FeedbackDownloadResult = "saved" | "downloaded" | "cancelled" | "failed";
export declare function getFeedbackStorageKey({ projectId, environment, appVersion }: FeedbackTransferScope): string;
export declare function readAllFeedback({ projectId, environment, appVersion }: FeedbackTransferScope): ReportFeedback[];
export declare function writeAllFeedback(scope: FeedbackTransferScope, items: ReportFeedback[]): void;
export type FeedbackInsertResult = {
    inserted: number;
    replaced: number;
};
export type FeedbackInsertConflict = {
    id: string;
    existing: ReportFeedback;
    incoming: ReportFeedback;
};
export declare function findFeedbackInsertConflicts(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertConflict[];
export declare function insertFeedbackItems(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertResult;
export declare function upsertFeedbackItems(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertResult;
export declare function copyTextToClipboard(text: string): Promise<void>;
export declare function createFeedbackBackupFilename(projectId: string, environment?: string, appVersion?: string): string;
export declare function pickFeedbackJsonFile(): Promise<File | null>;
export declare function downloadFeedbackJson(filename: string, project: ReportProject, items: ReportFeedback[]): Promise<FeedbackDownloadResult>;
export declare function readFeedbackJsonFile(file: File): Promise<FeedbackImportPayload>;
//# sourceMappingURL=feedbackDataTransfer.d.ts.map