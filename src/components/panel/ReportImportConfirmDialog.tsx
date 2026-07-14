import { useReportPreferences } from "@/providers/reportContext.js";

type ReportImportConfirmDialogProps = {
    onApply: () => void;
    onCancel: () => void;
    onBackupAndApply: () => void;
};

export function ReportImportConfirmDialog({ onApply, onCancel, onBackupAndApply }: ReportImportConfirmDialogProps) {
    const { messages } = useReportPreferences();

    return (
        <section className="bg-[var(--adaptive-grey100)] p-[16px]">
            <p className="text-[14px] font-bold text-[var(--adaptive-black900)]">{messages.importConfirm.title}</p>
            <p className="mt-[8px] leading-[1.4] text-[var(--adaptive-black700)]">{messages.importConfirm.description}</p>
            <div className="mt-[14px] flex items-center justify-end gap-[10px]">
                <button
                    type="button"
                    onClick={onApply}
                    className="border border-[var(--adaptive-grey300)] p-[4px_8px] rounded-[8px] font-semibold text-[var(--adaptive-black700)]"
                >
                    {messages.importConfirm.applyDirectly}
                </button>

                <div className="w-[1px] h-[16px] bg-[var(--adaptive-black400)]" />

                <section className="flex gap-[4px]">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-[var(--adaptive-grey300)] p-[4px_8px] rounded-[8px] font-semibold text-[var(--adaptive-black700)] border border-transparent"
                    >
                        {messages.common.cancel}
                    </button>
                    <button
                        type="button"
                        onClick={onBackupAndApply}
                        className="bg-[var(--adaptive-blue100)] p-[4px_8px] rounded-[8px] font-bold text-[var(--adaptive-blue500)] border border-transparent"
                    >
                        {messages.importConfirm.backupAndApply}
                    </button>
                </section>
            </div>
        </section>
    );
}
