import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReportCase } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";
import { FeedbackCaseTabBar } from "./FeedbackCaseTabBar.js";

type FeedbackCaseEditorProps = {
    cases: ReportCase[];
    onCaseChange: (caseId: string, text: string) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
    autoFocus?: boolean;
    onSubmitShortcut?: () => void;
};

const CASE_INPUT_MIN_HEIGHT = 56;

const CASE_INPUT_CLASS =
    "min-h-[56px] w-full flex-1 resize-none overflow-hidden px-[12px] py-[6px] text-[16px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)] focus:border-[var(--adaptive-blue500)]";

function syncCaseTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(CASE_INPUT_MIN_HEIGHT, textarea.scrollHeight)}px`;
}

type CaseTextareaProps = {
    id: string;
    value: string;
    autoFocus: boolean;
    placeholder: string;
    onChange: (value: string) => void;
    onSubmitShortcut?: () => void;
};

function CaseTextarea({ id, value, autoFocus, placeholder, onChange, onSubmitShortcut }: CaseTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const syncHeight = useCallback(() => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        syncCaseTextareaHeight(textarea);
    }, []);

    useLayoutEffect(() => {
        syncHeight();
    }, [syncHeight, value]);

    return (
        <textarea
            ref={textareaRef}
            id={id}
            autoFocus={autoFocus}
            value={value}
            onChange={(event) => {
                onChange(event.target.value);
                syncCaseTextareaHeight(event.target);
            }}
            placeholder={placeholder}
            rows={1}
            className={CASE_INPUT_CLASS}
            onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    onSubmitShortcut?.();
                    return;
                }

                if (event.key === "Enter") {
                    const textarea = event.currentTarget;
                    window.requestAnimationFrame(() => {
                        syncCaseTextareaHeight(textarea);
                    });
                }
            }}
        />
    );
}

function resolveActiveCaseId(cases: ReportCase[], activeCaseId: string | null) {
    if (cases.length === 0) {
        return null;
    }

    if (activeCaseId && cases.some((item) => item.id === activeCaseId)) {
        return activeCaseId;
    }

    return cases[cases.length - 1]?.id ?? cases[0].id;
}

export function FeedbackCaseEditor({ cases, onCaseChange, onAddCase, onRemoveCase, autoFocus = false, onSubmitShortcut }: FeedbackCaseEditorProps) {
    const { messages } = useReport();
    const previousCaseCountRef = useRef(cases.length);
    const [activeCaseId, setActiveCaseId] = useState<string | null>(() => cases[0]?.id ?? null);
    const resolvedActiveCaseId = resolveActiveCaseId(cases, activeCaseId);
    const activeCase = cases.find((item) => item.id === resolvedActiveCaseId) ?? null;
    const activeCaseIndex = activeCase ? cases.findIndex((item) => item.id === activeCase.id) : -1;

    const getCaseInputPlaceholder = useCallback((index: number) => messages.composer.caseInputPlaceholder(index), [messages.composer]);

    useEffect(() => {
        const nextActiveCaseId = resolveActiveCaseId(cases, activeCaseId);

        if (nextActiveCaseId !== activeCaseId) {
            setActiveCaseId(nextActiveCaseId);
        }
    }, [activeCaseId, cases]);

    useEffect(() => {
        if (cases.length <= previousCaseCountRef.current) {
            previousCaseCountRef.current = cases.length;
            return;
        }

        const lastCase = cases[cases.length - 1];

        if (lastCase) {
            setActiveCaseId(lastCase.id);
            window.requestAnimationFrame(() => {
                document.getElementById(`fivepixels-case-input-${lastCase.id}`)?.focus();
            });
        }

        previousCaseCountRef.current = cases.length;
    }, [cases]);

    const handleRemoveCase = (caseId: string) => {
        const removeIndex = cases.findIndex((item) => item.id === caseId);

        if (removeIndex < 0) {
            return;
        }

        const fallbackCase = cases[removeIndex + 1] ?? cases[removeIndex - 1];

        if (activeCaseId === caseId && fallbackCase) {
            setActiveCaseId(fallbackCase.id);
        }

        onRemoveCase(caseId);
    };

    if (!activeCase || activeCaseIndex < 0) {
        return null;
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <FeedbackCaseTabBar
                variant="editor"
                cases={cases}
                activeCaseId={resolvedActiveCaseId}
                onSelectCase={setActiveCaseId}
                onAddCase={onAddCase}
                onRemoveCase={handleRemoveCase}
            />

            <div
                role="tabpanel"
                id={`fivepixels-case-panel-${activeCase.id}`}
                aria-labelledby={`fivepixels-case-tab-${activeCase.id}`}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[4px] py-[4px]"
            >
                <CaseTextarea
                    id={`fivepixels-case-input-${activeCase.id}`}
                    autoFocus={autoFocus && activeCaseIndex === 0}
                    value={activeCase.text}
                    placeholder={getCaseInputPlaceholder(activeCaseIndex + 1)}
                    onChange={(text) => onCaseChange(activeCase.id, text)}
                    onSubmitShortcut={onSubmitShortcut}
                />
            </div>
        </div>
    );
}
