import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { AnimatedPresence, motion } from "../../components/motion/index.js";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useTooltipLayout } from "../../hooks/useTooltipLayout.js";
import { useReport } from "../../providers/reportContext.js";
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
const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[24px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)]";
const TOOLTIP_FIXED_CLASS = `fixed z-[1000001] ${TOOLTIP_SURFACE_CLASS}`;
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";
const MARKER_ANCHOR_CLASS = "pointer-events-none fixed z-[1000000] -translate-x-1/2 -translate-y-1/2";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center rounded-full";
function MarkerButton({ markerItem, isSelected, isLocated, locatePulseTick, onSelect, onOpenReply, onHoverStart, onHoverEnd }) {
    const hoverRef = useNativeHover({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = markerItem.report.replies.length;
    const markerLabel = replyCount > 0 ? `${markerItem.report.report_type} · ${markerItem.report.report_id} · ${replyCount} replies` : `${markerItem.report.report_type} · ${markerItem.report.report_id}`;
    return (_jsxs(_Fragment, { children: [isLocated ? (_jsx(MarkerLocatePulse, { left: markerItem.left, top: markerItem.top, tick: locatePulseTick, accentColor: getMarkerColor(markerItem.report) })) : null, _jsx("div", { className: MARKER_ANCHOR_CLASS, style: {
                    left: markerItem.left,
                    top: markerItem.top,
                }, children: _jsx("div", { className: "relative pointer-events-auto", children: _jsx("button", { ref: hoverRef, type: "button", "data-fivepixels-interactive": "", "data-marker-report-id": markerItem.report.id, "aria-label": markerLabel, onClick: () => {
                            onSelect();
                            onOpenReply();
                        }, className: `${isLocated
                            ? `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] border-white shadow-[0_4px_10px_#00000090]`
                            : isSelected
                                ? `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] scale-[1.4] border-white shadow-[0_4px_10px_#00000090]`
                                : `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] border-white shadow-[0_4px_10px_#00000090]`} ${replyCount > 0 ? "p-[4px_8px] text-white" : ""}`, style: {
                            backgroundColor: getMarkerColor(markerItem.report),
                            pointerEvents: "auto",
                        }, children: replyCount > 0 ? `+${replyCount}` : null }, markerItem.id) }) })] }));
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
    const showTooltip = Boolean(tooltipReport && tooltipAnchor);
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(tooltipAnchor, isExpandedTooltip, showTooltip);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    const tooltipScaleOrigin = tooltipPosition?.placement === "below" ? "top left" : "bottom left";
    const bindHoverTooltipRef = useCallback((node) => {
        setTooltipElement(node);
    }, [setTooltipElement]);
    const bindExpandedTooltipRef = useCallback((node) => {
        tooltipContainerRef.current = node;
        if (node instanceof HTMLDivElement) {
            expandedTooltipHoverRef(node);
        }
        setTooltipElement(node);
    }, [expandedTooltipHoverRef, setTooltipElement]);
    if (!isViewMode) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [markers.map((markerItem) => markerItem.rect && locatedReportId !== markerItem.report.id ? (_jsx("div", { className: "pointer-events-none fixed", style: {
                    left: markerItem.rect.left,
                    top: markerItem.rect.top,
                    width: markerItem.rect.width,
                    height: markerItem.rect.height,
                    // outline: `1px solid ${TARGET_COLOR[markerItem.report.report_type]}`,
                    // backgroundColor: TARGET_SURFACE[markerItem.report.report_type],
                    outline: `2px solid #0ed1b4`,
                    backgroundColor: "#0ed1b41c",
                } }, `${markerItem.id}-rect`)) : null), locatedMarker?.rect ? (_jsx(TargetLocatePulse, { rect: locatedMarker.rect, tick: locatePulseTick, outlineColor: TARGET_COLOR[locatedMarker.report.report_type], surfaceColor: TARGET_SURFACE[locatedMarker.report.report_type] })) : null, markers.map((markerItem) => (_jsx(MarkerButton, { markerItem: markerItem, isSelected: markerItem.report.id === selectedReport?.id, isLocated: markerItem.report.id === locatedReportId, locatePulseTick: locatePulseTick, onSelect: () => selectReport(markerItem.report.id), onOpenReply: () => openReplyComposer(markerItem.report), onHoverStart: () => handleMarkerHoverStart(markerItem.report.id), onHoverEnd: () => handleMarkerHoverEnd(markerItem.report.id) }, markerItem.id))), showTooltip && !isExpandedTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle ? (_jsx(motion.div, { ref: bindHoverTooltipRef, className: `pointer-events-none ${TOOLTIP_FIXED_CLASS}`, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    ...tooltipAnchorStyle,
                    pointerEvents: "none",
                }, children: _jsx(FeedbackHoverCard, { report: tooltipReport, fieldTags: tooltipFieldTags }) })) : null, _jsx(AnimatedPresence, { children: showTooltip && isExpandedTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle && activeReplyReport ? (_jsx(motion.div, { ref: bindExpandedTooltipRef, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: TOOLTIP_MOTION_TRANSITION, className: EXPANDED_TOOLTIP_ANCHOR_CLASS, style: {
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        width: tooltipPosition.width,
                        ...tooltipAnchorStyle,
                    }, children: _jsx(motion.div, { "data-fivepixels-interactive": "", initial: { scale: 0.97 }, animate: { scale: 1 }, exit: { scale: 0.97 }, transition: TOOLTIP_MOTION_TRANSITION, className: TOOLTIP_SURFACE_CLASS, style: {
                            pointerEvents: "auto",
                            transformOrigin: tooltipScaleOrigin,
                        }, children: _jsxs("div", { onClick: (event) => event.stopPropagation(), onPointerDown: (event) => event.stopPropagation(), children: [_jsx(FeedbackIssueHeader, { report: activeReplyReport, fieldTags: tooltipFieldTags, expanded: true }), showComposer ? (_jsx("section", { className: "border-t border-[var(--adaptive-border-subtle)] bg-transparent", children: _jsx(FeedbackComposer, { message: replyDraft, onMessageChange: setReplyDraft, authorName: replyAuthorName, onAuthorNameChange: setReplyAuthorName, authors: authors, fields: fields, fieldValues: activeReplyReport.field_values, onFieldChange: () => undefined, showTags: false, onSubmit: () => void handleReplySubmit(), isSubmitting: isUpdating, autoFocus: pendingComposer !== null }) })) : null, _jsx(FeedbackThread, { report: activeReplyReport, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: setConfirmAuthorName, onToggleConfirmAuthorSelect: toggleConfirmAuthorSelect, onStartDeny: startDenyReview, onStartCheckout: startCheckoutReview, onConfirm: () => void handleConfirmResolution(), isUpdating: isUpdating })] }) }) }, `${tooltipReport.id}-expanded`)) : null })] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map