import type { ReportFeedback, ReportProject } from "../types/report.js";
import { type FeedbackImportPayload } from "./feedbackTransferSchema.js";
export type FeedbackTransferScope = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};
export type { FeedbackImportPayload } from "./feedbackTransferSchema.js";
export { buildProjectComparisonLines, isImportProjectCompatible, parseFeedbackImportJson, serializeFeedbackExport, toReportProject, } from "./feedbackTransferSchema.js";
export type FeedbackDownloadResult = "saved" | "downloaded" | "cancelled" | "failed";
export declare function getFeedbackStorageKey({ projectId, environment, appVersion }: FeedbackTransferScope): string;
export declare function readAllFeedback({ projectId, environment, appVersion }: FeedbackTransferScope): ReportFeedback[];
export declare function writeAllFeedback(scope: FeedbackTransferScope, items: ReportFeedback[]): void;
export declare function createFeedbackBackupFilename(projectId: string, environment?: string, appVersion?: string): string;
export declare function pickFeedbackJsonFile(): Promise<File | null>;
export declare function downloadFeedbackJson(filename: string, project: ReportProject, items: ReportFeedback[]): Promise<FeedbackDownloadResult>;
export declare function readFeedbackJsonFile(file: File): Promise<FeedbackImportPayload>;
//# sourceMappingURL=feedbackDataTransfer.d.ts.map