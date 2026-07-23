import type { ReportFeedback, ReportProject } from "../../types/report.js";
import { type FeedbackMergeStats } from "./feedbackImportMerge.js";
import { type FeedbackImportPayload } from "./feedbackTransferSchema.js";
export type FeedbackTransferScope = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};
export type FeedbackImportMode = "merge" | "replace";
export type { FeedbackImportPayload } from "./feedbackTransferSchema.js";
export { buildProjectComparisonLines, isImportProjectCompatible, parseFeedbackCommandJson, parseFeedbackImportJson, serializeFeedbackExport, serializeFeedbackItem, toReportProject, } from "./feedbackTransferSchema.js";
export { mergeFeedbackCollections, mergeFeedbackItem, mergeReplyCollections } from "./feedbackImportMerge.js";
export type { FeedbackMergeResult, FeedbackMergeStats } from "./feedbackImportMerge.js";
export type FeedbackDownloadResult = "saved" | "downloaded" | "cancelled" | "failed";
export declare function getFeedbackStorageKey({ projectId, environment, appVersion }: FeedbackTransferScope): string;
export declare function readAllFeedback({ projectId, environment, appVersion }: FeedbackTransferScope): ReportFeedback[];
export declare function writeAllFeedback(scope: FeedbackTransferScope, items: ReportFeedback[]): void;
export type FeedbackInsertResult = FeedbackMergeStats & {
    /** @deprecated Prefer `updated`. Kept for command success message compatibility. */
    replaced: number;
};
export type FeedbackInsertConflict = {
    id: string;
    existing: ReportFeedback;
    incoming: ReportFeedback;
};
export declare function findFeedbackInsertConflicts(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertConflict[];
export declare function insertFeedbackItems(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertResult;
/** Upsert by id while merging replies so local-only replies are preserved. */
export declare function upsertFeedbackItems(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertResult;
/** Apply an import payload with merge (default) or full replace. */
export declare function applyFeedbackImport(scope: FeedbackTransferScope, incoming: ReportFeedback[], mode?: FeedbackImportMode): FeedbackInsertResult;
export declare function copyTextToClipboard(text: string): Promise<void>;
export declare function createFeedbackBackupFilename(projectId: string, environment?: string, appVersion?: string): string;
export declare function pickFeedbackJsonFile(): Promise<File | null>;
export declare function downloadFeedbackJson(filename: string, project: ReportProject, items: ReportFeedback[]): Promise<FeedbackDownloadResult>;
export declare function readFeedbackJsonFile(file: File): Promise<FeedbackImportPayload>;
export declare function createPersonalKeyBackupFilename(projectId: string, environment?: string, appVersion?: string): string;
export declare function downloadPersonalKeyBackup(filename: string, key: string): Promise<FeedbackDownloadResult>;
export declare function isPersonalKeyFile(file: File): boolean;
export declare function readPersonalKeyFile(file: File): Promise<string>;
//# sourceMappingURL=feedbackDataTransfer.d.ts.map