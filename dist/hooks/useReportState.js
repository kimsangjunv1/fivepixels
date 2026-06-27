import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureReportLocaleMessages, getReportMessages, setActiveReportMessages } from "../i18n/index.js";
import { useReportShortcuts } from "./useReportShortcuts.js";
import { useReportPersistence } from "./useReportPersistence.js";
import { useIsMobileViewport } from "./useIsMobileViewport.js";
import { useAppearancePreference } from "./useAppearancePreference.js";
import { useLocalePreference } from "./useLocalePreference.js";
import { usePersonalKey } from "./usePersonalKey.js";
import { useResolvedAppearance } from "./useResolvedAppearance.js";
import { createReplyStatusForSubmit, getFeedbackDisplayStatus, getLatestBranchRoot, getReportReplies, ISSUE_ROOT_PARENT_ID, resolveOriginalFeedbackAuthorName, resolveParentReplyIdForQuestion } from "../utils/feedbackThread.js";
import { clampRatio, getMarkerFromReport, resolveTooltipAnchor } from "../utils/coordinates.js";
import { getFeedbackTargetElement, isFeedbackTargetVisible, scrollToFeedbackTarget, waitForTargetRevealResync } from "../utils/locateFeedback.js";
const MARKER_HOVER_LEAVE_MS = 250;
const OVERLAY_HOVER_LEAVE_MS = 100;
import { findTargetByPoint, getSelectableTargets, isSameHoverTarget, resolveFeedbackDocumentAnchor, toSnapshot } from "../utils/dom.js";
import { createInitialFieldValues, getFieldError, getFieldTags } from "../utils/fields.js";
import { createReplyId } from "../utils/format.js";
import { notifyFeedbackCreate, notifyFeedbackDelete, notifyFeedbackReply, notifyFeedbackUpdate, notifyGitHubIssueCreated, } from "../utils/reportCallbacks.js";
import { buildGitHubIssueStatusUpdate, buildGitHubIssueUpdate, canCreateGitHubIssueFromList, canCreateGitHubIssueOnCreate, isGitIssued, } from "../utils/githubIntegration.js";
function resolveDefaultAuthorName(identify, authors) {
    if (identify?.name) {
        return identify.name;
    }
    return authors[0]?.name ?? "";
}
export function useReportState({ projectId, environment, appVersion, appearance, fields, authors = [], requireReviewerKey = false, shortcut: _shortcut, identify, onList, onListAll, onListReplies, onNavigate, onRevealTarget, onCreate, onCreateReply, onUpdate, onDelete, onEvent, onReply, github, routeKey, showFeedbackList, visibleShortcutKeys = false, initialLocale, messageOverrides, }) {
    const { appearance: activeAppearance, setAppearance } = useAppearancePreference(appearance);
    const { locale, setLocale } = useLocalePreference(initialLocale);
    const [localeMessagesReady, setLocaleMessagesReady] = useState(locale !== "ko");
    const messages = useMemo(() => getReportMessages(locale, messageOverrides), [locale, localeMessagesReady, messageOverrides]);
    useEffect(() => {
        if (locale !== "ko") {
            setLocaleMessagesReady(true);
            return;
        }
        let cancelled = false;
        setLocaleMessagesReady(false);
        void ensureReportLocaleMessages("ko").then(() => {
            if (!cancelled) {
                setLocaleMessagesReady(true);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [locale]);
    useEffect(() => {
        setActiveReportMessages(messages);
    }, [messages]);
    const overlayRef = useRef(null);
    const searchInputRef = useRef(null);
    const hoveredElementRef = useRef(null);
    const selectedElementRef = useRef(null);
    const hoverLeaveTimeoutRef = useRef(null);
    const overlayHoverLeaveTimeoutRef = useRef(null);
    const resolvedAppearance = useResolvedAppearance(activeAppearance);
    const isMobileViewport = useIsMobileViewport();
    const { canTransferFeedback, canListAllFeedback, currentPathname, listScope, setListScope, filters, setFilters, selectedReportId, setSelectedReportId, reports, filteredReports, currentPageFilteredReports, routeDetailsStats, selectedReport, isError, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, isCreating, isUpdating, isDeleting, queryErrorMessage, refetch, createFeedback, updateFeedback, deleteFeedback, loadRepliesIfNeeded, createReply, usesCreateReply, } = useReportPersistence({
        projectId,
        environment,
        appVersion,
        fields,
        onList,
        onListAll,
        onListReplies,
        onCreate,
        onCreateReply,
        onUpdate,
        onDelete,
        routeKey,
    });
    const eventCallbacks = useMemo(() => ({
        onEvent,
        onReply,
    }), [onEvent, onReply]);
    const { personalKey, publicKey, personalKeyRequired, personalKeyPendingRegistration, personalKeyCandidates, authorizedAuthors, issuePersonalKey, rotatePersonalKey, insertPersonalKey, signPayload, } = usePersonalKey({
        enabled: requireReviewerKey || authors.some((author) => Boolean(author.publicKey)),
        projectId,
        environment,
        identify,
        authors,
    });
    const activeIdentify = authorizedAuthors[0] ?? (personalKeyRequired ? undefined : identify);
    const signCreatePayload = async (payload) => {
        const auth = await signPayload("feedback:create", payload);
        return auth ? { ...payload, auth } : payload;
    };
    const signUpdatePayload = async (payload) => {
        if (personalKeyRequired) {
            throw new Error(messages.errors.personalKeyRequired);
        }
        const auth = await signPayload("feedback:update", payload);
        return auth ? { ...payload, auth } : payload;
    };
    const signReplyPayload = async (payload) => {
        if (personalKeyRequired) {
            throw new Error(messages.errors.personalKeyRequired);
        }
        const auth = await signPayload("reply:create", payload);
        return auth ? { ...payload, auth } : payload;
    };
    const applyGitHubIssueUpdate = async (report, result) => {
        if (usesCreateReply) {
            const updatedFeedback = await updateFeedback(report.id, await signUpdatePayload(buildGitHubIssueStatusUpdate(report, result)));
            await createReply(report.id, await signReplyPayload({
                message: messages.resolution.gitIssuedMessage,
                status: "suggested",
                author_type: "system",
            }));
            return updatedFeedback;
        }
        return updateFeedback(report.id, await signUpdatePayload(buildGitHubIssueUpdate(report, result, messages.resolution.gitIssuedMessage)));
    };
    const [mode, setMode] = useState("idle");
    const [showTargetPreview, setShowTargetPreview] = useState(false);
    const [selectableTargets, setSelectableTargets] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [draft, setDraft] = useState(null);
    const [hoveredTarget, setHoveredTarget] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
    const [activeReplyReportId, setActiveReplyReportId] = useState(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [replySubmitAsQuestion, setReplySubmitAsQuestion] = useState(false);
    const [draftAuthorName, setDraftAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
    const [replyAuthorName, setReplyAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
    const [pendingComposer, setPendingComposer] = useState(null);
    const [confirmAuthorName, setConfirmAuthorName] = useState("");
    const [showConfirmAuthorSelect, setShowConfirmAuthorSelect] = useState(false);
    const pendingLocateReportIdRef = useRef(null);
    const [editingReportId, setEditingReportId] = useState(null);
    const [editableDraft, setEditableDraft] = useState(null);
    const [panelTab, setPanelTab] = useState(null);
    const [creatingGitHubIssueId, setCreatingGitHubIssueId] = useState(null);
    const canCreateGitHubIssueFromListValue = useMemo(() => canCreateGitHubIssueFromList(github), [github]);
    const canCreateGitHubIssueOnCreateValue = useMemo(() => canCreateGitHubIssueOnCreate(github), [github]);
    const activeReplyAnchor = useMemo(() => resolveTooltipAnchor(markers, activeReplyReportId), [activeReplyReportId, markers]);
    const activeReplyReport = activeReplyAnchor?.report ?? null;
    const tooltipAnchor = useMemo(() => {
        const hoveredAnchor = resolveTooltipAnchor(markers, hoveredMarkerId);
        if (!activeReplyReportId) {
            return hoveredAnchor;
        }
        if (hoveredMarkerId && hoveredMarkerId !== activeReplyReportId) {
            return hoveredAnchor;
        }
        return activeReplyAnchor ?? hoveredAnchor;
    }, [activeReplyAnchor, activeReplyReportId, hoveredMarkerId, markers]);
    const tooltipReport = tooltipAnchor?.report ?? null;
    const tooltipFieldTags = useMemo(() => (tooltipReport ? getFieldTags(fields, tooltipReport.field_values) : []), [fields, tooltipReport]);
    const targetStats = useMemo(() => {
        let resolved = 0;
        let inProgress = 0;
        for (const report of currentPageFilteredReports) {
            const status = getFeedbackDisplayStatus(report, true);
            if (status === "resolved") {
                resolved += 1;
            }
            else if (status === "wait_for_reply" ||
                status === "additional_question" ||
                status === "suggested" ||
                status === "found_error" ||
                status === "recheck_requested") {
                inProgress += 1;
            }
        }
        const foundCount = currentPageFilteredReports.length;
        return {
            found: foundCount,
            resolved,
            inProgress,
        };
    }, [currentPageFilteredReports]);
    const statusText = useMemo(() => {
        if (mode === "report") {
            const focusTarget = selectedTarget ?? hoveredTarget;
            if (!focusTarget) {
                return "";
            }
            const typeLabel = focusTarget.type === "item" ? messages.statusText.selectedItem : messages.statusText.selectedGroup;
            return `${typeLabel}\n${focusTarget.id}`;
        }
        if (mode === "view") {
            return isFetching ? messages.statusText.loadingFeedback : messages.statusText.ready;
        }
        if (showTargetPreview) {
            return messages.statusText.showingSelectableTargets(selectableTargets.length);
        }
        if (selectableTargets.length === 0) {
            return messages.statusText.noSelectableTargets;
        }
        return messages.statusText.ready;
    }, [filteredReports.length, isFetching, hoveredTarget, messages.statusText, mode, selectableTargets.length, selectedTarget, showTargetPreview]);
    useEffect(() => {
        setDraft(null);
        setErrorMessage("");
        setHoveredTarget(null);
        setSelectedTarget(null);
        setHoveredMarkerId(null);
        setActiveReplyReportId(null);
        setReplyDraft("");
        setPendingComposer(null);
        setShowConfirmAuthorSelect(false);
        setConfirmAuthorName("");
        setDraftAuthorName(resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
        setReplyAuthorName(resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
        setEditingReportId(null);
        setEditableDraft(null);
        if (mode !== "idle") {
            setShowTargetPreview(false);
        }
        hoveredElementRef.current = null;
        selectedElementRef.current = null;
        if (hoverLeaveTimeoutRef.current) {
            window.clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = null;
        }
        if (overlayHoverLeaveTimeoutRef.current) {
            window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            overlayHoverLeaveTimeoutRef.current = null;
        }
    }, [currentPathname, mode]);
    useEffect(() => {
        setShowTargetPreview(false);
    }, [currentPathname]);
    useEffect(() => {
        return () => {
            if (hoverLeaveTimeoutRef.current) {
                window.clearTimeout(hoverLeaveTimeoutRef.current);
            }
            if (overlayHoverLeaveTimeoutRef.current) {
                window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            }
        };
    }, []);
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
    const syncMarkers = useCallback(() => {
        setMarkers(currentPageFilteredReports.map((report) => getMarkerFromReport(report, window.scrollY)));
    }, [currentPageFilteredReports]);
    useEffect(() => {
        if (mode !== "view") {
            setMarkers([]);
            return;
        }
        let cancelled = false;
        const runSync = () => {
            if (!cancelled) {
                syncMarkers();
            }
        };
        runSync();
        void waitForTargetRevealResync().then(runSync);
        let mutationSyncTimeout = null;
        const scheduleMutationSync = () => {
            if (mutationSyncTimeout !== null) {
                window.clearTimeout(mutationSyncTimeout);
            }
            mutationSyncTimeout = window.setTimeout(() => {
                mutationSyncTimeout = null;
                runSync();
            }, 50);
        };
        const mutationObserver = new MutationObserver((mutations) => {
            if (mutations.some((mutation) => mutation.type === "attributes" || mutation.type === "childList")) {
                scheduleMutationSync();
            }
        });
        mutationObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "style", "aria-hidden"],
            childList: true,
            subtree: true,
        });
        window.addEventListener("scroll", syncMarkers, { passive: true, capture: true });
        window.addEventListener("resize", syncMarkers);
        return () => {
            cancelled = true;
            if (mutationSyncTimeout !== null) {
                window.clearTimeout(mutationSyncTimeout);
            }
            mutationObserver.disconnect();
            window.removeEventListener("scroll", syncMarkers, { capture: true });
            window.removeEventListener("resize", syncMarkers);
        };
    }, [currentPathname, mode, syncMarkers]);
    const prepareFeedbackLocation = useCallback(async (report) => {
        const targetElement = getFeedbackTargetElement(report);
        if (targetElement && isFeedbackTargetVisible(targetElement)) {
            scrollToFeedbackTarget(report);
            return;
        }
        let revealed = false;
        if (onRevealTarget) {
            try {
                revealed = Boolean(await onRevealTarget(report));
            }
            catch {
                revealed = false;
            }
        }
        if (revealed) {
            await waitForTargetRevealResync();
            syncMarkers();
        }
        scrollToFeedbackTarget(report);
    }, [onRevealTarget, syncMarkers]);
    useEffect(() => {
        if (mode !== "report") {
            return;
        }
        const syncTargetRects = () => {
            setHoveredTarget(toSnapshot(hoveredElementRef.current));
            setSelectedTarget(toSnapshot(selectedElementRef.current));
        };
        window.addEventListener("scroll", syncTargetRects, { passive: true, capture: true });
        window.addEventListener("resize", syncTargetRects);
        return () => {
            window.removeEventListener("scroll", syncTargetRects, { capture: true });
            window.removeEventListener("resize", syncTargetRects);
        };
    }, [mode]);
    useEffect(() => {
        if (hoveredMarkerId && !markers.some((marker) => marker.report.id === hoveredMarkerId)) {
            setHoveredMarkerId(null);
        }
    }, [hoveredMarkerId, markers]);
    // markers (points, tooltip, reply)
    const clearHoverLeaveTimeout = () => {
        if (hoverLeaveTimeoutRef.current) {
            window.clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = null;
        }
    };
    const scheduleHoverLeave = (markerId) => {
        clearHoverLeaveTimeout();
        hoverLeaveTimeoutRef.current = window.setTimeout(() => {
            setHoveredMarkerId((current) => (current === markerId ? null : current));
            hoverLeaveTimeoutRef.current = null;
        }, MARKER_HOVER_LEAVE_MS);
    };
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
            }
            overlayHoverLeaveTimeoutRef.current = null;
        }, OVERLAY_HOVER_LEAVE_MS);
    };
    const stopEditing = () => {
        setEditingReportId(null);
        setEditableDraft(null);
    };
    const selectReport = (reportId) => {
        setSelectedReportId(reportId);
        if (editingReportId && editingReportId !== reportId) {
            stopEditing();
        }
    };
    const closeReplyComposer = () => {
        setActiveReplyReportId(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setShowConfirmAuthorSelect(false);
    };
    const showFeedbackTooltip = useCallback(async (report) => {
        await prepareFeedbackLocation(report);
        clearHoverLeaveTimeout();
        closeReplyComposer();
        setHoveredMarkerId(report.id);
    }, [clearHoverLeaveTimeout, closeReplyComposer, prepareFeedbackLocation]);
    const locateFeedback = async (reportId) => {
        const report = filteredReports.find((item) => item.id === reportId);
        if (!report) {
            return;
        }
        selectReport(reportId);
        if (report.pathname !== currentPathname) {
            pendingLocateReportIdRef.current = reportId;
            try {
                if (onNavigate) {
                    await onNavigate(report.pathname);
                }
                else if (typeof window !== "undefined") {
                    window.location.assign(report.pathname);
                }
            }
            catch (nextError) {
                pendingLocateReportIdRef.current = null;
                setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.loadFeedbackFailed);
            }
            return;
        }
        showFeedbackTooltip(report);
    };
    useEffect(() => {
        const pendingReportId = pendingLocateReportIdRef.current;
        if (!pendingReportId) {
            return;
        }
        const report = reports.find((item) => item.id === pendingReportId && item.pathname === currentPathname);
        if (!report) {
            return;
        }
        pendingLocateReportIdRef.current = null;
        window.setTimeout(() => showFeedbackTooltip(report), 0);
    }, [currentPathname, reports, showFeedbackTooltip]);
    const focusSearchInput = () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
    };
    const selectAdjacentReport = (direction) => {
        if (filteredReports.length === 0) {
            return;
        }
        const currentIndex = filteredReports.findIndex((report) => report.id === selectedReportId);
        let nextIndex;
        if (currentIndex === -1) {
            nextIndex = direction === "down" ? 0 : filteredReports.length - 1;
        }
        else {
            nextIndex = direction === "down" ? Math.min(currentIndex + 1, filteredReports.length - 1) : Math.max(currentIndex - 1, 0);
        }
        void locateFeedback(filteredReports[nextIndex].id);
    };
    const openReplyComposer = (report) => {
        selectReport(report.id);
        setActiveReplyReportId(report.id);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setReplyAuthorName(resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
        setConfirmAuthorName(resolveOriginalFeedbackAuthorName(report));
        setShowConfirmAuthorSelect(false);
        clearHoverLeaveTimeout();
    };
    const activateFeedbackMarker = useCallback(async (report) => {
        const enrichedReport = await loadRepliesIfNeeded(report);
        await prepareFeedbackLocation(enrichedReport);
        openReplyComposer(enrichedReport);
    }, [loadRepliesIfNeeded, openReplyComposer, prepareFeedbackLocation]);
    const toggleConfirmAuthorSelect = () => {
        setShowConfirmAuthorSelect((current) => !current);
    };
    const startDenyReview = () => {
        if (!activeReplyReport) {
            return;
        }
        const latestRoot = getLatestBranchRoot(getReportReplies(activeReplyReport));
        if (!latestRoot) {
            return;
        }
        setPendingComposer({
            type: latestRoot.status === "found_error" ? "recheck" : "deny",
            targetReplyId: latestRoot.id,
        });
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };
    const startCheckoutReview = (replyId) => {
        setPendingComposer({ type: "checkout", targetReplyId: replyId });
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };
    const startAskQuestion = () => {
        if (!activeReplyReport) {
            return;
        }
        const latestRoot = getLatestBranchRoot(getReportReplies(activeReplyReport));
        setReplyDraft("");
        if (!latestRoot) {
            setPendingComposer({
                type: "question",
                targetReplyId: ISSUE_ROOT_PARENT_ID,
            });
            setReplySubmitAsQuestion(true);
            return;
        }
        if (latestRoot.status === "suggested" ||
            latestRoot.status === "found_error" ||
            latestRoot.status === "recheck_requested") {
            setPendingComposer({
                type: "question",
                targetReplyId: latestRoot.id,
            });
            setReplySubmitAsQuestion(true);
        }
    };
    const cancelPendingComposer = () => {
        setPendingComposer(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };
    const toggleReportMode = () => {
        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return;
        }
        setShowTargetPreview(false);
        setMode((current) => (current === "report" ? "idle" : "report"));
    };
    const togglePanelTab = (nextTab) => {
        setPanelTab((current) => {
            if (current === nextTab) {
                return null;
            }
            return nextTab;
        });
    };
    const enableIssueMode = () => {
        setShowTargetPreview(false);
        closeReplyComposer();
        stopEditing();
        setMode("view");
    };
    const openPanelTab = (nextTab) => {
        const isClosing = panelTab === nextTab;
        setPanelTab(isClosing ? null : nextTab);
        if (!isClosing && nextTab === "feedback-list") {
            enableIssueMode();
        }
    };
    const toggleIssueMode = () => {
        setShowTargetPreview(false);
        closeReplyComposer();
        setMode((current) => (current === "view" ? "idle" : "view"));
        stopEditing();
        setSelectedReportId(filteredReports[0]?.id ?? null);
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
    // overlay (target pick, create draft, edit)
    const handleOverlayMove = (event) => {
        if (mode !== "report" || draft) {
            return;
        }
        const targetElement = findTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        hoveredElementRef.current = targetElement;
        if (!targetElement) {
            scheduleOverlayHoverLeave();
            return;
        }
        clearOverlayHoverLeaveTimeout();
        const snapshot = toSnapshot(targetElement);
        setHoveredTarget((previous) => (isSameHoverTarget(previous, snapshot) ? previous : snapshot));
    };
    const handleOverlayClick = (event) => {
        if (mode !== "report") {
            return;
        }
        const targetElement = findTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        const snapshot = toSnapshot(targetElement);
        if (!targetElement || !snapshot) {
            setErrorMessage(messages.errors.clickSelectableArea);
            return;
        }
        hoveredElementRef.current = targetElement;
        selectedElementRef.current = targetElement;
        setHoveredTarget(snapshot);
        setSelectedTarget(snapshot);
        setErrorMessage("");
        const anchorSnapshot = resolveFeedbackDocumentAnchor(targetElement);
        setDraft({
            clientX: event.clientX,
            clientY: event.clientY,
            xRatio: clampRatio(event.clientX / window.innerWidth),
            yRatio: clampRatio(event.clientY / window.innerHeight),
            elementXRatio: clampRatio((event.clientX - snapshot.rect.left) / Math.max(snapshot.rect.width, 1)),
            elementYRatio: clampRatio((event.clientY - snapshot.rect.top) / Math.max(snapshot.rect.height, 1)),
            anchorReportId: anchorSnapshot?.id ?? null,
            anchorReportType: anchorSnapshot?.type ?? null,
            anchorXRatio: anchorSnapshot
                ? clampRatio((event.clientX - anchorSnapshot.rect.left) / Math.max(anchorSnapshot.rect.width, 1))
                : null,
            anchorYRatio: anchorSnapshot
                ? clampRatio((event.clientY - anchorSnapshot.rect.top) / Math.max(anchorSnapshot.rect.height, 1))
                : null,
            scrollY: window.scrollY,
            documentY: Math.round(window.scrollY + event.clientY),
            reportId: snapshot.id,
            reportType: snapshot.type,
            message: "",
            fieldValues: createInitialFieldValues(fields),
        });
    };
    const cancelDraft = () => {
        setDraft(null);
        setSelectedTarget(null);
    };
    const updateDraftMessage = (nextMessage) => {
        setDraft((current) => (current ? { ...current, message: nextMessage } : current));
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
    };
    const buildCreatePayloadFromDraft = () => {
        if (!draft) {
            return null;
        }
        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return null;
        }
        const nextError = getFieldError(draft.message, draft.fieldValues, fields, messages.errors);
        if (nextError) {
            setErrorMessage(nextError);
            return null;
        }
        return {
            pathname: currentPathname,
            report_id: draft.reportId,
            report_type: draft.reportType,
            message: draft.message.trim(),
            status: "open",
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
            ...(activeIdentify || draftAuthorName.trim()
                ? {
                    ...(activeIdentify ? { author_id: activeIdentify.id } : {}),
                    author_name: draftAuthorName.trim() || activeIdentify?.name,
                }
                : {}),
        };
    };
    const finalizeDraftCreate = () => {
        setDraft(null);
        setSelectedTarget(null);
        setHoveredTarget(null);
        setErrorMessage("");
        setMode("view");
    };
    const handleCreateSubmit = async () => {
        const payload = buildCreatePayloadFromDraft();
        if (!payload) {
            return;
        }
        try {
            const savedFeedback = await createFeedback(await signCreatePayload(payload));
            await notifyFeedbackCreate(eventCallbacks, savedFeedback);
            finalizeDraftCreate();
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveFeedbackFailed);
        }
    };
    const handleCreateSubmitWithGitHubIssue = async () => {
        if (!github?.onCreate || !canCreateGitHubIssueOnCreateValue || creatingGitHubIssueId || isCreating) {
            return;
        }
        const payload = buildCreatePayloadFromDraft();
        if (!payload) {
            return;
        }
        setCreatingGitHubIssueId("draft");
        setErrorMessage("");
        try {
            const savedFeedback = await createFeedback(await signCreatePayload(payload));
            await notifyFeedbackCreate(eventCallbacks, savedFeedback);
            const result = await github.onCreate(savedFeedback);
            const updatedFeedback = await applyGitHubIssueUpdate(savedFeedback, result);
            await notifyGitHubIssueCreated(eventCallbacks, {
                feedback: updatedFeedback,
                issueUrl: result.issueUrl,
            });
            finalizeDraftCreate();
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.createGitHubIssueFailed);
        }
        finally {
            setCreatingGitHubIssueId(null);
        }
    };
    const startEditing = (report) => {
        if (report.status === "archived") {
            setErrorMessage(messages.errors.archivedReadOnly);
            setSelectedReportId(report.id);
            return;
        }
        setEditingReportId(report.id);
        setEditableDraft({
            message: report.message,
            status: report.status,
            fieldValues: createInitialFieldValues(fields, report.field_values),
        });
        setSelectedReportId(report.id);
    };
    const handleUpdateSubmit = async () => {
        if (!selectedReport || !editableDraft) {
            return;
        }
        if (selectedReport.status === "archived") {
            setErrorMessage(messages.errors.archivedNotEditable);
            return;
        }
        const nextError = getFieldError(editableDraft.message, editableDraft.fieldValues, fields, messages.errors);
        if (nextError) {
            setErrorMessage(nextError);
            return;
        }
        try {
            const updatedFeedback = await updateFeedback(selectedReport.id, await signUpdatePayload({
                message: editableDraft.message.trim(),
                status: editableDraft.status,
                field_values: editableDraft.fieldValues,
            }));
            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            stopEditing();
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.updateFeedbackFailed);
        }
    };
    const appendReply = async (report, reply) => {
        if (usesCreateReply) {
            await createReply(report.id, await signReplyPayload({
                message: reply.message,
                status: reply.status,
                parent_reply_id: reply.parent_reply_id,
                author_type: reply.author_type ?? "manager",
                author_name: reply.author_name,
            }));
        }
        else {
            const payload = await signUpdatePayload({
                replies: [...getReportReplies(report), reply],
            });
            await updateFeedback(report.id, payload);
        }
        await notifyFeedbackReply(eventCallbacks, {
            feedbackId: report.id,
            message: reply.message,
        });
    };
    const handleReplySubmit = async () => {
        if (!activeReplyReport) {
            return;
        }
        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return;
        }
        if (!replyDraft.trim()) {
            setErrorMessage(messages.errors.replyContentRequired);
            return;
        }
        const pendingType = pendingComposer?.type ?? null;
        const isCreatorSubmit = pendingType === "deny" || pendingType === "recheck" || pendingType === "question";
        const isQuestionSubmit = pendingType === "question";
        const authorName = isCreatorSubmit
            ? (confirmAuthorName.trim() || resolveOriginalFeedbackAuthorName(activeReplyReport))
            : replyAuthorName.trim();
        if (!authorName) {
            setErrorMessage(isCreatorSubmit ? messages.errors.reviewerRequired : messages.errors.authorRequired);
            return;
        }
        const replyMessage = replyDraft.trim();
        const replyStatus = createReplyStatusForSubmit(pendingType, isQuestionSubmit);
        const parentReplyId = replyStatus === "additional_question"
            ? resolveParentReplyIdForQuestion(activeReplyReport, pendingComposer)
            : null;
        const reply = {
            id: createReplyId(),
            message: replyMessage,
            created_at: new Date().toISOString(),
            status: replyStatus,
            ...(parentReplyId ? { parent_reply_id: parentReplyId } : {}),
            author_type: isCreatorSubmit ? "user" : "manager",
            author_name: authorName,
        };
        try {
            await appendReply(activeReplyReport, reply);
            setErrorMessage("");
            setReplyDraft("");
            if (replyStatus === "additional_question") {
                setReplySubmitAsQuestion(true);
                if (pendingType === "question" && pendingComposer) {
                    setPendingComposer({
                        type: "question",
                        targetReplyId: pendingComposer.targetReplyId,
                    });
                }
                else {
                    setPendingComposer(null);
                }
            }
            else {
                setReplySubmitAsQuestion(false);
                setPendingComposer(null);
            }
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        }
    };
    const handleConfirmResolution = async () => {
        if (!activeReplyReport) {
            return;
        }
        const resolverName = confirmAuthorName.trim() || resolveOriginalFeedbackAuthorName(activeReplyReport);
        if (!resolverName) {
            setErrorMessage(messages.errors.reviewerRequired);
            return;
        }
        try {
            if (usesCreateReply) {
                await createReply(activeReplyReport.id, await signReplyPayload({
                    message: messages.resolution.issueResolvedMessage,
                    status: "resolved",
                    author_type: "user",
                    author_name: resolverName,
                }));
                const updatedFeedback = await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                    status: "resolved",
                }));
                await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            }
            else {
                const reply = {
                    id: createReplyId(),
                    message: messages.resolution.issueResolvedMessage,
                    created_at: new Date().toISOString(),
                    status: "resolved",
                    author_type: "user",
                    author_name: resolverName,
                };
                const updatedFeedback = await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                    status: "resolved",
                    replies: [...getReportReplies(activeReplyReport), reply],
                }));
                await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            }
            setErrorMessage("");
            setPendingComposer(null);
            setReplyDraft("");
            setShowConfirmAuthorSelect(false);
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.confirmResolutionFailed);
        }
    };
    const handleCreateGitHubIssue = async (report) => {
        if (!github?.onCreate || !canCreateGitHubIssueFromListValue || creatingGitHubIssueId) {
            return;
        }
        if (isGitIssued(report)) {
            return;
        }
        setCreatingGitHubIssueId(report.id);
        setErrorMessage("");
        try {
            const result = await github.onCreate(report);
            const updatedFeedback = await applyGitHubIssueUpdate(report, result);
            await notifyGitHubIssueCreated(eventCallbacks, {
                feedback: updatedFeedback,
                issueUrl: result.issueUrl,
            });
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.createGitHubIssueFailed);
        }
        finally {
            setCreatingGitHubIssueId(null);
        }
    };
    const handleDelete = async (id) => {
        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return;
        }
        try {
            await deleteFeedback(id);
            await notifyFeedbackDelete(eventCallbacks, id);
            if (selectedReportId === id) {
                setSelectedReportId(null);
            }
            if (editingReportId === id) {
                stopEditing();
            }
            if (activeReplyReportId === id) {
                closeReplyComposer();
            }
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.deleteFeedbackFailed);
        }
    };
    useReportShortcuts({
        mode,
        draft,
        editingReportId,
        panelTab,
        showTargetPreview,
        activeReplyReportId,
        pendingComposer,
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        cancelDraft,
        cancelPendingComposer,
        closeReplyComposer,
        handleCreateSubmit,
        stopEditing,
        handleUpdateSubmit,
        focusSearchInput,
        selectAdjacentReport,
    });
    return {
        appearance: activeAppearance,
        setAppearance,
        locale,
        setLocale,
        messages,
        fields,
        authors: authorizedAuthors,
        projectId,
        environment,
        appVersion,
        currentPathname,
        showFeedbackList,
        panelTab,
        routeDetailsStats,
        canTransferFeedback,
        personalKey,
        publicKey,
        personalKeyRequired,
        personalKeyPendingRegistration,
        personalKeyCandidates,
        issuePersonalKey,
        rotatePersonalKey,
        insertPersonalKey,
        canListAllFeedback,
        visibleShortcutKeys,
        searchInputRef,
        resolvedAppearance,
        isMobileViewport,
        mode,
        showTargetPreview,
        selectableTargets,
        filters,
        setFilters,
        listScope,
        setListScope,
        reports,
        filteredReports,
        isError,
        isFetching,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isCreating,
        isUpdating,
        isDeleting,
        queryErrorMessage,
        refetch,
        errorMessage,
        setErrorMessage,
        draft,
        hoveredTarget,
        selectedTarget,
        markers,
        selectedReport,
        editingReportId,
        editableDraft,
        setEditableDraft,
        overlayRef,
        activeReplyReportId,
        activeReplyReport,
        tooltipReport,
        tooltipAnchor,
        tooltipFieldTags,
        replyDraft,
        setReplyDraft,
        replySubmitAsQuestion,
        setReplySubmitAsQuestion,
        draftAuthorName,
        setDraftAuthorName,
        replyAuthorName,
        setReplyAuthorName,
        pendingComposer,
        startDenyReview,
        startCheckoutReview,
        startAskQuestion,
        cancelPendingComposer,
        confirmAuthorName,
        setConfirmAuthorName,
        showConfirmAuthorSelect,
        toggleConfirmAuthorSelect,
        handleConfirmResolution,
        targetStats,
        statusText,
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        openPanelTab,
        togglePanelTab,
        selectReport,
        locateFeedback,
        focusSearchInput,
        selectAdjacentReport,
        openReplyComposer,
        activateFeedbackMarker,
        closeReplyComposer,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
        handleOverlayMove,
        handleOverlayClick,
        cancelDraft,
        updateDraftMessage,
        updateDraftField,
        handleCreateSubmit,
        startEditing,
        stopEditing,
        handleUpdateSubmit,
        handleReplySubmit,
        handleDelete,
        canCreateGitHubIssueFromList: canCreateGitHubIssueFromListValue,
        canCreateGitHubIssueOnCreate: canCreateGitHubIssueOnCreateValue,
        creatingGitHubIssueId,
        handleCreateGitHubIssue,
        handleCreateSubmitWithGitHubIssue,
        isDraftGitHubIssueSubmitting: creatingGitHubIssueId === "draft",
    };
}
//# sourceMappingURL=useReportState.js.map