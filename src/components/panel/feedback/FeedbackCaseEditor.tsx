import { useEffect, useRef } from "react";
import type { ReportCase } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";

type FeedbackCaseEditorProps = {
    cases: ReportCase[];
    onCaseChange: (caseId: string, text: string) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
    autoFocus?: boolean;
    placeholder?: string;
    onSubmitShortcut?: () => void;
};

const CASE_INPUT_CLASS =
    "min-h-[56px] w-full flex-1 resize-none rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-transparent px-[8px] py-[6px] text-[14px] leading-[1.4] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)] focus:border-[var(--adaptive-blue500)]";

export function FeedbackCaseEditor({
    cases,
    onCaseChange,
    onAddCase,
    onRemoveCase,
    autoFocus = false,
    placeholder,
    onSubmitShortcut,
}: FeedbackCaseEditorProps) {
    const { messages } = useReport();
    const previousCaseCountRef = useRef(cases.length);
    const resolvedPlaceholder = placeholder ?? messages.composer.casePlaceholder;

    useEffect(() => {
        if (cases.length <= previousCaseCountRef.current) {
            previousCaseCountRef.current = cases.length;
            return;
        }

        const lastCase = cases[cases.length - 1];

        if (lastCase) {
            document.getElementById(`fivepixels-case-input-${lastCase.id}`)?.focus();
        }

        previousCaseCountRef.current = cases.length;
    }, [cases]);

    return (
        <div className="flex max-h-[280px] flex-col gap-[8px] overflow-y-auto px-[8px] pt-[8px]">
            {cases.map((item, index) => (
                <div
                    key={item.id}
                    className="flex items-start gap-[6px]"
                >
                    <span className="w-[20px] shrink-0 pt-[8px] text-[12px] font-medium tabular-nums text-[var(--adaptive-black500)]">{index + 1}.</span>
                    <textarea
                        id={`fivepixels-case-input-${item.id}`}
                        autoFocus={autoFocus && index === 0}
                        value={item.text}
                        onChange={(event) => onCaseChange(item.id, event.target.value)}
                        placeholder={resolvedPlaceholder}
                        rows={2}
                        className={CASE_INPUT_CLASS}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                                event.preventDefault();
                                onSubmitShortcut?.();
                            }
                        }}
                    />
                    {cases.length > 1 ? (
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={() => onRemoveCase(item.id)}
                            aria-label={messages.composer.removeCaseAriaLabel(index + 1)}
                            className="mt-[4px] inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-[18px] leading-none text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-blackOpacity100)]"
                        >
                            ×
                        </button>
                    ) : (
                        <span className="w-[28px] shrink-0" aria-hidden />
                    )}
                </div>
            ))}

            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={onAddCase}
                className="self-start rounded-full border border-dashed border-[var(--adaptive-border-subtle)] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-blue100)]"
            >
                + {messages.composer.addCase}
            </button>
        </div>
    );
}
