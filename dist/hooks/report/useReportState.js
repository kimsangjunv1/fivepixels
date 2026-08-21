import { useCallback, useEffect, useMemo, useRef } from "react";
import { useReportShortcuts } from "../useReportShortcuts.js";
import { useReportAuthSession } from "./useReportAuthSession.js";
import { useReportDraftSession } from "./useReportDraftSession.js";
import { useReportMarkers } from "./useReportMarkers.js";
import { useReportMutations } from "./useReportMutations.js";
import { useReportPanelShell } from "./useReportPanelShell.js";
import { useReportReplyReview } from "./useReportReplyReview.js";
import { assembleReportContextValue } from "./assembleReportContextValue.js";
import { resolveDefaultAuthorName } from "../../utils/report/resolveDefaultAuthorName.js";
export function useReportState({ projectId, environment, appVersion, panelAppearance, tooltipAppearance, questionThreadDefault = "expanded", fields, authors = [], requireReviewerKey = false, shortcut: _shortcut, identify, onList, onListAll, onPanelBootstrap, onActivitySummary, onListReplies, onNavigate, onRevealTarget, onCreate, onCreateReply, onUpdate, onDelete, onListReviewers, onListReviewerRequests, onCreateReviewerRequest, onResolveReviewerRequest, onRegisterReviewer, onUpdateReviewer, onApiLogin, onApiRegister, onArtemisLogin, onEvent, onReply, github, routeKey, showFeedbackList, visibleShortcutKeys = false, initialLocale, messageOverrides, pixelsMode = "default", sync = "local", replyHistory, }) {
    const overlayRef = useRef(null);
    const hoveredElementRef = useRef(null);
    const selectedElementRef = useRef(null);
    const overlayHoverLeaveTimeoutRef = useRef(null);
    const panelShellBridgesRef = useRef({
        setShowTargetPreview: () => undefined,
        closeReplyComposer: () => undefined,
        stopEditing: () => undefined,
    });
    const auth = useReportAuthSession({
        projectId,
        environment,
        authors,
        identify,
        requireReviewerKey,
        pixelsMode,
        sync,
        onApiLogin,
        onApiRegister,
        onArtemisLogin,
    });
    const panel = useReportPanelShell({
        projectId,
        environment,
        appVersion,
        panelAppearance,
        tooltipAppearance,
        questionThreadDefault,
        fields,
        showFeedbackList,
        initialLocale,
        messageOverrides,
        onList,
        onListAll,
        onPanelBootstrap,
        onActivitySummary,
        onListReplies,
        onCreate,
        onCreateReply,
        onUpdate,
        onDelete,
        routeKey,
        replyHistory,
        sessionActorName: auth.sessionActor?.name ?? null,
        bridgesRef: panelShellBridgesRef,
    });
    const eventCallbacks = useMemo(() => ({
        onEvent,
        onReply,
    }), [onEvent, onReply]);
    const draft = useReportDraftSession({
        mode: panel.mode,
        setMode: panel.setMode,
        fields,
        messages: panel.messages,
        currentPathname: panel.currentPathname,
        environment,
        appVersion,
        sessionActor: auth.sessionActor,
        authorSelectionLocked: auth.authorSelectionLocked,
        activeIdentify: auth.activeIdentify,
        authorizedAuthors: auth.authorizedAuthors,
        selfName: auth.selfProfile?.name,
        setErrorMessage: panel.setErrorMessage,
        hoveredElementRef,
        selectedElementRef,
        overlayRef,
        overlayHoverLeaveTimeoutRef,
    });
    const replyBridgeRef = useRef({
        activeReplyReportId: null,
        openReplyReportIds: [],
        minimizedReplyReportIds: [],
        closeReplyComposer: () => undefined,
        closeReplyWindow: () => undefined,
        openReplyComposer: () => undefined,
        restoreOpenReplyWindows: () => undefined,
    });
    const suspendedOpenWindowsRef = useRef(null);
    const closeReplyComposerBridge = useCallback(() => {
        replyBridgeRef.current.closeReplyComposer();
    }, []);
    const closeReplyWindowBridge = useCallback((reportId) => {
        replyBridgeRef.current.closeReplyWindow(reportId);
    }, []);
    const openReplyComposerBridge = useCallback((report) => {
        replyBridgeRef.current.openReplyComposer(report);
    }, []);
    const restoreSuspendedOpenReplyWindows = useCallback((focusReport) => {
        const snapshot = suspendedOpenWindowsRef.current;
        suspendedOpenWindowsRef.current = null;
        const preferredFocusId = focusReport?.id ?? snapshot?.focusedId ?? null;
        if (snapshot && snapshot.openIds.length > 0) {
            replyBridgeRef.current.restoreOpenReplyWindows(snapshot, preferredFocusId, focusReport);
            return;
        }
        if (focusReport) {
            replyBridgeRef.current.openReplyComposer(focusReport);
        }
    }, []);
    const captureOpenReplyWindowsForDraftEdit = useCallback(() => {
        suspendedOpenWindowsRef.current = {
            openIds: [...replyBridgeRef.current.openReplyReportIds],
            minimizedIds: [...replyBridgeRef.current.minimizedReplyReportIds],
            focusedId: replyBridgeRef.current.activeReplyReportId,
        };
    }, []);
    const draftSessionBridgeRef = useRef({
        discardDraft: () => undefined,
    });
    const openReplyComposerClearingDraft = useCallback((report) => {
        draftSessionBridgeRef.current.discardDraft();
        replyBridgeRef.current.openReplyComposer(report);
    }, []);
    const mutations = useReportMutations({
        messages: panel.messages,
        fields,
        github,
        eventCallbacks,
        reports: panel.reports,
        sessionActor: auth.sessionActor,
        selectedReport: panel.selectedReport,
        selectedReportId: panel.selectedReportId,
        setSelectedReportId: panel.setSelectedReportId,
        closeReplyWindow: closeReplyWindowBridge,
        restoreSuspendedOpenReplyWindows,
        isCreating: panel.isCreating,
        createFeedback: panel.createFeedback,
        updateFeedback: panel.updateFeedback,
        deleteFeedback: panel.deleteFeedback,
        createReply: panel.createReply,
        usesCreateReply: panel.usesCreateReply,
        signCreatePayload: auth.signCreatePayload,
        signUpdatePayload: auth.signUpdatePayload,
        signReplyPayload: auth.signReplyPayload,
        setErrorMessage: panel.setErrorMessage,
        buildCreatePayloadFromDraft: draft.buildCreatePayloadFromDraft,
        finalizeDraftCreate: draft.finalizeDraftCreate,
    });
    const discardDraft = useCallback(() => {
        draft.cancelDraft();
        mutations.stopEditing();
    }, [draft, mutations]);
    draftSessionBridgeRef.current = {
        discardDraft,
    };
    const selectReport = (reportId) => {
        panel.setSelectedReportId(reportId);
        if (mutations.editingReportId && mutations.editingReportId !== reportId) {
            discardDraft();
            restoreSuspendedOpenReplyWindows(null);
        }
    };
    const cancelDraft = () => {
        const editingId = mutations.editingReportId;
        const editingReport = editingId ? (panel.reports.find((item) => item.id === editingId) ?? null) : null;
        discardDraft();
        restoreSuspendedOpenReplyWindows(editingReport);
    };
    const reply = useReportReplyReview({
        reports: panel.reports,
        allPageReports: panel.allPageReports,
        messages: panel.messages,
        fields,
        sessionActor: auth.sessionActor,
        authorSelectionLocked: auth.authorSelectionLocked,
        activeIdentify: auth.activeIdentify,
        authorizedAuthors: auth.authorizedAuthors,
        selfName: auth.selfProfile?.name,
        eventCallbacks,
        createReply: panel.createReply,
        updateFeedback: panel.updateFeedback,
        usesCreateReply: panel.usesCreateReply,
        signReplyPayload: auth.signReplyPayload,
        signUpdatePayload: auth.signUpdatePayload,
        setErrorMessage: panel.setErrorMessage,
        onSelectReport: selectReport,
    });
    replyBridgeRef.current = {
        activeReplyReportId: reply.activeReplyReportId,
        openReplyReportIds: reply.openReplyReportIds,
        minimizedReplyReportIds: reply.minimizedReplyReportIds,
        closeReplyComposer: reply.closeReplyComposer,
        closeReplyWindow: reply.closeReplyWindow,
        openReplyComposer: reply.openReplyComposer,
        restoreOpenReplyWindows: reply.restoreOpenReplyWindows,
    };
    panelShellBridgesRef.current = {
        setShowTargetPreview: draft.setShowTargetPreview,
        closeReplyComposer: reply.closeReplyComposer,
        stopEditing: mutations.stopEditing,
    };
    const markers = useReportMarkers({
        mode: panel.mode,
        messages: panel.messages,
        fields,
        currentPathname: panel.currentPathname,
        currentPageReports: panel.currentPageReports,
        reports: panel.reports,
        allPageReports: panel.allPageReports,
        selectedReportId: panel.selectedReportId,
        markerAppearanceSize: panel.markerAppearance.size,
        showMarkerTargetPreview: panel.showMarkerTargetPreview,
        showTargetPreview: draft.showTargetPreview,
        selectableTargetsLength: draft.selectableTargets.length,
        selectedTarget: draft.selectedTarget,
        hoveredTarget: draft.hoveredTarget,
        isFetching: panel.isFetching,
        isReportsLoading: panel.isReportsLoading,
        activeReplyReportId: reply.activeReplyReportId,
        minimizedReplyReportIds: reply.minimizedReplyReportIds,
        setErrorMessage: panel.setErrorMessage,
        onNavigate,
        onRevealTarget,
        selectReport,
        closeReplyComposer: closeReplyComposerBridge,
        openReplyComposer: openReplyComposerClearingDraft,
        selectCase: reply.selectCase,
        ensureIssueMode: panel.enableIssueMode,
        loadRepliesIfNeeded: panel.loadRepliesIfNeeded,
        searchInputRef: panel.searchInputRef,
    });
    const beginFeedbackEdit = (report) => {
        captureOpenReplyWindowsForDraftEdit();
        closeReplyComposerBridge();
        markers.setHoveredMarkerId(null);
        if (!mutations.beginDraftReportEdit(report)) {
            restoreSuspendedOpenReplyWindows(report);
            return;
        }
        if (!draft.beginDraftEdit(report)) {
            mutations.stopEditing();
            restoreSuspendedOpenReplyWindows(report);
        }
    };
    const authorizedAuthorId = auth.authorizedAuthors[0]?.id ?? null;
    const activeIdentifyId = auth.activeIdentify?.id ?? null;
    const activeIdentifyName = auth.activeIdentify?.name ?? null;
    useEffect(() => {
        draft.setDraft(null);
        panel.setErrorMessage("");
        draft.setHoveredTarget(null);
        draft.setSelectedTarget(null);
        markers.setHoveredMarkerId(null);
        reply.setReplyDraft("");
        reply.setReplyMentions([]);
        reply.setMentionHighlightTarget(null);
        reply.setPendingComposer(null);
        reply.setShowConfirmAuthorSelect(false);
        reply.setConfirmAuthorName("");
        draft.setDraftAuthorName(auth.sessionActor?.name ?? resolveDefaultAuthorName(auth.activeIdentify, auth.authorizedAuthors, auth.selfProfile?.name));
        if (!auth.isPresentationMode) {
            reply.setReplyAuthorNameRaw(auth.sessionActor?.name ?? resolveDefaultAuthorName(auth.activeIdentify, auth.authorizedAuthors, auth.selfProfile?.name));
        }
        mutations.setEditingReportId(null);
        mutations.setEditableDraft(null);
        suspendedOpenWindowsRef.current = null;
        if (panel.mode !== "idle") {
            draft.setShowTargetPreview(false);
        }
        hoveredElementRef.current = null;
        selectedElementRef.current = null;
        markers.clearHoverLeaveTimeout();
        if (overlayHoverLeaveTimeoutRef.current) {
            window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            overlayHoverLeaveTimeoutRef.current = null;
        }
    }, [panel.currentPathname, panel.mode, activeIdentifyId, activeIdentifyName, authorizedAuthorId, auth.isPresentationMode, auth.sessionActor?.name, auth.selfProfile?.authorId, auth.selfProfile?.name]);
    useEffect(() => {
        return () => {
            if (overlayHoverLeaveTimeoutRef.current) {
                window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            }
        };
    }, []);
    useReportShortcuts({
        mode: panel.mode,
        draft: draft.draft,
        editingReportId: mutations.editingReportId,
        panelTab: panel.panelTab,
        showTargetPreview: draft.showTargetPreview,
        activeReplyReportId: reply.activeReplyReportId,
        pendingComposer: reply.pendingComposer,
        pickProbeOpen: draft.pickProbeOpen,
        toggleReportMode: panel.toggleReportMode,
        toggleTargetPreview: draft.toggleTargetPreview,
        toggleIssueMode: panel.toggleIssueMode,
        cancelDraft,
        cancelPendingComposer: reply.cancelPendingComposer,
        closePickProbe: draft.closePickProbe,
        closeReplyComposer: reply.closeReplyComposer,
        handleCreateSubmit: mutations.handleCreateSubmit,
        stopEditing: mutations.stopEditing,
        handleUpdateSubmit: mutations.handleUpdateSubmit,
        focusSearchInput: markers.focusSearchInput,
        selectAdjacentReport: markers.selectAdjacentReport,
    });
    return assembleReportContextValue({
        panel,
        auth,
        draft,
        markers,
        mutations,
        reply,
        fields,
        projectId,
        environment,
        appVersion,
        showFeedbackList,
        teamReviewers: authors,
        onListReviewers,
        onListReviewerRequests,
        onCreateReviewerRequest,
        onResolveReviewerRequest,
        onRegisterReviewer,
        onUpdateReviewer,
        onPanelBootstrap,
        onActivitySummary,
        visibleShortcutKeys,
        overlayRef,
        replyHistory,
        selectReport,
        beginFeedbackEdit,
        cancelDraft,
    });
}
//# sourceMappingURL=useReportState.js.map