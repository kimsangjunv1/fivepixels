import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { aggregateViewTriggerMarkers, getMarkerFromReport, resolveTooltipAnchor } from "../../utils/marker/coordinates.js";
import { clearFeedbackDeepLinkFromUrl, parseFeedbackDeepLink } from "../../utils/feedback/feedbackDeepLink.js";
import { getFieldTags } from "../../utils/report/fields.js";
import { getFeedbackTargetElement, isFeedbackTargetVisible, scrollToFeedbackTarget, waitForTargetRevealResync } from "../../utils/marker/locateFeedback.js";
import { filterFeedbackForActiveViews, getActiveFeedbackViewKeys, restoreFeedbackViews } from "../../utils/marker/viewRestore.js";
import { markerToTargetSnapshot } from "../../utils/marker/markerTarget.js";
import { getPageDocument, getPageScrollY, getPageWindow, navigatePagePath, subscribePageDocumentBridge, } from "../../utils/overlay/pageDocumentBridge.js";
const MARKER_HOVER_LEAVE_MS = 250;
function getInitialDeepLinkFeedbackId() {
    if (typeof window === "undefined") {
        return null;
    }
    return parseFeedbackDeepLink()?.feedbackId ?? null;
}
export function useReportMarkers({ mode, messages, fields, currentPathname, currentPageReports, reports, allPageReports, selectedReportId, markerAppearanceSize, showMarkerTargetPreview, showTargetPreview, selectableTargetsLength, selectedTarget, hoveredTarget, isFetching, isReportsLoading, activeReplyReportId, minimizedReplyReportIds = [], setErrorMessage, onNavigate, onRevealTarget, selectReport, closeReplyComposer, openReplyComposer, selectCase, ensureIssueMode, loadRepliesIfNeeded, searchInputRef, }) {
    const [markers, setMarkers] = useState([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
    const hoverLeaveTimeoutRef = useRef(null);
    const pendingLocateReportIdRef = useRef(null);
    const pendingRevealWindowReportIdRef = useRef(null);
    const pendingDeepLinkFeedbackIdRef = useRef(getInitialDeepLinkFeedbackId());
    const deepLinkHandledRef = useRef(false);
    const syncMarkers = useCallback(() => {
        const currentScrollY = getPageScrollY();
        const visibleReports = filterFeedbackForActiveViews(currentPageReports, getActiveFeedbackViewKeys());
        setMarkers(aggregateViewTriggerMarkers(visibleReports.map((report) => getMarkerFromReport(report, currentScrollY))));
    }, [currentPageReports, markerAppearanceSize]);
    const minimizedReplyReportIdSet = useMemo(() => new Set(minimizedReplyReportIds), [minimizedReplyReportIds]);
    const activeMarkerReportId = useMemo(() => {
        if (activeReplyReportId && !minimizedReplyReportIdSet.has(activeReplyReportId)) {
            return activeReplyReportId;
        }
        if (hoveredMarkerId && !minimizedReplyReportIdSet.has(hoveredMarkerId)) {
            return hoveredMarkerId;
        }
        return null;
    }, [activeReplyReportId, hoveredMarkerId, minimizedReplyReportIdSet]);
    const activeMarkerTarget = useMemo(() => {
        if (!activeMarkerReportId) {
            return null;
        }
        const marker = markers.find((item) => item.report.id === activeMarkerReportId);
        if (!marker) {
            return null;
        }
        return markerToTargetSnapshot(marker);
    }, [activeMarkerReportId, markers]);
    const markerPreviewTargets = useMemo(() => {
        if (!showMarkerTargetPreview) {
            return [];
        }
        return markers.flatMap((marker) => {
            const snapshot = markerToTargetSnapshot(marker);
            if (!snapshot) {
                return [];
            }
            if (activeMarkerTarget && snapshot.id === activeMarkerTarget.id) {
                return [];
            }
            return [snapshot];
        });
    }, [activeMarkerTarget, markers, showMarkerTargetPreview]);
    const tooltipAnchor = useMemo(() => {
        const hoveredAnchor = resolveTooltipAnchor(markers, hoveredMarkerId);
        const activeReplyAnchor = resolveTooltipAnchor(markers, activeReplyReportId);
        if (!activeReplyReportId) {
            return hoveredAnchor;
        }
        if (hoveredMarkerId && hoveredMarkerId !== activeReplyReportId) {
            return hoveredAnchor;
        }
        return activeReplyAnchor ?? hoveredAnchor;
    }, [activeReplyReportId, hoveredMarkerId, markers]);
    const tooltipReport = tooltipAnchor?.report ?? null;
    const tooltipFieldTags = useMemo(() => (tooltipReport ? getFieldTags(fields, tooltipReport.field_values) : []), [fields, tooltipReport]);
    const statusText = useMemo(() => {
        if (mode === "report") {
            const focusTarget = selectedTarget ?? hoveredTarget;
            if (!focusTarget) {
                return messages.statusText.reportReady;
            }
            if (focusTarget.isTagged) {
                const typeLabel = focusTarget.type === "item" ? messages.statusText.selectedItem : messages.statusText.selectedGroup;
                return `${typeLabel}\n${focusTarget.id}`;
            }
            return `${messages.statusText.selectedUntaggedTarget}\n${focusTarget.suggestedReportId ?? focusTarget.id}`;
        }
        if (mode === "view") {
            return isFetching ? messages.statusText.loadingFeedback : messages.statusText.ready;
        }
        if (showTargetPreview) {
            return messages.statusText.showingSelectableTargets(selectableTargetsLength);
        }
        if (showMarkerTargetPreview) {
            return messages.statusText.showingMarkerTargets(markerPreviewTargets.length + (activeMarkerTarget ? 1 : 0));
        }
        if (selectableTargetsLength === 0) {
            return messages.statusText.noSelectableTargets;
        }
        return messages.statusText.ready;
    }, [
        activeMarkerTarget,
        hoveredTarget,
        isFetching,
        markerPreviewTargets.length,
        messages.statusText,
        mode,
        selectableTargetsLength,
        selectedTarget,
        showMarkerTargetPreview,
        showTargetPreview,
    ]);
    useEffect(() => {
        const shouldSyncMarkers = mode === "view" || mode === "report" || showMarkerTargetPreview;
        if (!shouldSyncMarkers) {
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
        mutationObserver.observe(getPageDocument().body ?? getPageDocument().documentElement, {
            attributes: true,
            attributeFilter: ["class", "style", "aria-hidden", "aria-disabled", "disabled", "data-fp-open", "data-fp-view"],
            childList: true,
            subtree: true,
        });
        const pageWindow = getPageWindow();
        pageWindow.addEventListener("scroll", syncMarkers, { passive: true, capture: true });
        pageWindow.addEventListener("resize", syncMarkers);
        window.addEventListener("resize", syncMarkers);
        const unsubscribeBridge = subscribePageDocumentBridge(syncMarkers);
        return () => {
            cancelled = true;
            if (mutationSyncTimeout !== null) {
                window.clearTimeout(mutationSyncTimeout);
            }
            mutationObserver.disconnect();
            pageWindow.removeEventListener("scroll", syncMarkers, { capture: true });
            pageWindow.removeEventListener("resize", syncMarkers);
            window.removeEventListener("resize", syncMarkers);
            unsubscribeBridge();
        };
    }, [currentPathname, mode, showMarkerTargetPreview, syncMarkers]);
    useEffect(() => {
        if (!showMarkerTargetPreview) {
            return;
        }
        const syncPreviewRects = () => {
            syncMarkers();
        };
        const pageWindow = getPageWindow();
        pageWindow.addEventListener("scroll", syncPreviewRects, { passive: true, capture: true });
        pageWindow.addEventListener("resize", syncPreviewRects);
        window.addEventListener("resize", syncPreviewRects);
        const unsubscribeBridge = subscribePageDocumentBridge(syncPreviewRects);
        return () => {
            pageWindow.removeEventListener("scroll", syncPreviewRects, { capture: true });
            pageWindow.removeEventListener("resize", syncPreviewRects);
            window.removeEventListener("resize", syncPreviewRects);
            unsubscribeBridge();
        };
    }, [showMarkerTargetPreview, syncMarkers]);
    const prepareFeedbackLocation = useCallback(async (report) => {
        let targetElement = getFeedbackTargetElement(report);
        if (targetElement && isFeedbackTargetVisible(targetElement)) {
            scrollToFeedbackTarget(report);
            return false;
        }
        let revealed = await restoreFeedbackViews(report.position.viewPath);
        if (revealed) {
            syncMarkers();
            targetElement = getFeedbackTargetElement(report);
        }
        if ((!targetElement || !isFeedbackTargetVisible(targetElement)) && onRevealTarget) {
            try {
                revealed = Boolean(await onRevealTarget(report)) || revealed;
            }
            catch {
                // Keep a successful declarative reveal even if the fallback fails.
            }
        }
        if (revealed) {
            await waitForTargetRevealResync();
            syncMarkers();
        }
        scrollToFeedbackTarget(report);
        return revealed;
    }, [onRevealTarget, syncMarkers]);
    useEffect(() => {
        if (!hoveredMarkerId) {
            return;
        }
        const hoveredMarker = markers.find((marker) => marker.report.id === hoveredMarkerId);
        // Clear when the report disappears, or when it is clamped out of the
        // visible marker layer (unmount skips pointerleave).
        if (!hoveredMarker || hoveredMarker.clampedEdge !== null) {
            setHoveredMarkerId(null);
        }
    }, [hoveredMarkerId, markers]);
    useEffect(() => {
        return () => {
            if (hoverLeaveTimeoutRef.current) {
                window.clearTimeout(hoverLeaveTimeoutRef.current);
            }
        };
    }, []);
    const clearHoverLeaveTimeout = useCallback(() => {
        if (hoverLeaveTimeoutRef.current) {
            window.clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = null;
        }
    }, []);
    const scheduleHoverLeave = useCallback((markerId) => {
        clearHoverLeaveTimeout();
        hoverLeaveTimeoutRef.current = window.setTimeout(() => {
            setHoveredMarkerId((current) => (current === markerId ? null : current));
            hoverLeaveTimeoutRef.current = null;
        }, MARKER_HOVER_LEAVE_MS);
    }, [clearHoverLeaveTimeout]);
    const showFeedbackTooltip = useCallback(async (report) => {
        await prepareFeedbackLocation(report);
        clearHoverLeaveTimeout();
        closeReplyComposer();
        setHoveredMarkerId(report.id);
    }, [clearHoverLeaveTimeout, closeReplyComposer, prepareFeedbackLocation]);
    const locateFeedback = async (reportId) => {
        const report = reports.find((item) => item.id === reportId) ??
            currentPageReports.find((item) => item.id === reportId) ??
            allPageReports.find((item) => item.id === reportId);
        if (!report) {
            return;
        }
        selectReport(reportId);
        if (report.pathname !== currentPathname) {
            pendingLocateReportIdRef.current = reportId;
            try {
                await navigatePagePath(report.pathname, onNavigate);
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
        if (currentPageReports.length === 0) {
            return;
        }
        const currentIndex = currentPageReports.findIndex((report) => report.id === selectedReportId);
        let nextIndex;
        if (currentIndex === -1) {
            nextIndex = direction === "down" ? 0 : currentPageReports.length - 1;
        }
        else {
            nextIndex = direction === "down" ? Math.min(currentIndex + 1, currentPageReports.length - 1) : Math.max(currentIndex - 1, 0);
        }
        void locateFeedback(currentPageReports[nextIndex].id);
    };
    const activateFeedback = useCallback(async (report, caseId, stopAfterReveal = false) => {
        const revealed = await prepareFeedbackLocation(report);
        if (revealed && stopAfterReveal) {
            clearHoverLeaveTimeout();
            closeReplyComposer();
            setHoveredMarkerId(null);
            return;
        }
        const enrichedReport = await loadRepliesIfNeeded(report);
        openReplyComposer(enrichedReport);
        if (caseId && enrichedReport.cases.some((item) => item.id === caseId)) {
            selectCase(caseId);
        }
    }, [clearHoverLeaveTimeout, closeReplyComposer, loadRepliesIfNeeded, openReplyComposer, prepareFeedbackLocation, selectCase]);
    const activateFeedbackMarker = useCallback((report, caseId) => activateFeedback(report, caseId, true), [activateFeedback]);
    const revealOpenFeedback = useCallback(async (report) => {
        ensureIssueMode();
        selectReport(report.id);
        clearHoverLeaveTimeout();
        if (report.pathname !== currentPathname) {
            pendingRevealWindowReportIdRef.current = report.id;
            try {
                await navigatePagePath(report.pathname, onNavigate);
            }
            catch (nextError) {
                pendingRevealWindowReportIdRef.current = null;
                setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.loadFeedbackFailed);
            }
            return;
        }
        await prepareFeedbackLocation(report);
        const enrichedReport = await loadRepliesIfNeeded(report);
        openReplyComposer(enrichedReport);
    }, [
        clearHoverLeaveTimeout,
        currentPathname,
        ensureIssueMode,
        loadRepliesIfNeeded,
        messages.errors.loadFeedbackFailed,
        onNavigate,
        openReplyComposer,
        prepareFeedbackLocation,
        selectReport,
        setErrorMessage,
    ]);
    useEffect(() => {
        const pendingReportId = pendingRevealWindowReportIdRef.current;
        if (!pendingReportId) {
            return;
        }
        const report = reports.find((item) => item.id === pendingReportId && item.pathname === currentPathname) ??
            allPageReports.find((item) => item.id === pendingReportId && item.pathname === currentPathname) ??
            currentPageReports.find((item) => item.id === pendingReportId && item.pathname === currentPathname);
        if (!report) {
            return;
        }
        pendingRevealWindowReportIdRef.current = null;
        window.setTimeout(() => {
            void (async () => {
                await prepareFeedbackLocation(report);
                const enrichedReport = await loadRepliesIfNeeded(report);
                openReplyComposer(enrichedReport);
            })();
        }, 0);
    }, [allPageReports, currentPageReports, currentPathname, loadRepliesIfNeeded, openReplyComposer, prepareFeedbackLocation, reports]);
    useEffect(() => {
        const feedbackId = pendingDeepLinkFeedbackIdRef.current;
        if (!feedbackId || deepLinkHandledRef.current || isReportsLoading || isFetching) {
            return;
        }
        const report = reports.find((item) => item.id === feedbackId);
        if (!report) {
            pendingDeepLinkFeedbackIdRef.current = null;
            clearFeedbackDeepLinkFromUrl();
            return;
        }
        deepLinkHandledRef.current = true;
        pendingDeepLinkFeedbackIdRef.current = null;
        void activateFeedback(report).finally(() => {
            clearFeedbackDeepLinkFromUrl();
        });
    }, [activateFeedback, isFetching, isReportsLoading, reports]);
    return {
        markers,
        hoveredMarkerId,
        setHoveredMarkerId,
        activeMarkerTarget,
        markerPreviewTargets,
        tooltipAnchor,
        tooltipReport,
        tooltipFieldTags,
        statusText,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        prepareFeedbackLocation,
        showFeedbackTooltip,
        locateFeedback,
        focusSearchInput,
        selectAdjacentReport,
        activateFeedbackMarker,
        revealOpenFeedback,
    };
}
//# sourceMappingURL=useReportMarkers.js.map