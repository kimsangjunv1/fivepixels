import type { FeedbackInsertConflict } from "@/utils/feedback/feedbackDataTransfer.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { MOTION } from "@/constants/motionClasses.js";
import { getIssueSummary } from "@/utils/report/reportCases.js";

type ReportCommandReplaceConfirmDialogProps = {
    conflicts: FeedbackInsertConflict[];
    onConfirm: () => void;
    onCancel: () => void;
};

export function ReportCommandReplaceConfirmDialog({ conflicts, onConfirm, onCancel }: ReportCommandReplaceConfirmDialogProps) {
    const { messages } = useReportPreferences();

    return (
        <article className={`bg-[var(--adaptive-grey100)] ${MOTION.dialogIn}`}>
            <section className="flex flex-col gap-[4px] p-[16px]">
                <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{messages.commandReplace.title}</h6>
                <p className="leading-[1.5] text-[var(--adaptive-black500)]">{messages.commandReplace.description}</p>
            </section>

            {conflicts.map((conflict) => (
                <section
                    key={conflict.id}
                    className="border-t border-[var(--adaptive-black200)] p-[12px]"
                >
                    <dl className="mb-[8px] grid grid-cols-[72px_1fr] gap-[8px] text-[12px]">
                        <dt className="font-medium text-[var(--adaptive-black500)]">{messages.commandReplace.idLabel}</dt>
                        <dd className="break-all text-[var(--adaptive-black800)]">{conflict.id}</dd>
                        <dt className="font-medium text-[var(--adaptive-black500)]">{messages.commandReplace.reportIdLabel}</dt>
                        <dd className="break-all text-[var(--adaptive-black800)]">{conflict.existing.report_id}</dd>
                    </dl>

                    <section className="flex flex-col gap-[4px]">
                        <p className="text-[12px] text-[var(--adaptive-black700)]">{messages.commandReplace.existingMessage}</p>
                        <p className="rounded-[8px] bg-[var(--adaptive-surface)] p-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-text-secondary)]">
                            {getIssueSummary(conflict.existing, { summaryMore: messages.cases.summaryMore })}
                        </p>
                    </section>

                    <section className="mt-[8px] flex flex-col gap-[4px]">
                        <p className="text-[12px] text-[var(--adaptive-black700)]">{messages.commandReplace.replacementMessage}</p>
                        <p className="rounded-[8px] bg-[var(--adaptive-surface)] p-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-blue500)]">
                            {getIssueSummary(conflict.incoming, { summaryMore: messages.cases.summaryMore })}
                        </p>
                    </section>
                </section>
            ))}

            <section className="flex items-center justify-end gap-[10px] p-[16px]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-[8px] border border-transparent bg-[var(--adaptive-grey300)] p-[4px_8px] font-semibold text-[var(--adaptive-black700)]"
                >
                    {messages.common.cancel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-[8px] border border-transparent bg-[var(--adaptive-blue100)] p-[4px_8px] font-bold text-[var(--adaptive-blue500)]"
                >
                    {messages.common.confirm}
                </button>
            </section>
        </article>
    );
}
