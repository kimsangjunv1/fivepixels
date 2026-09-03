import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { ReportMessages } from "@/shared/i18n/types.js";
import type {
    DraftReport,
    HoverPointer,
    PickProbeCompareMode,
    PickProbeFieldKey,
    PickProbeLayoutMode,
    PickProbeValues,
    ContextMenuTooltipState,
    ReportMode,
    SavedProbeEntry,
    TargetSnapshot,
} from "@/shared/types/report-ui.js";
import { toFeedbackHoverSnapshot } from "@/shared/utils/shared/dom.js";
import { shouldInspectFontStyle } from "@/shared/utils/probe/pickTargetInspect.js";
import { applyPickProbeCompareMode, applyPickProbeValueDiff, capturePickProbeValues, formatSavedProbeEditsSummary, getProposedChanges } from "@/shared/utils/probe/pickProbe.js";
import {
    applySavedProbeEditsCompareMode,
    captureProbeOriginalSnapshot,
    captureSavedProbeDeletion,
    createSavedProbeEntry,
    restoreProbeElementFromSnapshot,
    findElementByProbeKey,
    getPickProbeElementKey,
    restoreProbeElementOriginal,
} from "@/shared/utils/probe/pickProbeSession.js";
import { playPickTargetDeleteAnimation } from "@/shared/utils/probe/pickTargetDeleteAnimation.js";
import { getPickProbeLayoutMode } from "@/shared/utils/probe/probeLayout.js";
import { createReportCase } from "@/shared/utils/report/reportCases.js";
import { usePickProbeSessionHistory } from "./usePickProbeSessionHistory.js";

export type UseReportPickProbeParams = {
    mode: ReportMode;
    selectedElementRef: MutableRefObject<HTMLElement | null>;
    hoveredElementRef: MutableRefObject<HTMLElement | null>;
    draftElementRef: MutableRefObject<HTMLElement | null>;
    setSelectedTarget: Dispatch<SetStateAction<TargetSnapshot | null>>;
    setHoveredTarget: Dispatch<SetStateAction<TargetSnapshot | null>>;
    setHoverPointer: Dispatch<SetStateAction<HoverPointer | null>>;
    setDraft: Dispatch<SetStateAction<DraftReport | null>>;
    draft: DraftReport | null;
    messages: ReportMessages;
};

export function useReportPickProbe({
    mode,
    selectedElementRef,
    hoveredElementRef,
    draftElementRef,
    setSelectedTarget,
    setHoveredTarget,
    setHoverPointer,
    setDraft,
    draft,
    messages,
}: UseReportPickProbeParams) {
    const [pickProbeOpen, setPickProbeOpen] = useState(false);
    const [pickProbeBaseline, setPickProbeBaseline] = useState<PickProbeValues | null>(null);
    const [pickProbeValues, setPickProbeValues] = useState<PickProbeValues | null>(null);
    const [pickProbeSupportsTextFields, setPickProbeSupportsTextFields] = useState(false);
    const [pickProbeLayoutMode, setPickProbeLayoutMode] = useState<PickProbeLayoutMode>(null);
    const [pickProbeCompareMode, setPickProbeCompareModeState] = useState<PickProbeCompareMode>("after");
    const [pickTargetContextMenu, setContextMenuTooltip] = useState<ContextMenuTooltipState | null>(null);
    const [contextMenuElementKey, setContextMenuElementKey] = useState<string | null>(null);
    const [savedProbeEdits, setSavedProbeEdits] = useState<Record<string, SavedProbeEntry>>({});
    const [savedProbeCompareMode, setSavedProbeCompareModeState] = useState<PickProbeCompareMode>("after");
    const {
        savedProbeDeletions,
        setSavedProbeDeletions,
        pushProbeSessionAction,
        undoProbeSessionAction,
        redoProbeSessionAction,
        revertAllSavedProbeEdits,
        canUndoProbeSession,
        canRedoProbeSession,
        hasProbeSessionChanges,
    } = usePickProbeSessionHistory({
        setSavedProbeEdits,
        setSavedProbeCompareModeState,
    });
    const pickProbeRestoreRef = useRef<{
        style: string | null;
        textContent: string | null;
        inputValue: string | null;
    } | null>(null);
    const pickProbeOriginalSnapshotRef = useRef<ReturnType<typeof captureProbeOriginalSnapshot> | null>(null);
    const pickProbeElementKeyRef = useRef<string | null>(null);
    const contextMenuElementRef = useRef<HTMLElement | null>(null);

    const refreshSelectedTargetSnapshot = useCallback(() => {
        const element = selectedElementRef.current;

        if (!element) {
            return;
        }

        const snapshot = toFeedbackHoverSnapshot(element);

        if (!snapshot) {
            return;
        }

        setSelectedTarget(snapshot);
        setHoveredTarget(snapshot);
    }, []);

    const closePickProbePanelOnly = useCallback(() => {
        setPickProbeOpen(false);
        setPickProbeBaseline(null);
        setPickProbeValues(null);
        setPickProbeSupportsTextFields(false);
        setPickProbeLayoutMode(null);
        setPickProbeCompareModeState("after");
        pickProbeElementKeyRef.current = null;
    }, []);

    const resetPickProbeState = useCallback(() => {
        closePickProbePanelOnly();
    }, [closePickProbePanelOnly]);

    const revertSavedProbeEdit = useCallback(
        (elementKey: string) => {
            setSavedProbeEdits((current) => {
                const entry = current[elementKey];

                if (!entry) {
                    return current;
                }

                const element = findElementByProbeKey(elementKey);

                if (element) {
                    restoreProbeElementOriginal(element, entry);
                }

                const next = { ...current };
                delete next[elementKey];
                return next;
            });

            if (pickProbeElementKeyRef.current === elementKey) {
                pickProbeRestoreRef.current = null;
                pickProbeOriginalSnapshotRef.current = null;
                closePickProbePanelOnly();
            }
        },
        [closePickProbePanelOnly],
    );

    const setSavedProbeCompareMode = useCallback((compareMode: PickProbeCompareMode) => {
        setSavedProbeCompareModeState(compareMode);
        setSavedProbeEdits((current) => {
            applySavedProbeEditsCompareMode(current, compareMode);
            return current;
        });
    }, []);

    const pickProbeChanges = useMemo(() => {
        if (!pickProbeBaseline || !pickProbeValues) {
            return [];
        }

        return getProposedChanges(pickProbeBaseline, pickProbeValues, pickProbeSupportsTextFields, pickProbeLayoutMode);
    }, [pickProbeBaseline, pickProbeLayoutMode, pickProbeSupportsTextFields, pickProbeValues]);

    const pickProbeHasEdits = pickProbeChanges.length > 0;

    const persistPickProbeEdits = useCallback(
        (options?: { closePanel?: boolean; values?: PickProbeValues; skipDomApply?: boolean }) => {
            const element = selectedElementRef.current;
            const values = options?.values ?? pickProbeValues;

            if (!element || !pickProbeBaseline || !values) {
                if (options?.closePanel) {
                    closePickProbePanelOnly();
                }

                return;
            }

            const elementKey = getPickProbeElementKey(element);
            const changes = getProposedChanges(pickProbeBaseline, values, pickProbeSupportsTextFields, pickProbeLayoutMode);
            const existing = savedProbeEdits[elementKey];

            if (changes.length === 0) {
                if (existing) {
                    pushProbeSessionAction({
                        kind: "style-revert",
                        elementKey,
                        revertedEntry: existing,
                    });

                    setSavedProbeEdits((current) => {
                        const next = { ...current };
                        delete next[elementKey];
                        return next;
                    });
                }

                if (options?.closePanel) {
                    pickProbeRestoreRef.current = null;
                    pickProbeOriginalSnapshotRef.current = null;
                    closePickProbePanelOnly();
                }

                refreshSelectedTargetSnapshot();
                return;
            }

            const previousEntry = existing ?? null;
            const originalSnapshot = pickProbeOriginalSnapshotRef.current;

            if (!options?.skipDomApply) {
                applyPickProbeCompareMode(element, savedProbeCompareMode, pickProbeBaseline, values);
            }

            const nextEntry = createSavedProbeEntry(
                elementKey,
                pickProbeBaseline,
                values,
                originalSnapshot?.style ?? pickProbeRestoreRef.current?.style ?? null,
                originalSnapshot?.textContent ?? pickProbeRestoreRef.current?.textContent ?? pickProbeBaseline.textContent,
                existing,
                originalSnapshot?.innerHTML ?? null,
                originalSnapshot?.inputValue ?? null,
            );

            const appliedChanged = !existing || getProposedChanges(existing.applied, values, pickProbeSupportsTextFields, pickProbeLayoutMode).length > 0;

            setSavedProbeEdits((current) => ({
                ...current,
                [elementKey]: nextEntry,
            }));

            if (appliedChanged) {
                pushProbeSessionAction({
                    kind: "style-apply",
                    elementKey,
                    previousEntry,
                    nextEntry,
                });
            }

            if (options?.closePanel) {
                pickProbeRestoreRef.current = null;
                pickProbeOriginalSnapshotRef.current = null;
                closePickProbePanelOnly();
            }

            refreshSelectedTargetSnapshot();
        },
        [
            closePickProbePanelOnly,
            pickProbeBaseline,
            pickProbeLayoutMode,
            pickProbeSupportsTextFields,
            pickProbeValues,
            pushProbeSessionAction,
            refreshSelectedTargetSnapshot,
            savedProbeCompareMode,
            savedProbeEdits,
        ],
    );

    const commitPickProbeEdits = useCallback(() => {
        persistPickProbeEdits({ closePanel: true });
    }, [persistPickProbeEdits]);

    const openPickProbe = useCallback(() => {
        const element = selectedElementRef.current;

        if (!element) {
            return;
        }

        if (pickProbeOpen) {
            closePickProbePanelOnly();
        }

        const elementKey = getPickProbeElementKey(element);
        const saved = savedProbeEdits[elementKey];

        pickProbeElementKeyRef.current = elementKey;
        const supportsTextFields = shouldInspectFontStyle(element);
        const layoutMode = getPickProbeLayoutMode(element);
        setPickProbeSupportsTextFields(supportsTextFields);
        setPickProbeLayoutMode(layoutMode);
        const freshBaseline = capturePickProbeValues(element);

        const sessionSnapshot = captureProbeOriginalSnapshot(element);
        pickProbeOriginalSnapshotRef.current = sessionSnapshot;
        pickProbeRestoreRef.current = {
            style: sessionSnapshot.style,
            textContent: sessionSnapshot.textContent,
            inputValue: sessionSnapshot.inputValue,
        };

        if (saved) {
            applyPickProbeCompareMode(element, savedProbeCompareMode, saved.baseline, saved.applied);
            setPickProbeBaseline({ ...freshBaseline, ...saved.baseline });
            setPickProbeValues({ ...freshBaseline, ...saved.applied });
        } else {
            const baseline = capturePickProbeValues(element);
            setPickProbeBaseline(baseline);
            setPickProbeValues(baseline);
        }

        setPickProbeCompareModeState("after");
        setPickProbeOpen(true);
        refreshSelectedTargetSnapshot();
    }, [closePickProbePanelOnly, pickProbeOpen, refreshSelectedTargetSnapshot, savedProbeCompareMode, savedProbeEdits]);

    const closePickProbe = useCallback(() => {
        resetPickProbeState();
    }, [resetPickProbeState]);

    const closeContextMenuTooltip = useCallback(() => {
        setContextMenuTooltip(null);
        setContextMenuElementKey(null);
    }, []);

    const handlePickTargetRevert = useCallback(() => {
        const elementKey = contextMenuElementKey;

        closeContextMenuTooltip();

        if (!elementKey) {
            return;
        }

        const entry = savedProbeEdits[elementKey];

        if (!entry) {
            return;
        }

        revertSavedProbeEdit(elementKey);
        pushProbeSessionAction({
            kind: "style-revert",
            elementKey,
            revertedEntry: entry,
        });
    }, [closeContextMenuTooltip, contextMenuElementKey, pushProbeSessionAction, revertSavedProbeEdit, savedProbeEdits]);

    const handlePickTargetEdit = useCallback(() => {
        const element = contextMenuElementRef.current;

        closeContextMenuTooltip();

        if (!element) {
            return;
        }

        if (pickProbeOpen) {
            resetPickProbeState();
        }

        selectedElementRef.current = element;
        hoveredElementRef.current = element;
        const snapshot = toFeedbackHoverSnapshot(element);

        if (snapshot) {
            setSelectedTarget(snapshot);
        }

        openPickProbe();
    }, [closeContextMenuTooltip, openPickProbe, pickProbeOpen, resetPickProbeState]);

    const handlePickTargetDelete = useCallback(() => {
        const element = contextMenuElementRef.current;
        const elementKey = element ? getPickProbeElementKey(element) : null;

        closeContextMenuTooltip();
        resetPickProbeState();

        if (!element) {
            return;
        }

        const shouldClearDraft = draftElementRef.current === element;
        const rect = element.getBoundingClientRect();
        const deletion = elementKey ? captureSavedProbeDeletion(element, elementKey) : null;
        const previousStyleEntry = elementKey ? (savedProbeEdits[elementKey] ?? null) : null;

        contextMenuElementRef.current = null;

        if (selectedElementRef.current === element) {
            selectedElementRef.current = null;
            hoveredElementRef.current = null;
            setSelectedTarget(null);
            setHoveredTarget(null);
            setHoverPointer(null);
        }

        void playPickTargetDeleteAnimation(rect).then(() => {
            if (!element.isConnected) {
                return;
            }

            element.remove();

            if (deletion) {
                setSavedProbeDeletions((current) => [...current, deletion]);

                if (previousStyleEntry) {
                    setSavedProbeEdits((current) => {
                        const next = { ...current };
                        delete next[deletion.elementKey];

                        return next;
                    });
                }

                pushProbeSessionAction({
                    kind: "delete",
                    deletion,
                    previousStyleEntry,
                });
            }

            if (shouldClearDraft) {
                draftElementRef.current = null;
                setDraft(null);
            }
        });
    }, [closeContextMenuTooltip, pushProbeSessionAction, resetPickProbeState, savedProbeEdits]);

    useEffect(() => {
        if (mode !== "report") {
            resetPickProbeState();
            closeContextMenuTooltip();
        }
    }, [closeContextMenuTooltip, mode, resetPickProbeState]);

    const setPickProbeCompareMode = useCallback(
        (compareMode: PickProbeCompareMode) => {
            const element = selectedElementRef.current;

            if (!element || !pickProbeBaseline || !pickProbeValues) {
                return;
            }

            applyPickProbeCompareMode(element, compareMode, pickProbeBaseline, pickProbeValues);
            setPickProbeCompareModeState(compareMode);
            refreshSelectedTargetSnapshot();

            if (compareMode === "after") {
                persistPickProbeEdits();
            }
        },
        [persistPickProbeEdits, pickProbeBaseline, pickProbeValues, refreshSelectedTargetSnapshot],
    );

    const updatePickProbeValue = useCallback(
        (key: PickProbeFieldKey, value: string) => {
            const element = selectedElementRef.current;

            if (!element || !pickProbeBaseline || !pickProbeValues) {
                return;
            }

            const nextValues = {
                ...pickProbeValues,
                [key]: value,
            };

            setPickProbeValues(nextValues);

            if (pickProbeCompareMode === "after") {
                applyPickProbeValueDiff(element, pickProbeBaseline, nextValues, "after");
                refreshSelectedTargetSnapshot();
                persistPickProbeEdits({ values: nextValues });
            }
        },
        [pickProbeBaseline, pickProbeCompareMode, pickProbeValues, persistPickProbeEdits, refreshSelectedTargetSnapshot],
    );

    /** Sync text already typed on the live DOM (contentEditable / input) without rewriting the node. */
    const syncPickProbeTextFromDom = useCallback(
        (value: string) => {
            const element = selectedElementRef.current;

            if (!element || !pickProbeBaseline || !pickProbeValues) {
                return;
            }

            if (pickProbeValues.textContent === value) {
                refreshSelectedTargetSnapshot();
                return;
            }

            const nextValues = {
                ...pickProbeValues,
                textContent: value,
            };

            setPickProbeValues(nextValues);

            if (pickProbeCompareMode === "after") {
                refreshSelectedTargetSnapshot();
                // Never re-apply textContent here — that breaks IME composition (Korean/Japanese/Chinese).
                persistPickProbeEdits({ values: nextValues, skipDomApply: true });
            }
        },
        [pickProbeBaseline, pickProbeCompareMode, pickProbeValues, persistPickProbeEdits, refreshSelectedTargetSnapshot],
    );

    const syncPickProbeTextFromDomRef = useRef(syncPickProbeTextFromDom);
    syncPickProbeTextFromDomRef.current = syncPickProbeTextFromDom;

    useEffect(() => {
        if (!pickProbeOpen || !pickProbeSupportsTextFields) {
            return;
        }

        const element = selectedElementRef.current;

        if (!element || !element.isConnected) {
            return;
        }

        let isComposing = false;

        const readLiveText = () => {
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                return element.value;
            }

            return element.textContent ?? "";
        };

        const flushLiveText = () => {
            syncPickProbeTextFromDomRef.current(readLiveText());
        };

        const handleCompositionStart = () => {
            isComposing = true;
        };

        const handleCompositionEnd = () => {
            isComposing = false;
            flushLiveText();
        };

        const handleInput = (event: Event) => {
            if (isComposing || (event instanceof InputEvent && event.isComposing)) {
                return;
            }

            flushLiveText();
        };

        element.addEventListener("compositionstart", handleCompositionStart);
        element.addEventListener("compositionend", handleCompositionEnd);
        element.addEventListener("input", handleInput);

        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            window.requestAnimationFrame(() => {
                element.focus();
                element.select?.();
            });

            return () => {
                element.removeEventListener("compositionstart", handleCompositionStart);
                element.removeEventListener("compositionend", handleCompositionEnd);
                element.removeEventListener("input", handleInput);
            };
        }

        const previousContentEditable = element.getAttribute("contenteditable");
        element.setAttribute("contenteditable", "true");

        window.requestAnimationFrame(() => {
            element.focus({ preventScroll: true });
        });

        return () => {
            element.removeEventListener("compositionstart", handleCompositionStart);
            element.removeEventListener("compositionend", handleCompositionEnd);
            element.removeEventListener("input", handleInput);

            if (previousContentEditable === null) {
                element.removeAttribute("contenteditable");
            } else {
                element.setAttribute("contenteditable", previousContentEditable);
            }
        };
    }, [pickProbeOpen, pickProbeSupportsTextFields]);

    const resetPickProbeValues = useCallback(() => {
        const element = selectedElementRef.current;

        if (!element || !pickProbeBaseline || !pickProbeValues) {
            return;
        }

        setPickProbeValues(pickProbeBaseline);

        const snapshot = pickProbeOriginalSnapshotRef.current;

        if (snapshot) {
            restoreProbeElementFromSnapshot(element, snapshot);
        } else if (pickProbeHasEdits) {
            applyPickProbeCompareMode(element, pickProbeCompareMode, pickProbeBaseline, pickProbeBaseline);
        }

        persistPickProbeEdits({ values: pickProbeBaseline });
        refreshSelectedTargetSnapshot();
    }, [pickProbeBaseline, pickProbeCompareMode, pickProbeHasEdits, pickProbeValues, persistPickProbeEdits, refreshSelectedTargetSnapshot]);

    const appendSavedProbeSummaryAsNewDraftCase = useCallback(() => {
        if (!draft || Object.keys(savedProbeEdits).length === 0) {
            return;
        }

        const summary = formatSavedProbeEditsSummary(savedProbeEdits, messages);

        if (!summary) {
            return;
        }

        setDraft((current) => {
            if (!current) {
                return current;
            }

            const cases = current.cases.map((item) => ({ ...item }));
            const emptyIndex = cases.findIndex((item) => !item.text.trim());
            const targetIndex = emptyIndex >= 0 ? emptyIndex : 0;
            const target = cases[targetIndex];

            if (!target) {
                return {
                    ...current,
                    cases: [createReportCase(summary)],
                };
            }

            cases[targetIndex] = {
                ...target,
                text: target.text.trim() ? `${target.text.trim()}\n\n${summary}` : summary,
                updated_at: new Date().toISOString(),
            };

            return {
                ...current,
                cases,
            };
        });
    }, [draft, messages, savedProbeEdits, setDraft]);

    return {
        pickProbeOpen,
        pickProbeSupportsTextFields,
        pickProbeLayoutMode,
        pickProbeValues,
        pickProbeCompareMode,
        pickProbeHasEdits,
        pickTargetContextMenu,
        setContextMenuTooltip,
        contextMenuElementKey,
        setContextMenuElementKey,
        contextMenuElementRef,
        savedProbeEdits,
        savedProbeDeletions,
        hasProbeSessionChanges,
        canUndoProbeSession,
        canRedoProbeSession,
        undoProbeSessionAction,
        redoProbeSessionAction,
        savedProbeCompareMode,
        closePickProbe,
        closeContextMenuTooltip,
        handlePickTargetEdit,
        handlePickTargetDelete,
        handlePickTargetRevert,
        commitPickProbeEdits,
        revertSavedProbeEdit,
        revertAllSavedProbeEdits,
        setSavedProbeCompareMode,
        setPickProbeCompareMode,
        updatePickProbeValue,
        resetPickProbeValues,
        resetPickProbeState,
        appendSavedProbeSummaryAsNewDraftCase,
    };
}
