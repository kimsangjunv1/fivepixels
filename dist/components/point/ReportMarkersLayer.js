import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useTooltipLayout } from "../../hooks/useTooltipLayout.js";
import { useReport } from "../../providers/reportContext.js";
import { getMarkerColor } from "../../utils/reportVisual.js";
import { FeedbackComposer } from "../../components/panel/feedback/FeedbackComposer.js";
import { FeedbackHoverCard } from "../../components/panel/feedback/FeedbackHoverCard.js";
import { FeedbackIssueHeader } from "../../components/panel/feedback/FeedbackIssueHeader.js";
import { FeedbackThread } from "../../components/panel/feedback/FeedbackThread.js";
const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)]";
const TOOLTIP_FIXED_CLASS = `fixed z-[1000001] ${TOOLTIP_SURFACE_CLASS}`;
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";
const MARKER_ANCHOR_CLASS = "pointer-events-none fixed z-[1000000] -translate-x-1/2 -translate-y-1/2";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center rounded-full";
function MarkerButton({ markerItem, isSelected, detachedAriaLabel, onActivate, onHoverStart, onHoverEnd }) {
    const hoverRef = useNativeHover({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = markerItem.report.replies.length;
    const markerLabel = replyCount > 0 ? `${markerItem.report.report_type} · ${markerItem.report.report_id} · ${replyCount} replies` : `${markerItem.report.report_type} · ${markerItem.report.report_id}`;
    const isDetached = markerItem.detached;
    const isClamped = markerItem.clampedEdge !== null;
    return (_jsx("div", { className: MARKER_ANCHOR_CLASS, style: {
            left: markerItem.left,
            top: markerItem.top,
        }, children: _jsxs("div", { className: "relative pointer-events-auto", children: [isDetached || isClamped ? (_jsx("div", { "aria-hidden": true, className: `pointer-events-none absolute -inset-[6px] rounded-full border border-dashed border-white/80 ${isClamped && !isDetached ? "opacity-80" : ""}` })) : null, _jsx("button", { ref: hoverRef, type: "button", "data-fivepixels-interactive": "", "data-marker-report-id": markerItem.report.id, "aria-label": isDetached ? `${detachedAriaLabel} · ${markerLabel}` : markerLabel, onClick: () => {
                        void onActivate(markerItem.report);
                    }, className: `${isSelected
                        ? `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] scale-[1.4] border-white shadow-[0_4px_10px_#00000090]`
                        : `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] border-white shadow-[0_4px_10px_#00000090]`} ${replyCount > 0 ? "p-[4px_8px] text-white" : ""} ${isDetached ? "border-dashed opacity-75" : ""}`, style: {
                        backgroundColor: getMarkerColor(markerItem.report),
                        pointerEvents: "auto",
                    }, children: replyCount > 0 ? `+${replyCount}` : null }, markerItem.id)] }) }));
}
export function ReportMarkersLayer() {
    const { mode, markers, selectedReport, fields, authors, activeReplyReportId, activeReplyReport, tooltipReport, tooltipAnchor, tooltipFieldTags, replyDraft, replyAuthorName, pendingComposer, isUpdating, editingReportId, messages, selectReport, activateFeedbackMarker, closeReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, setReplyAuthorName, handleReplySubmit, startDenyReview, startCheckoutReview, confirmAuthorName, setConfirmAuthorName, showConfirmAuthorSelect, toggleConfirmAuthorSelect, handleConfirmResolution, } = useReport();
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
    const showTooltip = Boolean(tooltipReport && tooltipAnchor);
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(tooltipAnchor, isExpandedTooltip, showTooltip);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
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
    return (_jsxs(_Fragment, { children: [markers.map((markerItem) => (_jsx(MarkerButton, { markerItem: markerItem, isSelected: markerItem.report.id === selectedReport?.id, detachedAriaLabel: messages.marker.detachedAriaLabel, onActivate: activateFeedbackMarker, onHoverStart: () => handleMarkerHoverStart(markerItem.report.id), onHoverEnd: () => handleMarkerHoverEnd(markerItem.report.id) }, markerItem.id))), showTooltip && !isExpandedTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle ? (_jsx("div", { ref: bindHoverTooltipRef, className: `pointer-events-none ${TOOLTIP_FIXED_CLASS}`, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    ...tooltipAnchorStyle,
                    pointerEvents: "none",
                }, children: _jsx(FeedbackHoverCard, { report: tooltipReport, fieldTags: tooltipFieldTags, detached: Boolean(tooltipAnchor?.detached), detachedHint: messages.marker.detachedHint }) })) : null, showTooltip && isExpandedTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle && activeReplyReport ? (_jsx("div", { ref: bindExpandedTooltipRef, "data-fivepixels-interactive": "", className: EXPANDED_TOOLTIP_ANCHOR_CLASS, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    ...tooltipAnchorStyle,
                }, children: _jsx("div", { className: TOOLTIP_SURFACE_CLASS, style: {
                        pointerEvents: "auto",
                    }, children: _jsxs("div", { onClick: (event) => event.stopPropagation(), onPointerDown: (event) => event.stopPropagation(), children: [_jsx(FeedbackIssueHeader, { report: activeReplyReport, fieldTags: tooltipFieldTags, expanded: true }), tooltipAnchor?.detached ? (_jsx("p", { className: "border-b border-[var(--adaptive-border-subtle)] px-[12px] pb-[10px] text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: messages.marker.detachedHint })) : null, showComposer ? (_jsx("section", { className: "border-t border-[var(--adaptive-border-subtle)] bg-transparent", children: _jsx(FeedbackComposer, { message: replyDraft, onMessageChange: setReplyDraft, authorName: replyAuthorName, onAuthorNameChange: setReplyAuthorName, authors: authors, fields: fields, fieldValues: activeReplyReport.field_values, onFieldChange: () => undefined, showTags: false, onSubmit: () => void handleReplySubmit(), isSubmitting: isUpdating, autoFocus: pendingComposer !== null }) })) : null, _jsx(FeedbackThread, { report: activeReplyReport, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: setConfirmAuthorName, onToggleConfirmAuthorSelect: toggleConfirmAuthorSelect, onStartDeny: startDenyReview, onStartCheckout: startCheckoutReview, onConfirm: () => void handleConfirmResolution(), isUpdating: isUpdating })] }) }) })) : null] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map