import { type DragEvent } from "react";
import { type FeedbackImportPayload, type FeedbackInsertConflict } from "../utils/feedbackDataTransfer.js";
export type FeedbackTransferScope = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};
export type ImportStep = "none" | "project-mismatch" | "confirm";
export type CommandStep = "none" | "replace-confirm";
type UsePanelFeedbackTransferOptions = {
    transferScope: FeedbackTransferScope;
    canTransferFeedback: boolean;
    setErrorMessage: (message: string) => void;
    refetch: () => Promise<unknown>;
    openPanelTab: (tab: "command") => void;
    onMoreMenuClose?: () => void;
    isRecording: boolean;
};
export declare function usePanelFeedbackTransfer({ transferScope, canTransferFeedback, setErrorMessage, refetch, openPanelTab, onMoreMenuClose, isRecording, }: UsePanelFeedbackTransferOptions): {
    isDragOver: boolean;
    pendingImport: FeedbackImportPayload | null;
    importStep: ImportStep;
    pendingCommand: FeedbackImportPayload | null;
    commandConflicts: FeedbackInsertConflict[];
    commandStep: CommandStep;
    commandNotice: {
        message: string;
        isError: boolean;
    } | null;
    setCommandNotice: import("react").Dispatch<import("react").SetStateAction<{
        message: string;
        isError: boolean;
    } | null>>;
    handleExport: () => void;
    handleImportFromMenu: () => void;
    handleOpenCommand: () => void;
    handleCloseCommand: () => void;
    handleCommandExecute: (raw: string) => Promise<{
        status: "pending";
        message?: undefined;
    } | {
        status: "success";
        message: string;
    }>;
    handleCancelCommandReplace: () => void;
    handleConfirmCommandReplace: () => void;
    handleCancelImport: () => void;
    handleProceedImportAfterMismatch: () => void;
    handleApplyImport: () => void;
    handleBackupAndApplyImport: () => void;
    handleDragEnter: (event: DragEvent<HTMLDivElement>) => void;
    handleDragLeave: (event: DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: DragEvent<HTMLDivElement>) => void;
    handleDrop: (event: DragEvent<HTMLDivElement>) => void;
};
export {};
//# sourceMappingURL=usePanelFeedbackTransfer.d.ts.map