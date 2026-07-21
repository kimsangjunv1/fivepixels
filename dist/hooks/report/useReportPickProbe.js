import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toFeedbackHoverSnapshot } from "../../utils/shared/dom.js";
import { shouldInspectFontStyle } from "../../utils/probe/pickTargetInspect.js";
import { applyPickProbeCompareMode, applyPickProbeValueDiff, capturePickProbeValues, formatSavedProbeEditsSummary, getProposedChanges } from "../../utils/probe/pickProbe.js";
import { applySavedProbeEditsCompareMode, captureProbeOriginalSnapshot, captureSavedProbeDeletion, createSavedProbeEntry, restoreProbeElementFromSnapshot, findElementByProbeKey, getPickProbeElementKey, restoreProbeElementOriginal, } from "../../utils/probe/pickProbeSession.js";
import { playPickTargetDeleteAnimation } from "../../utils/probe/pickTargetDeleteAnimation.js";
import { getPickProbeLayoutMode } from "../../utils/probe/probeLayout.js";
import { createReportCase } from "../../utils/report/reportCases.js";
import { usePickProbeSessionHistory } from "./usePickProbeSessionHistory.js";
export function useReportPickProbe({ mode, selectedElementRef, hoveredElementRef, draftElementRef, setSelectedTarget, setHoveredTarget, setHoverPointer, setDraft, draft, messages, }) {
    const [pickProbeOpen, setPickProbeOpen] = useState(false);
    const [pickProbeBaseline, setPickProbeBaseline] = useState(null);
    const [pickProbeValues, setPickProbeValues] = useState(null);
    const [pickProbeSupportsTextFields, setPickProbeSupportsTextFields] = useState(false);
    const [pickProbeLayoutMode, setPickProbeLayoutMode] = useState(null);
    const [pickProbeCompareMode, setPickProbeCompareModeState] = useState("after");
    const [pickTargetContextMenu, setPickTargetContextMenu] = useState(null);
    const [contextMenuElementKey, setContextMenuElementKey] = useState(null);
    const [savedProbeEdits, setSavedProbeEdits] = useState({});
    const [savedProbeCompareMode, setSavedProbeCompareModeState] = useState("after");
    const { savedProbeDeletions, setSavedProbeDeletions, pushProbeSessionAction, undoProbeSessionAction, redoProbeSessionAction, revertAllSavedProbeEdits, canUndoProbeSession, canRedoProbeSession, hasProbeSessionChanges, } = usePickProbeSessionHistory({
        setSavedProbeEdits,
        setSavedProbeCompareModeState,
    });
    const pickProbeRestoreRef = useRef(null);
    const pickProbeOriginalSnapshotRef = useRef(null);
    const pickProbeElementKeyRef = useRef(null);
    const contextMenuElementRef = useRef(null);
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
    const revertSavedProbeEdit = useCallback((elementKey) => {
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
    }, [closePickProbePanelOnly]);
    const setSavedProbeCompareMode = useCallback((compareMode) => {
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
    const persistPickProbeEdits = useCallback((options) => {
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
        applyPickProbeCompareMode(element, savedProbeCompareMode, pickProbeBaseline, values);
        const nextEntry = createSavedProbeEntry(elementKey, pickProbeBaseline, values, originalSnapshot?.style ?? pickProbeRestoreRef.current?.style ?? null, originalSnapshot?.textContent ?? pickProbeRestoreRef.current?.textContent ?? pickProbeBaseline.textContent, existing, originalSnapshot?.innerHTML ?? null, originalSnapshot?.inputValue ?? null);
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
    }, [
        closePickProbePanelOnly,
        pickProbeBaseline,
        pickProbeLayoutMode,
        pickProbeSupportsTextFields,
        pickProbeValues,
        pushProbeSessionAction,
        refreshSelectedTargetSnapshot,
        savedProbeCompareMode,
        savedProbeEdits,
    ]);
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
        }
        else {
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
    const closePickTargetContextMenu = useCallback(() => {
        setPickTargetContextMenu(null);
        setContextMenuElementKey(null);
    }, []);
    const handlePickTargetRevert = useCallback(() => {
        const elementKey = contextMenuElementKey;
        closePickTargetContextMenu();
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
    }, [closePickTargetContextMenu, contextMenuElementKey, pushProbeSessionAction, revertSavedProbeEdit, savedProbeEdits]);
    const handlePickTargetEdit = useCallback(() => {
        const element = contextMenuElementRef.current;
        closePickTargetContextMenu();
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
    }, [closePickTargetContextMenu, openPickProbe, pickProbeOpen, resetPickProbeState]);
    const handlePickTargetDelete = useCallback(() => {
        const element = contextMenuElementRef.current;
        const elementKey = element ? getPickProbeElementKey(element) : null;
        closePickTargetContextMenu();
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
    }, [closePickTargetContextMenu, pushProbeSessionAction, resetPickProbeState, savedProbeEdits]);
    useEffect(() => {
        if (mode !== "report") {
            resetPickProbeState();
            closePickTargetContextMenu();
        }
    }, [closePickTargetContextMenu, mode, resetPickProbeState]);
    const setPickProbeCompareMode = useCallback((compareMode) => {
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
    }, [persistPickProbeEdits, pickProbeBaseline, pickProbeValues, refreshSelectedTargetSnapshot]);
    const updatePickProbeValue = useCallback((key, value) => {
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
    }, [pickProbeBaseline, pickProbeCompareMode, pickProbeValues, persistPickProbeEdits, refreshSelectedTargetSnapshot]);
    const resetPickProbeValues = useCallback(() => {
        const element = selectedElementRef.current;
        if (!element || !pickProbeBaseline || !pickProbeValues) {
            return;
        }
        setPickProbeValues(pickProbeBaseline);
        const snapshot = pickProbeOriginalSnapshotRef.current;
        if (snapshot) {
            restoreProbeElementFromSnapshot(element, snapshot);
        }
        else if (pickProbeHasEdits) {
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
        setPickTargetContextMenu,
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
        closePickTargetContextMenu,
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
//# sourceMappingURL=useReportPickProbe.js.map