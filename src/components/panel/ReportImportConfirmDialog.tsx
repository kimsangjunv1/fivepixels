type ReportImportConfirmDialogProps = {
    onApply: () => void;
    onCancel: () => void;
    onBackupAndApply: () => void;
};

export function ReportImportConfirmDialog({ onApply, onCancel, onBackupAndApply }: ReportImportConfirmDialogProps) {
    return (
        <section className="bg-[var(--adaptive-grey100)] p-[16px]">
            <p className="text-[14px] font-bold text-[var(--adaptive-black900)]">확인필요</p>
            <p className="mt-[8px] leading-[1.4] text-[var(--adaptive-black700)]">현재 localStorage에 저장되어있는 데이터를 json으로 백업 후 선택하신 json을 import 할까요?</p>
            <div className="mt-[14px] flex items-center justify-end gap-[10px]">
                <button
                    type="button"
                    onClick={onApply}
                    className="border border-[var(--adaptive-grey300)] p-[4px_8px] rounded-[8px] font-semibold text-[var(--adaptive-black700)]"
                >
                    바로 반영
                </button>

                <div className="w-[1px] h-[16px] bg-[var(--adaptive-black400)]" />

                <section className="flex gap-[4px]">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-[var(--adaptive-grey300)] p-[4px_8px] rounded-[8px] font-semibold text-[var(--adaptive-black700)] border border-transparent"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onBackupAndApply}
                        className="bg-[var(--adaptive-blue100)] p-[4px_8px] rounded-[8px] font-bold text-[var(--adaptive-blue500)] border border-transparent"
                    >
                        백업 후 반영 +
                    </button>
                </section>
            </div>
        </section>
    );
}
