import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo } from "react";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useTooltipLayout } from "../../hooks/useTooltipLayout.js";
import { useReport } from "../../providers/reportContext.js";
import { resolveMarkerOverflowHints } from "../../utils/marker/coordinates.js";
import { scrollContainerTowardEdge } from "../../utils/shared/dom.js";
import { getDetachedMarkerAriaLabel, getModalGhostFrame } from "../../utils/marker/markerContext.js";
import { getMarkerDotSize } from "../../utils/marker/markerRuntime.js";
import { getMarkerReplyBadgeSize, resolveMarkerShapeStyle } from "../../utils/marker/markerShape.js";
import { resolveMarkerBadgeDisplay } from "../../constants/markerAppearance.js";
import { getMarkerColor, getMarkerDisplayLabel, hasMarkerReplyIndicator } from "../../utils/report/reportVisual.js";
import { FeedbackHoverCard } from "../../components/panel/feedback/FeedbackHoverCard.js";
import { getReplyCount } from "../../utils/feedback/feedbackThread.js";
import { MOTION } from "../../constants/motionClasses.js";
import { MarkerFeedbackWindow } from "./MarkerFeedbackWindow.js";
import { MarkerReplyBadge } from "./MarkerReplyBadge.js";
import { MarkerShapeGlyph } from "./MarkerShapeGlyph.js";
const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity800)] backdrop-blur-[5px] shadow-[var(--adaptive-popup-shadow)]";
const TOOLTIP_FIXED_CLASS = `fixed z-[1000001] ${TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipFadeIn}`;
const MARKER_ANCHOR_BASE_CLASS = "pointer-events-none fixed z-[1000000]";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center";
const OVERFLOW_HINT_BASE_CLASS = "pointer-events-auto fixed z-[1000000] flex items-center justify-center rounded-full bg-[#000000b3] backdrop-blur-[6px]";
const OVERFLOW_HINT_TEXT_CLASS = "max-w-[220px] whitespace-nowrap px-[10px] py-[6px] text-[12px] font-medium leading-none text-white";
const OVERFLOW_HINT_ARROW_CLASS = "flex h-[28px] w-[28px] items-center justify-center text-[16px] font-semibold leading-none";
const MODAL_GHOST_LAYER_CLASS = "pointer-events-none fixed inset-0 z-[999999]";
const REPORT_MODE_MARKER_PROXIMITY_PX = 56;
function MarkerOverflowHintButton({ hint, label, onActivate }) {
    const isVertical = hint.edge === "top" || hint.edge === "bottom";
    const transform = hint.edge === "top" ? "translate(-50%, 0)" : hint.edge === "bottom" ? "translate(-50%, -100%)" : hint.edge === "left" ? "translate(0, -50%)" : "translate(-100%, -50%)";
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": label, onClick: () => onActivate(hint), className: OVERFLOW_HINT_BASE_CLASS, style: {
            left: hint.left,
            top: hint.top,
            transform,
        }, children: isVertical ? _jsx("span", { className: OVERFLOW_HINT_TEXT_CLASS, children: label }) : _jsx("span", { className: OVERFLOW_HINT_ARROW_CLASS, children: hint.edge === "left" ? "←" : "→" }) }));
}
function DetachedModalGhostFrame() {
    const frame = useMemo(() => getModalGhostFrame(), []);
    return (_jsxs("div", { className: MODAL_GHOST_LAYER_CLASS, "aria-hidden": true, children: [_jsx("div", { className: "absolute bg-[#0f172a]/12", style: {
                    left: frame.backdrop.left,
                    top: frame.backdrop.top,
                    width: frame.backdrop.width,
                    height: frame.backdrop.height,
                } }), _jsx("div", { className: "absolute rounded-[20px] border-2 border-dashed border-[#818cf8]/80 bg-white/10 shadow-[0_18px_48px_rgba(79,70,229,0.18)]", style: {
                    left: frame.dialog.left,
                    top: frame.dialog.top,
                    width: frame.dialog.width,
                    height: frame.dialog.height,
                } })] }));
}
function MarkerButton({ markerItem, isHovered, isReportMode, isProximityHighlighted, detachedAriaLabel, detachedModalAriaLabel, markerAppearance, typography, onActivate, onHoverStart, onHoverEnd, onPointerMove, }) {
    const hoverRef = useNativeHover({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = getReplyCount(markerItem.report);
    const markerBadgeLabel = getMarkerDisplayLabel(markerItem.report);
    const showReplyIndicator = hasMarkerReplyIndicator(markerItem.report, replyCount);
    const markerLabelParts = [
        markerItem.report.report_type,
        markerItem.report.report_id,
        markerBadgeLabel,
        showReplyIndicator ? `+${replyCount}` : null,
    ].filter(Boolean);
    const markerLabel = markerLabelParts.join(" · ");
    const isDetached = markerItem.detached;
    const resolvedDetachedAriaLabel = getDetachedMarkerAriaLabel(markerItem.detachedKind, {
        detachedAriaLabel,
        detachedModalAriaLabel,
    });
    const dotSize = getMarkerDotSize();
    const hasBadgeSource = typography.fontSize !== "none" && Boolean(markerBadgeLabel);
    const badgeDisplay = hasBadgeSource ? resolveMarkerBadgeDisplay(markerAppearance.size, markerBadgeLabel) : { content: null, fontSizePx: undefined, fontWeight: undefined };
    const showMarkerLabel = Boolean(badgeDisplay.content);
    const glyphShape = markerItem.detachedKind === "modal" ? "ghostish" : markerItem.detachedKind === "hidden" ? "puffy" : markerAppearance.shape;
    const shapeStyle = resolveMarkerShapeStyle(glyphShape, dotSize);
    const markerColor = getMarkerColor(markerItem.report, markerAppearance.colors);
    const replyBadgeSize = getMarkerReplyBadgeSize(dotSize);
    const scaleClass = isHovered ? "scale-[1.4]" : isReportMode && isProximityHighlighted ? "scale-110" : "";
    return (_jsx("div", { className: `${MARKER_ANCHOR_BASE_CLASS} ${shapeStyle.anchorClass}`, style: {
            left: markerItem.left,
            top: markerItem.top,
        }, children: _jsx("div", { className: `relative transition-opacity duration-150 ${isReportMode ? (isProximityHighlighted ? "pointer-events-none opacity-100" : "pointer-events-none opacity-50") : "pointer-events-auto"}`, children: _jsxs("div", { className: `relative transition-transform duration-150 ${scaleClass}`, children: [_jsxs("button", { ref: hoverRef, type: "button", "data-fivepixels-interactive": "", "data-marker-report-id": markerItem.report.id, "aria-label": isDetached ? `${resolvedDetachedAriaLabel} · ${markerLabel}` : markerLabel, "aria-hidden": isReportMode || undefined, tabIndex: isReportMode ? -1 : undefined, onClick: isReportMode
                            ? undefined
                            : () => {
                                void onActivate(markerItem.report);
                            }, onPointerMove: isReportMode
                            ? undefined
                            : (event) => {
                                onPointerMove(event.clientX, event.clientY);
                            }, className: `${MARKER_BUTTON_BASE_CLASS} relative border-0 bg-transparent p-0 shadow-none ${isReportMode ? "" : isDetached ? "opacity-75" : ""} ${showMarkerLabel ? "text-white" : ""}`, style: {
                            pointerEvents: isReportMode ? "none" : "auto",
                            width: shapeStyle.width,
                            height: shapeStyle.height,
                            minWidth: shapeStyle.width,
                            minHeight: shapeStyle.height,
                            fontSize: badgeDisplay.fontSizePx === undefined ? undefined : `${badgeDisplay.fontSizePx}px`,
                            fontWeight: badgeDisplay.fontWeight,
                            fontFamily: showMarkerLabel ? typography.fontFamily : undefined,
                        }, children: [_jsx("span", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: _jsx(MarkerShapeGlyph, { shape: glyphShape, fill: markerColor, width: shapeStyle.width, height: shapeStyle.height, strokeWidthPx: shapeStyle.strokeWidthPx }) }), _jsx("span", { className: "relative z-[1] flex items-center justify-center", children: showMarkerLabel ? badgeDisplay.content : null })] }, markerItem.id), showReplyIndicator ? (_jsx(MarkerReplyBadge, { size: replyBadgeSize, accentColor: markerColor })) : null] }) }) }));
}
export function ReportMarkersLayer() {
    const { mode, markers, activeReplyReport, activeReplyReportId, tooltipReport, tooltipAnchor, editingReportId, hoverPointer, setHoverPointer, messages, markerAppearance, typography, showHiddenDetachedMarkers, showModalDetachedMarkers, activateFeedbackMarker, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, } = useReport();
    const handleMarkerHoverStart = useCallback((reportId) => {
        clearHoverLeaveTimeout();
        setHoveredMarkerId(reportId);
    }, [clearHoverLeaveTimeout, setHoveredMarkerId]);
    const handleMarkerHoverEnd = useCallback((reportId) => {
        setHoverPointer(null);
        if (activeReplyReportId) {
            scheduleHoverLeave(reportId);
            return;
        }
        clearHoverLeaveTimeout();
        setHoveredMarkerId((current) => (current === reportId ? null : current));
    }, [activeReplyReportId, clearHoverLeaveTimeout, scheduleHoverLeave, setHoverPointer, setHoveredMarkerId]);
    const isExpandedTooltip = Boolean(activeReplyReport && tooltipReport && activeReplyReport.id === tooltipReport.id);
    const isViewMode = mode === "view";
    const isReportMode = mode === "report";
    const visibleMarkers = useMemo(() => markers.filter((marker) => {
        if (marker.clampedEdge !== null) {
            return false;
        }
        if (marker.detachedKind === "hidden" && !showHiddenDetachedMarkers) {
            return false;
        }
        if (marker.detachedKind === "modal" && !showModalDetachedMarkers) {
            return false;
        }
        return true;
    }), [markers, showHiddenDetachedMarkers, showModalDetachedMarkers]);
    const overflowHints = useMemo(() => resolveMarkerOverflowHints(visibleMarkers), [visibleMarkers]);
    const proximityHighlightedMarkerId = useMemo(() => {
        if (!isReportMode || !hoverPointer) {
            return null;
        }
        let closestMarkerId = null;
        let closestDistance = REPORT_MODE_MARKER_PROXIMITY_PX;
        for (const marker of visibleMarkers) {
            const distance = Math.hypot(marker.left - hoverPointer.clientX, marker.top - hoverPointer.clientY);
            if (distance <= closestDistance) {
                closestMarkerId = marker.id;
                closestDistance = distance;
            }
        }
        return closestMarkerId;
    }, [hoverPointer, isReportMode, visibleMarkers]);
    useEffect(() => {
        if (isReportMode) {
            setHoveredMarkerId(proximityHighlightedMarkerId);
        }
    }, [isReportMode, proximityHighlightedMarkerId, setHoveredMarkerId]);
    // Only show the modal ghost while the marker is actively hovered / reply-open.
    // Do not key off selectedReport — list selection fallback would flash the
    // silhouette whenever a modal-classified marker merely scrolled out of view.
    const ghostFrameMarker = useMemo(() => {
        const activeReportId = tooltipReport?.id;
        if (!activeReportId) {
            return null;
        }
        const marker = visibleMarkers.find((item) => item.report.id === activeReportId);
        if (!marker || marker.detachedKind !== "modal") {
            return null;
        }
        return marker;
    }, [tooltipReport?.id, visibleMarkers]);
    const getOverflowHintLabel = useCallback((hint) => {
        switch (hint.edge) {
            case "top":
                return messages.marker.moreIssuesAbove(hint.count);
            case "bottom":
                return messages.marker.moreIssuesBelow(hint.count);
            case "left":
                return messages.marker.moreIssuesLeft(hint.count);
            case "right":
                return messages.marker.moreIssuesRight(hint.count);
        }
    }, [messages.marker]);
    const handleOverflowHintActivate = useCallback((hint) => {
        scrollContainerTowardEdge(hint.containerId, hint.edge);
    }, []);
    const showTooltip = Boolean(tooltipReport && tooltipAnchor) && (!editingReportId || tooltipReport?.id !== editingReportId);
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(tooltipAnchor, isExpandedTooltip, showTooltip);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    const bindHoverTooltipRef = useCallback((node) => {
        setTooltipElement(node);
    }, [setTooltipElement]);
    if (!isViewMode && !isReportMode) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [isViewMode && ghostFrameMarker ? _jsx(DetachedModalGhostFrame, {}) : null, visibleMarkers.map((markerItem) => (_jsx(MarkerButton, { markerItem: markerItem, isHovered: isViewMode && tooltipReport?.id === markerItem.report.id && !isExpandedTooltip, isReportMode: isReportMode, isProximityHighlighted: markerItem.id === proximityHighlightedMarkerId, detachedAriaLabel: messages.marker.detachedAriaLabel, detachedModalAriaLabel: messages.marker.detachedModalAriaLabel, markerAppearance: markerAppearance, typography: typography, onActivate: activateFeedbackMarker, onHoverStart: () => handleMarkerHoverStart(markerItem.report.id), onHoverEnd: () => handleMarkerHoverEnd(markerItem.report.id), onPointerMove: (clientX, clientY) => setHoverPointer({ clientX, clientY }) }, markerItem.id))), isViewMode
                ? overflowHints.map((hint) => (_jsx(MarkerOverflowHintButton, { hint: hint, label: getOverflowHintLabel(hint), onActivate: handleOverflowHintActivate }, hint.id)))
                : null, showTooltip && !isExpandedTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle ? (_jsx("div", { ref: bindHoverTooltipRef, className: `pointer-events-none ${TOOLTIP_FIXED_CLASS}`, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    ...tooltipAnchorStyle,
                    pointerEvents: "none",
                }, children: _jsx(FeedbackHoverCard, { report: tooltipReport, detached: Boolean(tooltipAnchor?.detached), detachedKind: tooltipAnchor?.detachedKind ?? null, detachedHint: messages.marker.detachedHint, detachedModalHint: messages.marker.detachedModalHint }) })) : null, isViewMode && isExpandedTooltip && activeReplyReport && tooltipAnchor ? (_jsx(MarkerFeedbackWindow, { report: activeReplyReport, anchor: tooltipAnchor }, activeReplyReport.id)) : null] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map