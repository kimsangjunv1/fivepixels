import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMarkerFromReport, resolveTooltipAnchor } from "../../utils/marker/coordinates.js";
import { clearFeedbackDeepLinkFromUrl, parseFeedbackDeepLink } from "../../utils/feedback/feedbackDeepLink.js";
import { getFieldTags } from "../../utils/report/fields.js";
import { getFeedbackTargetElement, isFeedbackTargetVisible, scrollToFeedbackTarget, waitForTargetRevealResync } from "../../utils/marker/locateFeedback.js";
import { markerToTargetSnapshot } from "../../utils/marker/markerTarget.js";
const MARKER_HOVER_LEAVE_MS = 250;
function getInitialDeepLinkFeedbackId() {
    if (typeof window === "undefined") {
        return null;
    }
    return parseFeedbackDeepLink()?.feedbackId ?? null;
}
export function useReportMarkers({ mode, messages, fields, currentPathname, currentPageFilteredReports, filteredReports, reports, selectedReportId, markerAppearanceSize, showMarkerTargetPreview, showTargetPreview, selectableTargetsLength, selectedTarget, hoveredTarget, isFetching, isReportsLoading, activeReplyReportId, setErrorMessage, onNavigate, onRevealTarget, selectReport, closeReplyComposer, openReplyComposer, loadRepliesIfNeeded, searchInputRef, }) {
    const [markers, setMarkers] = useState([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
    const hoverLeaveTimeoutRef = useRef(null);
    const pendingLocateReportIdRef = useRef(null);
    const pendingDeepLinkFeedbackIdRef = useRef(getInitialDeepLinkFeedbackId());
    const deepLinkHandledRef = useRef(false);
    const syncMarkers = useCallback(() => {
        setMarkers(currentPageFilteredReports.map((report) => getMarkerFromReport(report, window.scrollY)));
    }, [currentPageFilteredReports, markerAppearanceSize]);
    const activeMarkerReportId = useMemo(() => {
        if (activeReplyReportId) {
            return activeReplyReportId;
        }
        if (hoveredMarkerId) {
            return hoveredMarkerId;
        }
        return null;
    }, [activeReplyReportId, hoveredMarkerId]);
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
    }, [currentPathname, mode, showMarkerTargetPreview, syncMarkers]);
    useEffect(() => {
        if (!showMarkerTargetPreview) {
            return;
        }
        const syncPreviewRects = () => {
            syncMarkers();
        };
        window.addEventListener("scroll", syncPreviewRects, { passive: true, capture: true });
        window.addEventListener("resize", syncPreviewRects);
        return () => {
            window.removeEventListener("scroll", syncPreviewRects, { capture: true });
            window.removeEventListener("resize", syncPreviewRects);
        };
    }, [showMarkerTargetPreview, syncMarkers]);
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
        if (hoveredMarkerId && !markers.some((marker) => marker.report.id === hoveredMarkerId)) {
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
    const activateFeedbackMarker = useCallback(async (report) => {
        const enrichedReport = await loadRepliesIfNeeded(report);
        await prepareFeedbackLocation(enrichedReport);
        openReplyComposer(enrichedReport);
    }, [loadRepliesIfNeeded, openReplyComposer, prepareFeedbackLocation]);
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
        void activateFeedbackMarker(report).finally(() => {
            clearFeedbackDeepLinkFromUrl();
        });
    }, [activateFeedbackMarker, isFetching, isReportsLoading, reports]);
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
    };
}
//# sourceMappingURL=useReportMarkers.js.map