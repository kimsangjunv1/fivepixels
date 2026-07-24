import type { FeedbackImportMode } from "../../utils/feedback/feedbackDataTransfer.js";
type ReportImportConfirmDialogProps = {
    onApply: (mode: FeedbackImportMode) => void;
    onCancel: () => void;
    onBackupAndApply: (mode: FeedbackImportMode) => void;
};
export declare function ReportImportConfirmDialog({ onApply, onCancel, onBackupAndApply }: ReportImportConfirmDialogProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ReportImportConfirmDialog.d.ts.map