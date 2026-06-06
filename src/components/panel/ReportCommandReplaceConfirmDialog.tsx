import type { FeedbackInsertConflict } from "../../utils/feedbackDataTransfer.js";

type ReportCommandReplaceConfirmDialogProps = {
    conflicts: FeedbackInsertConflict[];
    onConfirm: () => void;
    onCancel: () => void;
};

export function ReportCommandReplaceConfirmDialog({ conflicts, onConfirm, onCancel }: ReportCommandReplaceConfirmDialogProps) {
    return (
        <article className="bg-[var(--adaptive-grey100)]">
            <section className="flex flex-col gap-[4px] p-[16px]">
                <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">이미 등록된 id가 있습니다</h6>
                <p className="leading-[1.5] text-[var(--adaptive-black500)]">
                    입력한 데이터의 id가 localStorage에 이미 저장되어 있어요. 확인을 누르면 기존 피드백을 아래 내용으로 교체합니다.
                </p>
            </section>

            {conflicts.map((conflict) => (
                <section
                    key={conflict.id}
                    className="border-t border-[var(--adaptive-black200)] p-[12px]"
                >
                    <dl className="mb-[8px] grid grid-cols-[72px_1fr] gap-[8px] text-[12px]">
                        <dt className="font-medium text-[var(--adaptive-black500)]">id</dt>
                        <dd className="break-all text-[var(--adaptive-black800)]">{conflict.id}</dd>
                        <dt className="font-medium text-[var(--adaptive-black500)]">report_id</dt>
                        <dd className="break-all text-[var(--adaptive-black800)]">{conflict.existing.report_id}</dd>
                    </dl>

                    <section className="flex flex-col gap-[4px]">
                        <p className="text-[12px] text-[var(--adaptive-black700)]">- 기존 message</p>
                        <p className="rounded-[8px] bg-white p-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-black800)]">{conflict.existing.message}</p>
                    </section>

                    <section className="mt-[8px] flex flex-col gap-[4px]">
                        <p className="text-[12px] text-[var(--adaptive-black700)]">+ 교체 message</p>
                        <p className="rounded-[8px] bg-white p-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-blue500)]">{conflict.incoming.message}</p>
                    </section>
                </section>
            ))}

            <section className="flex items-center justify-end gap-[10px] p-[16px]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-[8px] border border-transparent bg-[var(--adaptive-grey300)] p-[4px_8px] font-semibold text-[var(--adaptive-black700)]"
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-[8px] border border-transparent bg-[var(--adaptive-blue100)] p-[4px_8px] font-bold text-[var(--adaptive-blue500)]"
                >
                    확인
                </button>
            </section>
        </article>
    );
}
