import { useCallback, useEffect, useRef, useState } from "react";
import { clampRatio } from "../../utils/marker/coordinates.js";
import { findPickTargetByPoint, getSelectableTargets, isSameHoverTarget, resolveFeedbackDocumentAnchor, toFeedbackHoverSnapshot } from "../../utils/shared/dom.js";
import { createInitialFieldValues, getFieldError } from "../../utils/report/fields.js";
import { getPickProbeElementKey } from "../../utils/probe/pickProbeSession.js";
import { createReportCase } from "../../utils/report/reportCases.js";
import { resolveDefaultAuthorName } from "../../utils/report/resolveDefaultAuthorName.js";
import { buildDraftFromReport } from "../../utils/report/buildDraftFromReport.js";
import { useReportPickProbe } from "./useReportPickProbe.js";
const OVERLAY_HOVER_LEAVE_MS = 100;
export function useReportDraftSession({ mode, setMode, fields, messages, currentPathname, environment, appVersion, sessionActor, authorSelectionLocked, activeIdentify, authorizedAuthors, selfName, setErrorMessage, hoveredElementRef, selectedElementRef, overlayRef, overlayHoverLeaveTimeoutRef, }) {
    const [showTargetPreview, setShowTargetPreview] = useState(false);
    const [selectableTargets, setSelectableTargets] = useState([]);
    const [draft, setDraft] = useState(null);
    const [hoveredTarget, setHoveredTarget] = useState(null);
    const [hoverPointer, setHoverPointer] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [draftStep, setDraftStep] = useState("content");
    const draftElementRef = useRef(null);
    const { pickProbeOpen, pickProbeSupportsTextFields, pickProbeLayoutMode, pickProbeValues, pickProbeCompareMode, pickProbeHasEdits, pickTargetContextMenu, setPickTargetContextMenu, contextMenuElementKey, setContextMenuElementKey, contextMenuElementRef, savedProbeEdits, savedProbeDeletions, hasProbeSessionChanges, canUndoProbeSession, canRedoProbeSession, undoProbeSessionAction, redoProbeSessionAction, savedProbeCompareMode, closePickProbe, closePickTargetContextMenu, handlePickTargetEdit, handlePickTargetDelete, handlePickTargetRevert, commitPickProbeEdits, revertSavedProbeEdit, revertAllSavedProbeEdits, setSavedProbeCompareMode, setPickProbeCompareMode, updatePickProbeValue, resetPickProbeValues, resetPickProbeState, appendSavedProbeSummaryAsNewDraftCase, } = useReportPickProbe({
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
    });
    const [draftAuthorName, setDraftAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfName));
    useEffect(() => {
        if (!sessionActor?.name) {
            return;
        }
        setDraftAuthorName(sessionActor.name);
    }, [sessionActor?.id, sessionActor?.name]);
    const setDraftAuthorNameSafe = useCallback((name) => {
        if (authorSelectionLocked && sessionActor?.name) {
            setDraftAuthorName(sessionActor.name);
            return;
        }
        setDraftAuthorName(name);
    }, [authorSelectionLocked, sessionActor?.name]);
    useEffect(() => {
        setShowTargetPreview(false);
    }, [currentPathname]);
    useEffect(() => {
        return () => {
            if (overlayHoverLeaveTimeoutRef.current) {
                window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            }
        };
    }, [overlayHoverLeaveTimeoutRef]);
    useEffect(() => {
        const syncSelectableTargets = () => {
            setSelectableTargets(getSelectableTargets());
        };
        syncSelectableTargets();
        window.addEventListener("scroll", syncSelectableTargets, { passive: true, capture: true });
        window.addEventListener("resize", syncSelectableTargets);
        return () => {
            window.removeEventListener("scroll", syncSelectableTargets, { capture: true });
            window.removeEventListener("resize", syncSelectableTargets);
        };
    }, [currentPathname]);
    useEffect(() => {
        if (!showTargetPreview) {
            return;
        }
        const syncPreviewRects = () => {
            setSelectableTargets(getSelectableTargets());
        };
        window.addEventListener("scroll", syncPreviewRects, { passive: true, capture: true });
        window.addEventListener("resize", syncPreviewRects);
        return () => {
            window.removeEventListener("scroll", syncPreviewRects, { capture: true });
            window.removeEventListener("resize", syncPreviewRects);
        };
    }, [showTargetPreview]);
    useEffect(() => {
        if (mode !== "report") {
            return;
        }
        const syncTargetRects = () => {
            setHoveredTarget(toFeedbackHoverSnapshot(hoveredElementRef.current));
            setSelectedTarget(toFeedbackHoverSnapshot(selectedElementRef.current));
        };
        window.addEventListener("scroll", syncTargetRects, { passive: true, capture: true });
        window.addEventListener("resize", syncTargetRects);
        return () => {
            window.removeEventListener("scroll", syncTargetRects, { capture: true });
            window.removeEventListener("resize", syncTargetRects);
        };
    }, [hoveredElementRef, mode, selectedElementRef]);
    const clearOverlayHoverLeaveTimeout = () => {
        if (overlayHoverLeaveTimeoutRef.current) {
            window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            overlayHoverLeaveTimeoutRef.current = null;
        }
    };
    const scheduleOverlayHoverLeave = () => {
        if (overlayHoverLeaveTimeoutRef.current) {
            return;
        }
        overlayHoverLeaveTimeoutRef.current = window.setTimeout(() => {
            if (!hoveredElementRef.current) {
                setHoveredTarget(null);
                setHoverPointer(null);
            }
            overlayHoverLeaveTimeoutRef.current = null;
        }, OVERLAY_HOVER_LEAVE_MS);
    };
    const toggleTargetPreview = () => {
        setShowTargetPreview((current) => {
            const next = !current;
            if (next) {
                setMode("idle");
            }
            return next;
        });
    };
    const handleOverlayMove = (event) => {
        if (mode !== "report" || draft) {
            return;
        }
        const targetElement = findPickTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        hoveredElementRef.current = targetElement;
        if (!targetElement) {
            scheduleOverlayHoverLeave();
            return;
        }
        clearOverlayHoverLeaveTimeout();
        setHoverPointer({ clientX: event.clientX, clientY: event.clientY });
        const snapshot = toFeedbackHoverSnapshot(targetElement);
        setHoveredTarget((previous) => (isSameHoverTarget(previous, snapshot) ? previous : snapshot));
    };
    const handleOverlayContextMenu = (event) => {
        if (mode !== "report") {
            return;
        }
        event.preventDefault();
        const targetElement = findPickTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        if (!targetElement) {
            closePickTargetContextMenu();
            return;
        }
        const snapshot = toFeedbackHoverSnapshot(targetElement);
        if (!snapshot) {
            closePickTargetContextMenu();
            return;
        }
        const elementKey = getPickProbeElementKey(targetElement);
        contextMenuElementRef.current = targetElement;
        setContextMenuElementKey(elementKey);
        if (!draft) {
            selectedElementRef.current = targetElement;
            hoveredElementRef.current = targetElement;
            setSelectedTarget(snapshot);
        }
        setPickTargetContextMenu({
            clientX: event.clientX,
            clientY: event.clientY,
        });
    };
    const handleOverlayClick = (event) => {
        if (mode !== "report") {
            return;
        }
        closePickTargetContextMenu();
        resetPickProbeState();
        const targetElement = findPickTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        if (!targetElement) {
            setErrorMessage(messages.errors.clickPickTarget);
            return;
        }
        const anchorSnapshot = resolveFeedbackDocumentAnchor(targetElement);
        const snapshot = toFeedbackHoverSnapshot(targetElement);
        const isTagged = snapshot?.isTagged ?? false;
        if (!snapshot) {
            setErrorMessage(messages.errors.clickPickTarget);
            return;
        }
        hoveredElementRef.current = targetElement;
        selectedElementRef.current = targetElement;
        draftElementRef.current = targetElement;
        setHoverPointer(null);
        setHoveredTarget(null);
        setSelectedTarget(snapshot);
        setDraftStep("content");
        setErrorMessage("");
        setDraft({
            clientX: event.clientX,
            clientY: event.clientY,
            xRatio: clampRatio(event.clientX / window.innerWidth),
            yRatio: clampRatio(event.clientY / window.innerHeight),
            elementXRatio: clampRatio((event.clientX - snapshot.rect.left) / Math.max(snapshot.rect.width, 1)),
            elementYRatio: clampRatio((event.clientY - snapshot.rect.top) / Math.max(snapshot.rect.height, 1)),
            anchorReportId: anchorSnapshot?.id ?? null,
            anchorReportType: anchorSnapshot?.type ?? null,
            anchorXRatio: anchorSnapshot ? clampRatio((event.clientX - anchorSnapshot.rect.left) / Math.max(anchorSnapshot.rect.width, 1)) : null,
            anchorYRatio: anchorSnapshot ? clampRatio((event.clientY - anchorSnapshot.rect.top) / Math.max(anchorSnapshot.rect.height, 1)) : null,
            scrollY: window.scrollY,
            documentY: Math.round(window.scrollY + event.clientY),
            reportId: snapshot.id,
            reportType: snapshot.type,
            targetSelector: isTagged ? null : (snapshot.targetSelector ?? null),
            suggestedReportId: isTagged ? null : (snapshot.suggestedReportId ?? snapshot.id),
            cases: [createReportCase("")],
            category: null,
            fieldValues: createInitialFieldValues(fields),
        });
    };
    const cancelDraft = () => {
        resetPickProbeState();
        draftElementRef.current = null;
        contextMenuElementRef.current = null;
        setDraft(null);
        setDraftStep("content");
        setSelectedTarget(null);
        setHoverPointer(null);
    };
    const beginDraftEdit = (report) => {
        if (report.status === "archived") {
            setErrorMessage(messages.errors.archivedReadOnly);
            return false;
        }
        resetPickProbeState();
        draftElementRef.current = null;
        contextMenuElementRef.current = null;
        setSelectedTarget(null);
        setHoveredTarget(null);
        setHoverPointer(null);
        setDraftStep("content");
        setErrorMessage("");
        setDraft(buildDraftFromReport(report, fields));
        return true;
    };
    const updateDraftCase = (caseId, text) => {
        setDraft((current) => {
            if (!current) {
                return current;
            }
            return {
                ...current,
                cases: current.cases.map((item) => (item.id === caseId ? { ...item, text } : item)),
            };
        });
        setErrorMessage("");
    };
    const updateDraftCategory = (category) => {
        setDraft((current) => current
            ? {
                ...current,
                category,
            }
            : current);
        if (category) {
            setErrorMessage("");
        }
    };
    const addDraftCase = () => {
        setDraft((current) => current
            ? {
                ...current,
                cases: [...current.cases, createReportCase("")],
            }
            : current);
        setErrorMessage("");
    };
    const removeDraftCase = (caseId) => {
        setDraft((current) => {
            if (!current || current.cases.length <= 1) {
                return current;
            }
            return {
                ...current,
                cases: current.cases.filter((item) => item.id !== caseId),
            };
        });
        setErrorMessage("");
    };
    const updateDraftField = (key, nextValue) => {
        setDraft((current) => current
            ? {
                ...current,
                fieldValues: {
                    ...current.fieldValues,
                    [key]: nextValue,
                },
            }
            : current);
        setErrorMessage("");
    };
    const buildCreatePayloadFromDraft = () => {
        if (!draft) {
            return null;
        }
        const nextError = getFieldError(draft.cases, draft.fieldValues, fields, messages.errors);
        if (nextError) {
            setErrorMessage(nextError);
            return null;
        }
        if (!draft.category) {
            setErrorMessage(messages.errors.categoryRequired);
            return null;
        }
        if (!sessionActor) {
            setErrorMessage(messages.errors.authorRequired);
            return null;
        }
        const cases = draft.cases.map((item) => ({
            ...item,
            text: item.text.trim(),
            updated_at: new Date().toISOString(),
        }));
        return {
            pathname: currentPathname,
            report_id: draft.reportId,
            report_type: draft.reportType,
            ...(draft.targetSelector ? { target_selector: draft.targetSelector } : {}),
            cases,
            status: "open",
            category: draft.category,
            field_values: draft.fieldValues,
            position: {
                target: {
                    x: draft.elementXRatio,
                    y: draft.elementYRatio,
                },
                viewport: {
                    x: draft.xRatio,
                    y: draft.yRatio,
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
                scrollY: draft.scrollY,
                anchor: draft.anchorReportId && draft.anchorReportType && draft.anchorXRatio !== null && draft.anchorYRatio !== null
                    ? {
                        reportId: draft.anchorReportId,
                        reportType: draft.anchorReportType,
                        x: draft.anchorXRatio,
                        y: draft.anchorYRatio,
                    }
                    : null,
            },
            ...(environment ? { environment } : {}),
            ...(appVersion ? { app_version: appVersion } : {}),
            ...(sessionActor
                ? {
                    author_id: sessionActor.id,
                    author_name: sessionActor.name,
                }
                : {}),
        };
    };
    const finalizeDraftCreate = () => {
        resetPickProbeState();
        draftElementRef.current = null;
        contextMenuElementRef.current = null;
        setDraft(null);
        setDraftStep("content");
        setSelectedTarget(null);
        setHoveredTarget(null);
        setHoverPointer(null);
        setErrorMessage("");
        setMode("view");
    };
    return {
        showTargetPreview,
        setShowTargetPreview,
        selectableTargets,
        draft,
        setDraft,
        hoveredTarget,
        setHoveredTarget,
        hoverPointer,
        setHoverPointer,
        selectedTarget,
        setSelectedTarget,
        draftStep,
        setDraftStep,
        draftElementRef,
        draftAuthorName,
        setDraftAuthorName,
        setDraftAuthorNameSafe,
        pickProbeOpen,
        pickProbeSupportsTextFields,
        pickProbeLayoutMode,
        pickProbeValues,
        pickProbeCompareMode,
        pickProbeHasEdits,
        pickTargetContextMenu,
        contextMenuElementKey,
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
        clearOverlayHoverLeaveTimeout,
        toggleTargetPreview,
        handleOverlayMove,
        handleOverlayContextMenu,
        handleOverlayClick,
        cancelDraft,
        beginDraftEdit,
        updateDraftCase,
        updateDraftCategory,
        addDraftCase,
        removeDraftCase,
        updateDraftField,
        buildCreatePayloadFromDraft,
        finalizeDraftCreate,
    };
}
//# sourceMappingURL=useReportDraftSession.js.map