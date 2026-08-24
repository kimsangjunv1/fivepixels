import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useReportPreferences } from "../../providers/reportContext.js";
import { ReportPanelNoticeDialog } from "./ReportPanelNoticeDialog.js";
export function ReportImportConfirmDialog({ onApply, onCancel, onBackupAndApply }) {
    const { messages } = useReportPreferences();
    const [mode, setMode] = useState("merge");
    const description = mode === "merge" ? messages.importConfirm.mergeDescription : messages.importConfirm.replaceDescription;
    return (_jsx(ReportPanelNoticeDialog, { title: messages.importConfirm.title, description: description, choices: [
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
        ], footerDividerBeforeLast: 2, actions: [
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
        ] }));
}
//# sourceMappingURL=ReportImportConfirmDialog.js.map