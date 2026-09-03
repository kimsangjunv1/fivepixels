import { useEffect, useState } from "react";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { NoticeDialog } from "@/shared/components/ui/NoticeDialog.js";

export type CommandExecuteResult = { status: "success"; message: string } | { status: "pending" };

type ReportCommandPanelProps = {
    onExecute: (raw: string) => Promise<CommandExecuteResult>;
    onClose: () => void;
    notice?: { message: string; isError: boolean } | null;
    onNoticeClear?: () => void;
};

export function ReportCommandPanel({ onExecute, onClose, notice = null, onNoticeClear }: ReportCommandPanelProps) {
    const { messages } = useReportPreferences();
    const [raw, setRaw] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        if (!notice) {
            return;
        }

        setStatusMessage(notice.message);
        setIsError(notice.isError);
        onNoticeClear?.();
    }, [notice, onNoticeClear]);

    const handleExecute = () => {
        if (!raw.trim() || isExecuting) {
            return;
        }

        setIsExecuting(true);
        setStatusMessage("");
        setIsError(false);

        void onExecute(raw.trim())
            .then((result) => {
                if (result.status === "pending") {
                    return;
                }

                setStatusMessage(result.message);
                setIsError(false);
            })
            .catch((error) => {
                setStatusMessage(error instanceof Error ? error.message : messages.command.insertFailed);
                setIsError(true);
            })
            .finally(() => {
                setIsExecuting(false);
            });
    };

    return (
        <section className="flex min-h-0 max-h-[51.2rem] flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
            <div className="border-b border-[var(--adaptive-black200)] p-[12px]">
                <p className="text-[14px] font-bold text-[var(--adaptive-black900)]">{messages.command.title}</p>
                <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black500)]">{messages.command.description}</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[8px]">
                <textarea
                    value={raw}
                    onChange={(event) => setRaw(event.target.value)}
                    placeholder={messages.command.jsonPlaceholder}
                    spellCheck={false}
                    className="min-h-[160px] flex-1 resize-none bg-[var(--adaptive-overlay-surface)] p-[4px] font-mono text-[12px] leading-[1.5] text-[var(--adaptive-overlay-text)] outline-none placeholder:text-[var(--adaptive-overlay-text-muted)]"
                />

                {statusMessage ? (
                    <NoticeDialog
                        role={isError ? "alert" : "status"}
                        title={messages.common.noticeTitle}
                        description={statusMessage}
                        actions={[
                            {
                                id: "dismiss",
                                label: messages.common.ok,
                                variant: "primary",
                                onClick: () => {
                                    setStatusMessage("");
                                    setIsError(false);
                                },
                            },
                        ]}
                    />
                ) : null}

                <div className="flex items-center justify-end gap-[8px] p-[12px]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-[8px] border border-[var(--adaptive-grey300)] bg-transparent p-[4px_8px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                    >
                        {messages.common.close}
                    </button>
                    <button
                        type="button"
                        disabled={!raw.trim() || isExecuting}
                        onClick={handleExecute}
                        className="rounded-[8px] border border-transparent bg-[var(--adaptive-blue100)] p-[4px_8px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isExecuting ? messages.common.executing : messages.common.execute}
                    </button>
                </div>
            </div>
        </section>
    );
}
