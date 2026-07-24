import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { FeedbackCaseTabBar } from "./FeedbackCaseTabBar.js";
const CASE_INPUT_MIN_HEIGHT = 56;
const CASE_INPUT_CLASS = "min-h-[56px] w-full flex-1 resize-none overflow-hidden px-[12px] py-[6px] text-[16px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)] focus:border-[var(--adaptive-blue500)]";
function syncCaseTextareaHeight(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(CASE_INPUT_MIN_HEIGHT, textarea.scrollHeight)}px`;
}
function CaseTextarea({ id, value, autoFocus, placeholder, onChange, onSubmitShortcut, needsAttention = false }) {
    const textareaRef = useRef(null);
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
    return (_jsx("textarea", { ref: textareaRef, id: id, autoFocus: autoFocus, value: value, onChange: (event) => {
            onChange(event.target.value);
            syncCaseTextareaHeight(event.target);
        }, placeholder: placeholder, rows: 1, "aria-invalid": needsAttention || undefined, className: `${CASE_INPUT_CLASS}${needsAttention ? " fivepixels-validation-attention rounded-[8px] bg-rose-500/10" : ""}`, onKeyDown: (event) => {
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
        } }));
}
function resolveActiveCaseId(cases, activeCaseId) {
    if (cases.length === 0) {
        return null;
    }
    if (activeCaseId && cases.some((item) => item.id === activeCaseId)) {
        return activeCaseId;
    }
    return cases[cases.length - 1]?.id ?? cases[0].id;
}
export function FeedbackCaseEditor({ cases, onCaseChange, onAddCase, onRemoveCase, autoFocus = false, onSubmitShortcut, needsAttention = false, attentionKey = 0, emptyCaseIds = [], showTabBar = true, activeCaseId: controlledActiveCaseId, onActiveCaseIdChange, }) {
    const { messages } = useReportPreferences();
    const previousCaseCountRef = useRef(cases.length);
    const containerRef = useRef(null);
    const [uncontrolledActiveCaseId, setUncontrolledActiveCaseId] = useState(() => cases[0]?.id ?? null);
    const isActiveCaseControlled = controlledActiveCaseId !== undefined;
    const activeCaseId = isActiveCaseControlled ? controlledActiveCaseId : uncontrolledActiveCaseId;
    const setActiveCaseId = useCallback((caseId) => {
        if (!caseId) {
            return;
        }
        if (isActiveCaseControlled) {
            onActiveCaseIdChange?.(caseId);
            return;
        }
        setUncontrolledActiveCaseId(caseId);
    }, [isActiveCaseControlled, onActiveCaseIdChange]);
    const resolvedActiveCaseId = resolveActiveCaseId(cases, activeCaseId);
    const activeCase = cases.find((item) => item.id === resolvedActiveCaseId) ?? null;
    const activeCaseIndex = activeCase ? cases.findIndex((item) => item.id === activeCase.id) : -1;
    const activeCaseNeedsAttention = Boolean(activeCase && needsAttention && emptyCaseIds.includes(activeCase.id));
    const getCaseInputPlaceholder = useCallback((index) => messages.composer.caseInputPlaceholder(index), [messages.composer]);
    useEffect(() => {
        const nextActiveCaseId = resolveActiveCaseId(cases, activeCaseId);
        if (nextActiveCaseId && nextActiveCaseId !== activeCaseId) {
            setActiveCaseId(nextActiveCaseId);
        }
    }, [activeCaseId, cases, setActiveCaseId]);
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
    }, [cases, setActiveCaseId]);
    useEffect(() => {
        if (!needsAttention || attentionKey <= 0 || emptyCaseIds.length === 0) {
            return;
        }
        const targetCaseId = emptyCaseIds.includes(resolvedActiveCaseId ?? "") ? resolvedActiveCaseId : emptyCaseIds[0];
        if (!targetCaseId) {
            return;
        }
        if (targetCaseId !== resolvedActiveCaseId) {
            setActiveCaseId(targetCaseId);
        }
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        window.requestAnimationFrame(() => {
            document.getElementById(`fivepixels-case-input-${targetCaseId}`)?.focus();
        });
    }, [needsAttention, attentionKey, emptyCaseIds, resolvedActiveCaseId, setActiveCaseId]);
    const handleRemoveCase = (caseId) => {
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
    return (_jsxs("div", { ref: containerRef, className: "flex h-full min-h-0 flex-1 flex-col", children: [showTabBar ? (_jsx(FeedbackCaseTabBar, { variant: "editor", cases: cases, activeCaseId: resolvedActiveCaseId, onSelectCase: setActiveCaseId, onAddCase: onAddCase, onRemoveCase: handleRemoveCase, invalidCaseIds: needsAttention ? emptyCaseIds : [] })) : null, _jsx("div", { role: "tabpanel", id: `fivepixels-case-panel-${activeCase.id}`, "aria-labelledby": `fivepixels-case-tab-${activeCase.id}`, className: "flex min-h-0 flex-1 flex-col overflow-y-auto px-[4px] py-[4px]", children: _jsx(CaseTextarea, { id: `fivepixels-case-input-${activeCase.id}`, autoFocus: autoFocus && activeCaseIndex === 0, value: activeCase.text, placeholder: getCaseInputPlaceholder(activeCaseIndex + 1), onChange: (text) => onCaseChange(activeCase.id, text), onSubmitShortcut: onSubmitShortcut, needsAttention: activeCaseNeedsAttention }) })] }));
}
//# sourceMappingURL=FeedbackCaseEditor.js.map