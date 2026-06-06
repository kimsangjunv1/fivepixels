import type { ReportProject } from "../../types/report.js";
import { buildProjectComparisonLines, formatProjectScopeValue, toReportProject } from "../../utils/feedbackTransferSchema.js";
import type { ResolvedReportProject } from "../../utils/reportProject.js";

type ReportImportProjectMismatchDialogProps = {
    currentProject: ResolvedReportProject;
    importedProject?: ReportProject;
    exportedAt?: string;
    onProceed: () => void;
    onCancel: () => void;
};

function formatExportedAt(value?: string) {
    if (!value) {
        return "(없음)";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

export function ReportImportProjectMismatchDialog({ currentProject, importedProject, exportedAt, onProceed, onCancel }: ReportImportProjectMismatchDialogProps) {
    const comparisonLines = buildProjectComparisonLines(currentProject, importedProject);
    const currentProjectLabel = formatProjectScopeValue(toReportProject(currentProject).id);

    return (
        <article className="bg-[var(--adaptive-grey100)]">
            <section className="flex flex-col gap-[4px] p-[16px]">
                <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">project와 version 이 기존과 다릅니다</h6>
                <p className="leading-[1.5] text-[var(--adaptive-black500)]">현재 앱의 project 설정과 import 파일의 project 정보를 비교해주세요. 진행을 선택하면 기존 import 확인 단계로 이동합니다.</p>
            </section>

            <section className="flex flex-col gap-[4px] p-[12px]">
                <p className="text-[12px] text-[var(--adaptive-black700)]">- 현재 데이터</p>
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
                <p className="text-[12px] text-[var(--adaptive-black700)]">+ 업데이트 될 데이터</p>
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
                        <p className="font-medium text-[var(--adaptive-black500)]">exportedAt</p>
                        <p className="text-[var(--adaptive-black800)]">{formatExportedAt(exportedAt)}</p>
                    </div>
                </dl>
            </section>

            <section className="flex items-center justify-end gap-[10px] p-[16px]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-[var(--adaptive-grey300)] p-[4px_8px] rounded-[8px] font-semibold text-[var(--adaptive-black700)] border border-transparent"
                >
                    취소
                </button>

                <button
                    type="button"
                    onClick={onProceed}
                    className="bg-[var(--adaptive-blue100)] p-[4px_8px] rounded-[8px] font-bold text-[var(--adaptive-blue500)] border border-transparent"
                >
                    진행
                </button>
            </section>
        </article>
    );
}
