import { useState } from "react";
import { useReport } from "@/providers/reportContext.js";

type ReportPersonalKeyDialogProps = {
    mode: "required" | "insert";
    onCancel: () => void;
    onComplete: (message: string) => void;
};

export function ReportPersonalKeyDialog({ mode, onCancel, onComplete }: ReportPersonalKeyDialogProps) {
    const { issuePersonalKey, insertPersonalKey, messages } = useReport();
    const [key, setKey] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        if (mode === "required") {
            const issuedKey = await issuePersonalKey();

            if (!issuedKey) {
                setError(messages.personalKey.ownerRequired);
                return;
            }

            onComplete(messages.personalKey.setupSuccess);
            return;
        }

        const inserted = await insertPersonalKey(key);

        if (!inserted) {
            setError(messages.personalKey.invalidKey);
            return;
        }

        onComplete(messages.personalKey.setupSuccess);
    };

    return (
        <section className="bg-[var(--adaptive-grey100)] p-[16px]">
            <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">
                {mode === "required" ? messages.personalKey.requiredTitle : messages.personalKey.insertTitle}
            </h6>
            <p className="mt-[8px] leading-[1.4] text-[var(--adaptive-black700)]">
                {mode === "required" ? messages.personalKey.requiredDescription : messages.personalKey.insertDescription}
            </p>

            {mode === "required" ? (
                <ul className="mt-[10px] list-disc space-y-[4px] pl-[18px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]">
                    <li>{messages.personalKey.backupWarning}</li>
                    <li>{messages.personalKey.restoreGuide}</li>
                </ul>
            ) : (
                <input
                    autoFocus
                    value={key}
                    onChange={(event) => {
                        setKey(event.target.value);
                        setError("");
                    }}
                    placeholder={messages.personalKey.inputPlaceholder}
                    className="mt-[12px] w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none"
                />
            )}

            {error ? <p className="mt-[8px] text-[12px] text-rose-700">{error}</p> : null}

            <div className="mt-[14px] flex items-center justify-end gap-[10px]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-[8px] bg-[var(--adaptive-grey300)] p-[4px_8px] font-semibold text-[var(--adaptive-black700)]"
                >
                    {messages.common.cancel}
                </button>
                <button
                    type="button"
                    disabled={mode === "insert" && !key.trim()}
                    onClick={() => void handleConfirm()}
                    className="rounded-[8px] bg-[var(--adaptive-blue100)] p-[4px_8px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50"
                >
                    {messages.common.confirm}
                </button>
            </div>
        </section>
    );
}
