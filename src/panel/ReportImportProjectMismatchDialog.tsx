import type { ReportProject } from "@/types/report.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { buildProjectComparisonLines } from "@/utils/feedback/feedbackTransferSchema.js";
import type { ResolvedReportProject } from "@/utils/report/reportProject.js";
import { NoticeDialog } from "@/components/ui/NoticeDialog.js";

type ReportImportProjectMismatchDialogProps = {
    currentProject: ResolvedReportProject;
    importedProject?: ReportProject;
    exportedAt?: string;
    onProceed: () => void;
    onCancel: () => void;
};

function formatExportedAt(value: string | undefined, noneLabel: string, locale: string) {
    if (!value) {
        return noneLabel;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(locale);
}

export function ReportImportProjectMismatchDialog({ currentProject, importedProject, exportedAt, onProceed, onCancel }: ReportImportProjectMismatchDialogProps) {
    const { locale, messages } = useReportPreferences();
    const comparisonLines = buildProjectComparisonLines(currentProject, importedProject);

    return (
        <NoticeDialog
            title={messages.importMismatch.title}
            description={messages.importMismatch.description}
            sectioned
            actions={[
                {
                    id: "cancel",
                    label: messages.common.cancel,
                    variant: "muted",
                    onClick: onCancel,
                },
                {
                    id: "proceed",
                    label: messages.common.proceed,
                    variant: "primary",
                    onClick: onProceed,
                },
            ]}
        >
            <section className="flex flex-col gap-[4px] p-[12px]">
                <p className="text-[12px] text-[var(--adaptive-black700)]">{messages.importMismatch.currentData}</p>
                <dl>
                    {comparisonLines.map((line) => (
                        <div
                            key={line.label}
                            className="grid grid-cols-[112px_1fr] gap-[8px] text-[12px]"
                        >
                            <p className="font-medium text-[var(--adaptive-black500)]">{line.label}</p>
                            <p className={`${line.differs ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black800)]"}`}>{line.current}</p>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="flex flex-col gap-[4px] p-[12px]">
                <p className="text-[12px] text-[var(--adaptive-black700)]">{messages.importMismatch.updatedData}</p>
                <dl>
                    {comparisonLines.map((line) => (
                        <div
                            key={line.label}
                            className="grid grid-cols-[112px_1fr] gap-[8px] text-[12px]"
                        >
                            <p className="font-medium text-[var(--adaptive-black500)]">{line.label}</p>
                            <p className={`${line.differs ? "text-rose-700" : "text-[var(--adaptive-black800)]"}`}>{line.imported}</p>
                        </div>
                    ))}

                    <div className="grid grid-cols-[112px_1fr] gap-[8px] text-[12px]">
                        <p className="font-medium text-[var(--adaptive-black500)]">{messages.importMismatch.exportedAtLabel}</p>
                        <p className="text-[var(--adaptive-black800)]">{formatExportedAt(exportedAt, messages.common.none, locale === "ko" ? "ko-KR" : "en-US")}</p>
                    </div>
                </dl>
            </section>
        </NoticeDialog>
    );
}
