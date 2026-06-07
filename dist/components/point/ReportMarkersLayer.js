import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { AnimatedPresence, motion } from "../../components/motion/index.js";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useReport } from "../../providers/reportContext.js";
import { getTooltipPosition } from "../../utils/coordinates.js";
import { getMarkerColor } from "../../utils/reportVisual.js";
import { FeedbackComposer } from "../../components/panel/feedback/FeedbackComposer.js";
import { FeedbackHoverCard } from "../../components/panel/feedback/FeedbackHoverCard.js";
import { FeedbackIssueHeader } from "../../components/panel/feedback/FeedbackIssueHeader.js";
import { FeedbackThread } from "../../components/panel/feedback/FeedbackThread.js";
import { MarkerLocatePulse, TargetLocatePulse, useLocatePulseTick } from "./FeedbackLocatePulse.js";
const TOOLTIP_MOTION_TRANSITION = {
    delay: 0,
    type: "spring",
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};
const TOOLTIP_BASE_CLASS = 
// "fixed z-[1000001] overflow-hidden rounded-[24px] bg-[var(--adaptive-blackOpacity900)] shadow-[0_0_90px_0_var(--adaptive-blackOpacity500)] backdrop-blur-sm border border-[2px] border-[var(--adaptive-black400)]";
"fixed z-[1000001] overflow-hidden rounded-[24px] shadow-[0_0_90px_0_var(--adaptive-blackOpacity500)] border border-[2px] border-[var(--adaptive-black300)] backdrop-blur-[10px]";
const MARKER_ANCHOR_CLASS = "pointer-events-none fixed z-[1000000] -translate-x-1/2 -translate-y-1/2";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center rounded-full";
function MarkerButton({ markerItem, isSelected, isLocated, locatePulseTick, onSelect, onOpenReply, onHoverStart, onHoverEnd }) {
    const hoverRef = useNativeHover({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = markerItem.report.replies.length;
    const markerLabel = replyCount > 0
        ? `${markerItem.report.report_type} · ${markerItem.report.report_id} · ${replyCount} replies`
        : `${markerItem.report.report_type} · ${markerItem.report.report_id}`;
    return (_jsxs(_Fragment, { children: [isLocated ? (_jsx(MarkerLocatePulse, { left: markerItem.left, top: markerItem.top, tick: locatePulseTick, accentColor: getMarkerColor(markerItem.report) })) : null, _jsx("div", { className: MARKER_ANCHOR_CLASS, style: {
                    left: markerItem.left,
                    top: markerItem.top,
                }, children: _jsxs("div", { className: "relative pointer-events-auto", children: [_jsx("button", { ref: hoverRef, type: "button", "data-stitchable-interactive": "", "data-marker-report-id": markerItem.report.id, "aria-label": markerLabel, onClick: () => {
                                onSelect();
                                onOpenReply();
                            }, className: isLocated
                                ? `${MARKER_BUTTON_BASE_CLASS} h-5 w-5 border-2 border-white/95 shadow-[0_0_18px_rgba(56,189,248,0.85)] ring-2 ring-sky-300/90`
                                : isSelected
                                    ? `${MARKER_BUTTON_BASE_CLASS} h-5 w-5 border-2 border-white/80 shadow-lg ring-2 ring-white/30`
                                    : `${MARKER_BUTTON_BASE_CLASS} h-4 w-4 border border-white/60 shadow-sm`, style: {
                                backgroundColor: getMarkerColor(markerItem.report),
                                pointerEvents: "auto",
                            } }, markerItem.id), replyCount > 0 ? (_jsxs("span", { className: "absolute -right-[6px] -top-[6px] flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[var(--adaptive-black900)] px-[3px] text-[10px] font-semibold leading-none text-[var(--adaptive-black50)] ring-1 ring-white/80", children: ["+", replyCount] })) : null] }) })] }));
}
export function ReportMarkersLayer() {
    const { mode, markers, selectedReport, locatedReportId, fields, authors, activeReplyReportId, activeReplyReport, tooltipReport, tooltipAnchor, tooltipFieldTags, replyDraft, replyAuthorName, pendingComposer, isUpdating, editingReportId, selectReport, openReplyComposer, closeReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, setReplyAuthorName, handleReplySubmit, startDenyReview, startCheckoutReview, confirmAuthorName, setConfirmAuthorName, showConfirmAuthorSelect, toggleConfirmAuthorSelect, handleConfirmResolution, } = useReport();
    const handleMarkerHoverStart = useCallback((reportId) => {
        clearHoverLeaveTimeout();
        setHoveredMarkerId(reportId);
        if (!editingReportId) {
            selectReport(reportId);
        }
    }, [clearHoverLeaveTimeout, editingReportId, selectReport, setHoveredMarkerId]);
    const handleMarkerHoverEnd = useCallback((reportId) => {
        if (activeReplyReportId) {
            scheduleHoverLeave(reportId);
            return;
        }
        clearHoverLeaveTimeout();
        setHoveredMarkerId((current) => (current === reportId ? null : current));
    }, [activeReplyReportId, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId]);
    const tooltipContainerRef = useRef(null);
    const expandedTooltipHoverRef = useNativeHover({
        onEnter: () => {
            if (tooltipReport) {
                clearHoverLeaveTimeout();
                setHoveredMarkerId(tooltipReport.id);
            }
        },
        onLeave: () => {
            if (tooltipReport) {
                scheduleHoverLeave(tooltipReport.id);
            }
        },
    });
    const showComposer = useMemo(() => {
        if (!activeReplyReport || activeReplyReport.status === "resolved") {
            return false;
        }
        return activeReplyReport.replies.length === 0 || pendingComposer !== null;
    }, [activeReplyReport, pendingComposer]);
    const isExpandedTooltip = Boolean(activeReplyReport && tooltipReport && activeReplyReport.id === tooltipReport.id);
    useEffect(() => {
        if (!activeReplyReportId) {
            return;
        }
        const handlePointerDown = (event) => {
            const path = event.composedPath();
            if (tooltipContainerRef.current && path.includes(tooltipContainerRef.current)) {
                return;
            }
            const clickedMarker = path.find((node) => node instanceof Element && node.hasAttribute("data-marker-report-id"));
            if (clickedMarker instanceof Element) {
                return;
            }
            clearHoverLeaveTimeout();
            setHoveredMarkerId(null);
            closeReplyComposer();
        };
        window.addEventListener("pointerdown", handlePointerDown);
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [activeReplyReportId, clearHoverLeaveTimeout, closeReplyComposer, setHoveredMarkerId]);
    const isViewMode = mode === "view";
    const locatePulseTick = useLocatePulseTick(isViewMode && Boolean(locatedReportId));
    const locatedMarker = isViewMode ? (markers.find((markerItem) => markerItem.report.id === locatedReportId) ?? null) : null;
    if (!isViewMode) {
        return null;
    }
    const tooltipPosition = tooltipAnchor ? getTooltipPosition(tooltipAnchor, isExpandedTooltip) : null;
    const showTooltip = Boolean(tooltipReport && tooltipAnchor && tooltipPosition);
    return (_jsxs(_Fragment, { children: [markers.map((markerItem) => markerItem.rect && locatedReportId !== markerItem.report.id ? (_jsx("div", { className: "pointer-events-none fixed rounded-[3px] border border-sky-400/70 bg-sky-200/20 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]", style: {
                    left: markerItem.rect.left,
                    top: markerItem.rect.top,
                    width: markerItem.rect.width,
                    height: markerItem.rect.height,
                    outline: `1px solid ${TARGET_COLOR[markerItem.report.report_type]}`,
                    backgroundColor: TARGET_SURFACE[markerItem.report.report_type],
                } }, `${markerItem.id}-rect`)) : null), locatedMarker?.rect ? (_jsx(TargetLocatePulse, { rect: locatedMarker.rect, tick: locatePulseTick, outlineColor: TARGET_COLOR[locatedMarker.report.report_type], surfaceColor: TARGET_SURFACE[locatedMarker.report.report_type] })) : null, markers.map((markerItem) => (_jsx(MarkerButton, { markerItem: markerItem, isSelected: markerItem.report.id === selectedReport?.id, isLocated: markerItem.report.id === locatedReportId, locatePulseTick: locatePulseTick, onSelect: () => selectReport(markerItem.report.id), onOpenReply: () => openReplyComposer(markerItem.report), onHoverStart: () => handleMarkerHoverStart(markerItem.report.id), onHoverEnd: () => handleMarkerHoverEnd(markerItem.report.id) }, markerItem.id))), showTooltip && !isExpandedTooltip && tooltipReport && tooltipPosition ? (_jsx("div", { className: `pointer-events-none ${TOOLTIP_BASE_CLASS}`, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    pointerEvents: "none",
                }, children: _jsx(FeedbackHoverCard, { report: tooltipReport, fieldTags: tooltipFieldTags }) })) : null, _jsx(AnimatedPresence, { children: showTooltip && isExpandedTooltip && tooltipReport && tooltipPosition && activeReplyReport ? (_jsx(motion.div, { ref: (node) => {
                        tooltipContainerRef.current = node;
                        if (node instanceof HTMLDivElement) {
                            expandedTooltipHoverRef(node);
                        }
                    }, "data-stitchable-interactive": "", initial: { opacity: 0, y: 5, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 5, scale: 0.97 }, transition: TOOLTIP_MOTION_TRANSITION, className: `pointer-events-auto ${TOOLTIP_BASE_CLASS}`, style: {
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        width: tooltipPosition.width,
                        pointerEvents: "auto",
                    }, children: _jsxs("div", { onClick: (event) => event.stopPropagation(), onPointerDown: (event) => event.stopPropagation(), children: [_jsx(FeedbackIssueHeader, { report: activeReplyReport, fieldTags: tooltipFieldTags, expanded: true }), showComposer ? (_jsx("section", { className: "backdrop-blur-[10px] bg-[var(--adaptive-blackOpacity900)]", children: _jsx(FeedbackComposer, { message: replyDraft, onMessageChange: setReplyDraft, authorName: replyAuthorName, onAuthorNameChange: setReplyAuthorName, authors: authors, fields: fields, fieldValues: activeReplyReport.field_values, onFieldChange: () => undefined, showTags: false, onSubmit: () => void handleReplySubmit(), isSubmitting: isUpdating, autoFocus: pendingComposer !== null }) })) : null, _jsx(FeedbackThread, { report: activeReplyReport, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: setConfirmAuthorName, onToggleConfirmAuthorSelect: toggleConfirmAuthorSelect, onStartDeny: startDenyReview, onStartCheckout: startCheckoutReview, onConfirm: () => void handleConfirmResolution(), isUpdating: isUpdating })] }) }, `${tooltipReport.id}-expanded`)) : null })] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map