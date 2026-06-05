import type { ReportFeedback } from "../types/report.js";
export type FeedbackTransferScope = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};
export type FeedbackDownloadResult = "saved" | "downloaded" | "cancelled" | "failed";
export declare function getFeedbackStorageKey({ projectId, environment, appVersion }: FeedbackTransferScope): string;
export declare function readAllFeedback({ projectId, environment, appVersion }: FeedbackTransferScope): ReportFeedback[];
export declare function writeAllFeedback(scope: FeedbackTransferScope, items: ReportFeedback[]): void;
export declare function parseFeedbackImportJson(raw: string): ReportFeedback[];
export declare function createFeedbackBackupFilename(projectId: string, environment?: string, appVersion?: string): string;
export declare function pickFeedbackJsonFile(): Promise<File | null>;
export declare function downloadFeedbackJson(filename: string, items: ReportFeedback[]): Promise<FeedbackDownloadResult>;
export declare function readFeedbackJsonFile(file: File): Promise<ReportFeedback[]>;
//# sourceMappingURL=feedbackDataTransfer.d.ts.map