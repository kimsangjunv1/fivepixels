import { useState } from "react";
import { useReportPreferences } from "@/providers/reportContext.js";
import { MOTION } from "@/constants/motionClasses.js";
import type { FeedbackImportMode } from "@/utils/feedback/feedbackDataTransfer.js";

type ReportImportConfirmDialogProps = {
    onApply: (mode: FeedbackImportMode) => void;
    onCancel: () => void;
    onBackupAndApply: (mode: FeedbackImportMode) => void;
};

export function ReportImportConfirmDialog({ onApply, onCancel, onBackupAndApply }: ReportImportConfirmDialogProps) {
    const { messages } = useReportPreferences();
    const [mode, setMode] = useState<FeedbackImportMode>("merge");
    const description = mode === "merge" ? messages.importConfirm.mergeDescription : messages.importConfirm.replaceDescription;

    return (
        <section className={`bg-[var(--adaptive-grey100)] p-[16px] ${MOTION.dialogIn}`}>
            <p className="text-[14px] font-bold text-[var(--adaptive-black900)]">{messages.importConfirm.title}</p>
            <p className="mt-[8px] leading-[1.4] text-[var(--adaptive-black700)]">{description}</p>

            <div className="mt-[12px] flex gap-[8px]">
                <button
                    type="button"
                    onClick={() => setMode("merge")}
                    aria-pressed={mode === "merge"}
                    className={`rounded-[8px] border p-[4px_8px] text-[12px] font-semibold ${
                        mode === "merge"
                            ? "border-[var(--adaptive-blue500)] bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)]"
                            : "border-[var(--adaptive-grey300)] bg-transparent text-[var(--adaptive-black700)]"
                    }`}
                >
                    {messages.importConfirm.mergeMode}
                </button>
                <button
                    type="button"
                    onClick={() => setMode("replace")}
                    aria-pressed={mode === "replace"}
                    className={`rounded-[8px] border p-[4px_8px] text-[12px] font-semibold ${
                        mode === "replace"
                            ? "border-[var(--adaptive-blue500)] bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)]"
                            : "border-[var(--adaptive-grey300)] bg-transparent text-[var(--adaptive-black700)]"
                    }`}
                >
                    {messages.importConfirm.replaceMode}
                </button>
            </div>

            <div className="mt-[14px] flex items-center justify-end gap-[10px]">
                <button
                    type="button"
                    onClick={() => onApply(mode)}
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
                        onClick={() => onBackupAndApply(mode)}
                        className="bg-[var(--adaptive-blue100)] p-[4px_8px] rounded-[8px] font-bold text-[var(--adaptive-blue500)] border border-transparent"
                    >
                        {messages.importConfirm.backupAndApply}
                    </button>
                </section>
            </div>
        </section>
    );
}
