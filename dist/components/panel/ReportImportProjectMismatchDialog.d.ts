import type { ReportProject } from "../../types/report.js";
import type { ResolvedReportProject } from "../../utils/reportProject.js";
type ReportImportProjectMismatchDialogProps = {
    currentProject: ResolvedReportProject;
    importedProject?: ReportProject;
    exportedAt?: string;
    onProceed: () => void;
    onCancel: () => void;
};
export declare function ReportImportProjectMismatchDialog({ currentProject, importedProject, exportedAt, onProceed, onCancel, }: ReportImportProjectMismatchDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ReportImportProjectMismatchDialog.d.ts.map