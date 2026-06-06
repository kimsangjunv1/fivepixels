import { useState } from "react";

type ReportCommandPanelProps = {
    onExecute: (raw: string) => Promise<string>;
    onClose: () => void;
};

export function ReportCommandPanel({ onExecute, onClose }: ReportCommandPanelProps) {
    const [raw, setRaw] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleExecute = () => {
        if (!raw.trim() || isExecuting) {
            return;
        }

        setIsExecuting(true);
        setStatusMessage("");
        setIsError(false);

        void onExecute(raw.trim())
            .then((message) => {
                setStatusMessage(message);
                setIsError(false);
            })
            .catch((error) => {
                setStatusMessage(error instanceof Error ? error.message : "데이터 삽입에 실패했어요.");
                setIsError(true);
            })
            .finally(() => {
                setIsExecuting(false);
            });
    };

    return (
        <section className="flex min-h-0 flex-1 flex-col bg-[var(--adaptive-black50)]">
            <div className="border-b border-[var(--adaptive-black200)] p-[12px]">
                <p className="text-[14px] font-bold text-[var(--adaptive-black900)]">Command</p>
                <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black500)]">복사한 피드백 JSON을 붙여넣고 실행하면 localStorage에 삽입됩니다.</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[8px] p-[12px]">
                <textarea
                    value={raw}
                    onChange={(event) => setRaw(event.target.value)}
                    placeholder='{"id":"...","pathname":"...", ...}'
                    spellCheck={false}
                    className="min-h-[160px] flex-1 resize-none rounded-[8px] border border-[var(--adaptive-black300)] bg-white p-[10px] font-mono text-[11px] leading-[1.5] text-[var(--adaptive-black800)] outline-none placeholder:text-[var(--adaptive-black400)]"
                />

                {statusMessage ? (
                    <p className={`text-[12px] ${isError ? "text-rose-700" : "text-[var(--adaptive-green600,#2e7d32)]"}`}>{statusMessage}</p>
                ) : null}

                <div className="flex items-center justify-end gap-[8px]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-[8px] border border-[var(--adaptive-black300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        disabled={!raw.trim() || isExecuting}
                        onClick={handleExecute}
                        className="rounded-[8px] bg-[var(--adaptive-blue500)] px-[12px] py-[6px] text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isExecuting ? "실행 중..." : "실행"}
                    </button>
                </div>
            </div>
        </section>
    );
}
