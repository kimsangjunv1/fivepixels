import { useCallback, useEffect, useMemo, useRef } from "react";
import { useReportShortcuts } from "../useReportShortcuts.js";
import { useReportAuthSession } from "./useReportAuthSession.js";
import { useReportDraftSession } from "./useReportDraftSession.js";
import { useReportMarkers } from "./useReportMarkers.js";
import { useReportMutations } from "./useReportMutations.js";
import { useReportPanelShell } from "./useReportPanelShell.js";
import { useReportReplyReview } from "./useReportReplyReview.js";
import { resolveDefaultAuthorName } from "../../utils/report/resolveDefaultAuthorName.js";
export function useReportState({ projectId, environment, appVersion, panelAppearance, tooltipAppearance, questionThreadDefault = "expanded", fields, authors = [], requireReviewerKey = false, shortcut: _shortcut, identify, onList, onListAll, onPanelBootstrap, onActivitySummary, onListReplies, onNavigate, onRevealTarget, onCreate, onCreateReply, onUpdate, onDelete, onEvent, onReply, github, routeKey, showFeedbackList, visibleShortcutKeys = false, initialLocale, messageOverrides, pixelsMode = "default", replyHistory, }) {
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
        closeReplyComposer: () => undefined,
        openReplyComposer: () => undefined,
    });
    const closeReplyComposerBridge = useCallback(() => {
        replyBridgeRef.current.closeReplyComposer();
    }, []);
    const openReplyComposerBridge = useCallback((report) => {
        replyBridgeRef.current.openReplyComposer(report);
    }, []);
    const mutations = useReportMutations({
        messages: panel.messages,
        fields,
        github,
        eventCallbacks,
        selectedReport: panel.selectedReport,
        selectedReportId: panel.selectedReportId,
        setSelectedReportId: panel.setSelectedReportId,
        getActiveReplyReportId: () => replyBridgeRef.current.activeReplyReportId,
        closeReplyComposer: closeReplyComposerBridge,
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
    const selectReport = (reportId) => {
        panel.setSelectedReportId(reportId);
        if (mutations.editingReportId && mutations.editingReportId !== reportId) {
            mutations.stopEditing();
        }
    };
    const reply = useReportReplyReview({
        reports: panel.reports,
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
        closeReplyComposer: reply.closeReplyComposer,
        openReplyComposer: reply.openReplyComposer,
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
        currentPageFilteredReports: panel.currentPageFilteredReports,
        filteredReports: panel.filteredReports,
        reports: panel.reports,
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
        setErrorMessage: panel.setErrorMessage,
        onNavigate,
        onRevealTarget,
        selectReport,
        closeReplyComposer: closeReplyComposerBridge,
        openReplyComposer: openReplyComposerBridge,
        loadRepliesIfNeeded: panel.loadRepliesIfNeeded,
        searchInputRef: panel.searchInputRef,
    });
    const authorizedAuthorId = auth.authorizedAuthors[0]?.id ?? null;
    const activeIdentifyId = auth.activeIdentify?.id ?? null;
    const activeIdentifyName = auth.activeIdentify?.name ?? null;
    useEffect(() => {
        draft.setDraft(null);
        panel.setErrorMessage("");
        draft.setHoveredTarget(null);
        draft.setSelectedTarget(null);
        markers.setHoveredMarkerId(null);
        reply.setActiveReplyReportId(null);
        reply.setReplyDraft("");
        reply.setPendingComposer(null);
        reply.setShowConfirmAuthorSelect(false);
        reply.setConfirmAuthorName("");
        draft.setDraftAuthorName(auth.sessionActor?.name ?? resolveDefaultAuthorName(auth.activeIdentify, auth.authorizedAuthors, auth.selfProfile?.name));
        if (!auth.isPresentationMode) {
            reply.setReplyAuthorNameRaw(auth.sessionActor?.name ?? resolveDefaultAuthorName(auth.activeIdentify, auth.authorizedAuthors, auth.selfProfile?.name));
        }
        mutations.setEditingReportId(null);
        mutations.setEditableDraft(null);
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
        cancelDraft: draft.cancelDraft,
        cancelPendingComposer: reply.cancelPendingComposer,
        closePickProbe: draft.closePickProbe,
        closeReplyComposer: reply.closeReplyComposer,
        handleCreateSubmit: mutations.handleCreateSubmit,
        stopEditing: mutations.stopEditing,
        handleUpdateSubmit: mutations.handleUpdateSubmit,
        focusSearchInput: markers.focusSearchInput,
        selectAdjacentReport: markers.selectAdjacentReport,
    });
    return {
        panelAppearance: panel.panelAppearance,
        setPanelAppearance: panel.setPanelAppearance,
        tooltipAppearance: panel.tooltipAppearance,
        setTooltipAppearance: panel.setTooltipAppearance,
        questionThreadDisplay: panel.questionThreadDisplay,
        setQuestionThreadDisplay: panel.setQuestionThreadDisplay,
        locale: panel.locale,
        setLocale: panel.setLocale,
        messages: panel.messages,
        fields,
        authors: auth.authorizedAuthors,
        projectId,
        environment,
        appVersion,
        currentPathname: panel.currentPathname,
        showFeedbackList,
        panelTab: panel.panelTab,
        routeDetailsStats: panel.routeDetailsStats,
        panelCollapsed: panel.panelCollapsed,
        setPanelCollapsed: panel.setPanelCollapsed,
        onPanelBootstrap,
        canTransferFeedback: panel.canTransferFeedback,
        personalKey: auth.personalKey,
        publicKey: auth.publicKey,
        personalKeyRequired: auth.personalKeyRequired,
        personalKeyCandidates: auth.personalKeyCandidates,
        authDiagnostics: auth.authDiagnostics,
        authorSelectionLocked: auth.authorSelectionLocked,
        panelView: auth.panelView,
        completeOnboarding: auth.completeOnboarding,
        restoreFromBackup: auth.restoreFromBackup,
        skipOnboarding: auth.skipOnboarding,
        selfProfile: auth.selfProfile,
        issuePersonalKey: auth.issuePersonalKey,
        rotatePersonalKey: auth.rotatePersonalKey,
        insertPersonalKey: auth.insertPersonalKey,
        canListAllFeedback: panel.canListAllFeedback,
        onActivitySummary,
        visibleShortcutKeys,
        searchInputRef: panel.searchInputRef,
        resolvedPanelAppearance: panel.resolvedPanelAppearance,
        resolvedTooltipAppearance: panel.resolvedTooltipAppearance,
        isMobileViewport: panel.isMobileViewport,
        mode: panel.mode,
        showTargetPreview: draft.showTargetPreview,
        showMarkerTargetPreview: panel.showMarkerTargetPreview,
        setShowMarkerTargetPreview: panel.setShowMarkerTargetPreview,
        toggleMarkerTargetPreview: panel.toggleMarkerTargetPreview,
        markerAppearance: panel.markerAppearance,
        setMarkerAppearance: panel.setMarkerAppearance,
        setMarkerSize: panel.setMarkerSize,
        setMarkerShape: panel.setMarkerShape,
        setMarkerColors: panel.setMarkerColors,
        setMarkerColor: panel.setMarkerColor,
        typography: panel.typography,
        setTypography: panel.setTypography,
        setFontSize: panel.setFontSize,
        setFontFamily: panel.setFontFamily,
        activeMarkerTarget: markers.activeMarkerTarget,
        markerPreviewTargets: markers.markerPreviewTargets,
        selectableTargets: draft.selectableTargets,
        filters: panel.filters,
        setFilters: panel.setFilters,
        listScope: panel.listScope,
        setListScope: panel.setListScope,
        reports: panel.reports,
        currentPageReports: panel.currentPageReports,
        allPageReports: panel.allPageReports,
        filteredReports: panel.filteredReports,
        isError: panel.isError,
        isFetching: panel.isFetching,
        hasNextPage: panel.hasNextPage,
        isFetchingNextPage: panel.isFetchingNextPage,
        fetchNextPage: panel.fetchNextPage,
        isCreating: panel.isCreating,
        isUpdating: panel.isUpdating,
        isSubmittingReply: reply.isSubmittingReply,
        isClaimingAssignee: reply.isClaimingAssignee,
        isDeleting: panel.isDeleting,
        queryErrorMessage: panel.queryErrorMessage,
        refetch: panel.refetch,
        replyHistory,
        replyHistoryByReportId: panel.replyHistoryByReportId,
        loadRepliesIfNeeded: panel.loadRepliesIfNeeded,
        loadOlderReplies: panel.loadOlderReplies,
        goToOlderPaginationPage: panel.goToOlderPaginationPage,
        goToNewerPaginationPage: panel.goToNewerPaginationPage,
        errorMessage: panel.errorMessage,
        setErrorMessage: panel.setErrorMessage,
        draft: draft.draft,
        hoveredTarget: draft.hoveredTarget,
        hoverPointer: draft.hoverPointer,
        selectedTarget: draft.selectedTarget,
        pickProbeOpen: draft.pickProbeOpen,
        pickProbeSupportsTextFields: draft.pickProbeSupportsTextFields,
        pickProbeLayoutMode: draft.pickProbeLayoutMode,
        pickProbeValues: draft.pickProbeValues,
        pickProbeCompareMode: draft.pickProbeCompareMode,
        pickProbeHasEdits: draft.pickProbeHasEdits,
        pickTargetContextMenu: draft.pickTargetContextMenu,
        contextMenuElementKey: draft.contextMenuElementKey,
        savedProbeEdits: draft.savedProbeEdits,
        savedProbeDeletions: draft.savedProbeDeletions,
        hasProbeSessionChanges: draft.hasProbeSessionChanges,
        canUndoProbeSession: draft.canUndoProbeSession,
        canRedoProbeSession: draft.canRedoProbeSession,
        undoProbeSessionAction: draft.undoProbeSessionAction,
        redoProbeSessionAction: draft.redoProbeSessionAction,
        savedProbeCompareMode: draft.savedProbeCompareMode,
        closePickProbe: draft.closePickProbe,
        closePickTargetContextMenu: draft.closePickTargetContextMenu,
        handlePickTargetEdit: draft.handlePickTargetEdit,
        handlePickTargetDelete: draft.handlePickTargetDelete,
        handlePickTargetRevert: draft.handlePickTargetRevert,
        commitPickProbeEdits: draft.commitPickProbeEdits,
        revertSavedProbeEdit: draft.revertSavedProbeEdit,
        revertAllSavedProbeEdits: draft.revertAllSavedProbeEdits,
        setSavedProbeCompareMode: draft.setSavedProbeCompareMode,
        setPickProbeCompareMode: draft.setPickProbeCompareMode,
        updatePickProbeValue: draft.updatePickProbeValue,
        resetPickProbeValues: draft.resetPickProbeValues,
        appendSavedProbeSummaryAsNewDraftCase: draft.appendSavedProbeSummaryAsNewDraftCase,
        markers: markers.markers,
        selectedReport: panel.selectedReport,
        editingReportId: mutations.editingReportId,
        editableDraft: mutations.editableDraft,
        setEditableDraft: mutations.setEditableDraft,
        overlayRef,
        activeReplyReportId: reply.activeReplyReportId,
        activeReplyReport: reply.activeReplyReport,
        tooltipReport: markers.tooltipReport,
        tooltipAnchor: markers.tooltipAnchor,
        tooltipFieldTags: markers.tooltipFieldTags,
        replyDraft: reply.replyDraft,
        setReplyDraft: reply.setReplyDraft,
        replySubmitAsQuestion: reply.replySubmitAsQuestion,
        setReplySubmitAsQuestion: reply.setReplySubmitAsQuestion,
        draftAuthorName: draft.draftAuthorName,
        setDraftAuthorName: draft.setDraftAuthorNameSafe,
        replyAuthorName: reply.replyAuthorName,
        setReplyAuthorName: reply.setReplyAuthorName,
        isPresentationMode: auth.isPresentationMode,
        sessionActor: auth.sessionActor,
        presentationViewers: auth.presentationViewers,
        presentationViewerId: auth.resolvedPresentationViewerId,
        setPresentationViewerId: auth.applyPresentationViewer,
        pendingComposer: reply.pendingComposer,
        startDenyReview: reply.startDenyReview,
        startCheckoutReview: reply.startCheckoutReview,
        startAskQuestion: reply.startAskQuestion,
        handleClaimAssignee: reply.handleClaimAssignee,
        handleTransferAssignee: reply.handleTransferAssignee,
        cancelPendingComposer: reply.cancelPendingComposer,
        confirmAuthorName: reply.confirmAuthorName,
        setConfirmAuthorName: reply.setConfirmAuthorName,
        showConfirmAuthorSelect: reply.showConfirmAuthorSelect,
        toggleConfirmAuthorSelect: reply.toggleConfirmAuthorSelect,
        handleConfirmResolution: reply.handleConfirmResolution,
        beginCaseEdit: reply.beginCaseEdit,
        cancelCaseEdit: reply.cancelCaseEdit,
        handleCaseEditSave: reply.handleCaseEditSave,
        updateCaseEditDraftCase: reply.updateCaseEditDraftCase,
        addCaseEditDraftCase: reply.addCaseEditDraftCase,
        removeCaseEditDraftCase: reply.removeCaseEditDraftCase,
        focusedCaseId: reply.focusedCaseId,
        selectCase: reply.selectCase,
        clearFocusedCase: reply.clearFocusedCase,
        isCaseEditing: reply.isCaseEditing,
        caseEditReportId: reply.caseEditReportId,
        caseEditCases: reply.caseEditCases,
        targetStats: panel.targetStats,
        roleStatItems: panel.roleStatItems,
        panelRole: panel.panelRole,
        setPanelRole: panel.setPanelRole,
        visiblePanelTabs: panel.visiblePanelTabs,
        visiblePanelTabsSummary: panel.visiblePanelTabsSummary,
        resolvedTabAvailabilityContext: panel.resolvedTabAvailabilityContext,
        setVisiblePanelTabs: panel.setVisiblePanelTabs,
        resetVisibleTabsToRoleDefault: panel.resetVisibleTabsToRoleDefault,
        applyRoleDefaultTabsForOnboarding: panel.applyRoleDefaultTabsForOnboarding,
        savePanelTabPreference: panel.savePanelTabPreference,
        storedPanelTabPreference: panel.storedPanelTabPreference,
        statusText: markers.statusText,
        toggleReportMode: panel.toggleReportMode,
        toggleTargetPreview: draft.toggleTargetPreview,
        toggleIssueMode: panel.toggleIssueMode,
        openPanelTab: panel.openPanelTab,
        togglePanelTab: panel.togglePanelTab,
        selectReport,
        locateFeedback: markers.locateFeedback,
        focusSearchInput: markers.focusSearchInput,
        selectAdjacentReport: markers.selectAdjacentReport,
        openReplyComposer: reply.openReplyComposer,
        activateFeedbackMarker: markers.activateFeedbackMarker,
        closeReplyComposer: reply.closeReplyComposer,
        clearHoverLeaveTimeout: markers.clearHoverLeaveTimeout,
        scheduleHoverLeave: markers.scheduleHoverLeave,
        setHoveredMarkerId: markers.setHoveredMarkerId,
        handleOverlayMove: draft.handleOverlayMove,
        handleOverlayContextMenu: draft.handleOverlayContextMenu,
        handleOverlayClick: draft.handleOverlayClick,
        cancelDraft: draft.cancelDraft,
        updateDraftCase: draft.updateDraftCase,
        addDraftCase: draft.addDraftCase,
        removeDraftCase: draft.removeDraftCase,
        updateDraftField: draft.updateDraftField,
        updateDraftCategory: draft.updateDraftCategory,
        handleCreateSubmit: mutations.handleCreateSubmit,
        startEditing: mutations.startEditing,
        stopEditing: mutations.stopEditing,
        handleUpdateSubmit: mutations.handleUpdateSubmit,
        handleReplySubmit: reply.handleReplySubmit,
        handleDelete: mutations.handleDelete,
        canCreateGitHubIssueFromList: mutations.canCreateGitHubIssueFromList,
        canCreateGitHubIssueOnCreate: mutations.canCreateGitHubIssueOnCreate,
        creatingGitHubIssueId: mutations.creatingGitHubIssueId,
        handleCreateGitHubIssue: mutations.handleCreateGitHubIssue,
        handleCreateSubmitWithGitHubIssue: mutations.handleCreateSubmitWithGitHubIssue,
        isDraftGitHubIssueSubmitting: mutations.isDraftGitHubIssueSubmitting,
    };
}
//# sourceMappingURL=useReportState.js.map