import type { ReportProject } from "../../types/report.js";
import { useReport } from "../../providers/reportContext.js";
import { buildProjectComparisonLines } from "../../utils/feedbackTransferSchema.js";
import type { ResolvedReportProject } from "../../utils/reportProject.js";

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
    const { locale, messages } = useReport();
    const comparisonLines = buildProjectComparisonLines(currentProject, importedProject);

    return (
        <article className="bg-[var(--adaptive-grey100)]">
            <section className="flex flex-col gap-[4px] p-[16px]">
                <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{messages.importMismatch.title}</h6>
                <p className="leading-[1.5] text-[var(--adaptive-black500)]">{messages.importMismatch.description}</p>
            </section>

            <section className="flex flex-col gap-[4px] p-[12px]">
                <p className="text-[12px] text-[var(--adaptive-black700)]">{messages.importMismatch.currentData}</p>
                <dl className="">
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
                <dl className="">
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

            <section className="flex items-center justify-end gap-[10px] p-[16px]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-[var(--adaptive-grey300)] p-[4px_8px] rounded-[8px] font-semibold text-[var(--adaptive-black700)] border border-transparent"
                >
                    {messages.common.cancel}
                </button>

                <button
                    type="button"
                    onClick={onProceed}
                    className="bg-[var(--adaptive-blue100)] p-[4px_8px] rounded-[8px] font-bold text-[var(--adaptive-blue500)] border border-transparent"
                >
                    {messages.common.proceed}
                </button>
            </section>
        </article>
    );
}
