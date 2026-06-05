type ReportImportConfirmDialogProps = {
    onApply: () => void;
    onCancel: () => void;
    onBackupAndApply: () => void;
};

export function ReportImportConfirmDialog({ onApply, onCancel, onBackupAndApply }: ReportImportConfirmDialogProps) {
    return (
        <section className="mx-[4px] mb-[4px] rounded-[12px] border border-[var(--adaptive-grey200)] bg-white p-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <p className="text-[14px] font-bold text-[var(--adaptive-grey900)]">확인필요</p>
            <p className="mt-[8px] text-[13px] leading-[1.4] text-[var(--adaptive-grey700)]">
                현재 localStorage에 저장되어있는 데이터를 json으로 백업 후 선택하신 json을 import 할까요?
            </p>
            <div className="mt-[14px] flex items-center justify-end gap-[10px]">
                <button
                    type="button"
                    onClick={onApply}
                    className="text-[13px] font-semibold text-[var(--adaptive-grey700)]"
                >
                    바로 반영
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-[13px] font-semibold text-[var(--adaptive-grey700)]"
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={onBackupAndApply}
                    className="rounded-[8px] bg-[#dbeafe] px-[12px] py-[6px] text-[13px] font-bold text-[var(--adaptive-blue500)]"
                >
                    백업 후 반영
                </button>
            </div>
        </section>
    );
}
