import { useState } from "react";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import type { FeedbackImportMode } from "@/shared/utils/feedback/feedbackDataTransfer.js";
import { NoticeDialog } from "@/shared/components/ui/NoticeDialog.js";

type ReportImportConfirmDialogProps = {
    onApply: (mode: FeedbackImportMode) => void;
    onCancel: () => void;
    onBackupAndApply: (mode: FeedbackImportMode) => void;
};

export function ReportImportConfirmDialog({ onApply, onCancel, onBackupAndApply }: ReportImportConfirmDialogProps) {
    const { messages } = useReportPreferences();
    const [mode, setMode] = useState<FeedbackImportMode>("merge");
    const description = mode === "merge" ? messages.importConfirm.mergeDescription : messages.importConfirm.replaceDescription;

    return (
        <NoticeDialog
            title={messages.importConfirm.title}
            description={description}
            choices={[
                {
                    id: "merge",
                    label: messages.importConfirm.mergeMode,
                    pressed: mode === "merge",
                    onClick: () => setMode("merge"),
                },
                {
                    id: "replace",
                    label: messages.importConfirm.replaceMode,
                    pressed: mode === "replace",
                    onClick: () => setMode("replace"),
                },
            ]}
            footerDividerBeforeLast={2}
            actions={[
                {
                    id: "apply-direct",
                    label: messages.importConfirm.applyDirectly,
                    variant: "outline",
                    onClick: () => onApply(mode),
                },
                {
                    id: "cancel",
                    label: messages.common.cancel,
                    variant: "muted",
                    onClick: onCancel,
                },
                {
                    id: "backup-apply",
                    label: messages.importConfirm.backupAndApply,
                    variant: "primary",
                    onClick: () => onBackupAndApply(mode),
                },
            ]}
        />
    );
}
