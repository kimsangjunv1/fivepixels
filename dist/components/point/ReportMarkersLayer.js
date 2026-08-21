import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo } from "react";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useTooltipLayout } from "../../hooks/useTooltipLayout.js";
import { useReport } from "../../providers/reportContext.js";
import { resolveMarkerOverflowHints } from "../../utils/marker/coordinates.js";
import { scrollContainerTowardEdge } from "../../utils/shared/dom.js";
import { getDetachedMarkerAriaLabel } from "../../utils/marker/markerContext.js";
import { getMarkerDotSize } from "../../utils/marker/markerRuntime.js";
import { getMarkerReplyBadgeSize, resolveMarkerGlyphPaint, resolveMarkerShapeStyle } from "../../utils/marker/markerShape.js";
import { resolveMarkerBadgeDisplay } from "../../constants/markerAppearance.js";
import { getMarkerColor, getMarkerDisplayLabel, hasMarkerReplyIndicator } from "../../utils/report/reportVisual.js";
import { FeedbackHoverCard } from "../../components/panel/feedback/FeedbackHoverCard.js";
import { getReplyCount } from "../../utils/feedback/feedbackThread.js";
import { MOTION } from "../../constants/motionClasses.js";
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
function DetachedModalGhostFrame({ label }) {
    return (_jsx("div", { className: `${MODAL_GHOST_LAYER_CLASS} flex items-center justify-center bg-[var(--adaptive-neutralTintOpacity900)] p-[24px] text-center text-[14px] font-semibold text-[var(--adaptive-black900)] backdrop-blur-[10px] ${MOTION.tooltipFadeIn}`, "aria-hidden": true, children: label }));
}
function MarkerButton({ markerItem, isHovered, isReportMode, isProximityHighlighted, isWindowOpen, viewingWindowBadge, detachedAriaLabel, detachedModalAriaLabel, markerAppearance, typography, onActivate, onHoverStart, onHoverEnd, onPointerMove, }) {
    const hoverRef = useNativeHover({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = getReplyCount(markerItem.report);
    const aggregateCount = markerItem.aggregateCount ?? 1;
    const markerBadgeLabel = getMarkerDisplayLabel(markerItem.report);
    const showReplyIndicator = aggregateCount === 1 && hasMarkerReplyIndicator(markerItem.report, replyCount);
    const markerLabelParts = [
        markerItem.report.report_type,
        markerItem.report.report_id,
        markerBadgeLabel,
        aggregateCount > 1 ? `${aggregateCount}` : null,
        showReplyIndicator ? `+${replyCount}` : null,
        isWindowOpen ? viewingWindowBadge : null,
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
    const paint = resolveMarkerGlyphPaint(markerColor, markerAppearance.fillStyle, shapeStyle.strokeWidthPx);
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
                            }, className: `${MARKER_BUTTON_BASE_CLASS} relative border-0 bg-transparent p-0 shadow-none ${isReportMode ? "" : isDetached ? "opacity-75" : ""}`, style: {
                            pointerEvents: isReportMode ? "none" : "auto",
                            width: shapeStyle.width,
                            height: shapeStyle.height,
                            minWidth: shapeStyle.width,
                            minHeight: shapeStyle.height,
                            color: showMarkerLabel ? paint.labelColor : undefined,
                            fontSize: badgeDisplay.fontSizePx === undefined ? undefined : `${badgeDisplay.fontSizePx}px`,
                            fontWeight: badgeDisplay.fontWeight,
                            fontFamily: showMarkerLabel ? typography.fontFamily : undefined,
                        }, children: [_jsx("span", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: _jsx(MarkerShapeGlyph, { shape: glyphShape, fill: paint.fill, width: shapeStyle.width, height: shapeStyle.height, stroke: paint.stroke, strokeWidthPx: paint.strokeWidthPx }) }), _jsx("span", { className: "relative z-[1] flex items-center justify-center", children: showMarkerLabel ? badgeDisplay.content : null })] }, markerItem.id), aggregateCount > 1 ? (_jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white px-[4px] text-[10px] font-bold leading-none text-white", style: {
                            top: -5,
                            right: -5,
                            backgroundColor: markerColor,
                            boxShadow: "0 1px 4px #00000040",
                        }, children: aggregateCount })) : null, showReplyIndicator ? (_jsx(MarkerReplyBadge, { size: replyBadgeSize, accentColor: markerColor })) : null, isWindowOpen ? (_jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute left-1/2 top-full z-20 mt-[2px] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-[2px] py-[1px] text-[10px] font-semibold leading-none text-white", children: viewingWindowBadge })) : null] }) }) }));
}
export function ReportMarkersLayer() {
    const { mode, markers, openReplyReportIds, tooltipReport, tooltipAnchor, editingReportId, hoverPointer, setHoverPointer, messages, markerAppearance, typography, showHiddenDetachedMarkers, showModalDetachedMarkers, activateFeedbackMarker, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, } = useReport();
    const handleMarkerHoverStart = useCallback((reportId) => {
        clearHoverLeaveTimeout();
        setHoveredMarkerId(reportId);
    }, [clearHoverLeaveTimeout, setHoveredMarkerId]);
    const handleMarkerHoverEnd = useCallback((reportId) => {
        setHoverPointer(null);
        if (openReplyReportIds.length > 0) {
            scheduleHoverLeave(reportId);
            return;
        }
        clearHoverLeaveTimeout();
        setHoveredMarkerId((current) => (current === reportId ? null : current));
    }, [clearHoverLeaveTimeout, openReplyReportIds.length, scheduleHoverLeave, setHoverPointer, setHoveredMarkerId]);
    const openReplyReportIdSet = useMemo(() => new Set(openReplyReportIds), [openReplyReportIds]);
    const isHoveringOpenWindow = Boolean(tooltipReport && openReplyReportIdSet.has(tooltipReport.id));
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
        if (!marker || marker.detachedKind !== "modal" || marker.viewTriggerKey) {
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
    const showTooltip = Boolean(tooltipReport && tooltipAnchor) && (!editingReportId || tooltipReport?.id !== editingReportId) && !isHoveringOpenWindow;
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(tooltipAnchor, false, showTooltip);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    const bindHoverTooltipRef = useCallback((node) => {
        setTooltipElement(node);
    }, [setTooltipElement]);
    if (!isViewMode && !isReportMode) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [isViewMode && ghostFrameMarker ? _jsx(DetachedModalGhostFrame, { label: messages.marker.detachedModalHint }) : null, visibleMarkers.map((markerItem) => (_jsx(MarkerButton, { markerItem: markerItem, isHovered: isViewMode && tooltipReport?.id === markerItem.report.id && !openReplyReportIdSet.has(markerItem.report.id), isReportMode: isReportMode, isProximityHighlighted: markerItem.id === proximityHighlightedMarkerId, isWindowOpen: openReplyReportIdSet.has(markerItem.report.id), viewingWindowBadge: messages.marker.viewingWindowBadge, detachedAriaLabel: messages.marker.detachedAriaLabel, detachedModalAriaLabel: messages.marker.detachedModalAriaLabel, markerAppearance: markerAppearance, typography: typography, onActivate: activateFeedbackMarker, onHoverStart: () => handleMarkerHoverStart(markerItem.report.id), onHoverEnd: () => handleMarkerHoverEnd(markerItem.report.id), onPointerMove: (clientX, clientY) => setHoverPointer({ clientX, clientY }) }, markerItem.id))), isViewMode
                ? overflowHints.map((hint) => (_jsx(MarkerOverflowHintButton, { hint: hint, label: getOverflowHintLabel(hint), onActivate: handleOverflowHintActivate }, hint.id)))
                : null, showTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle ? (_jsx("div", { ref: bindHoverTooltipRef, className: `pointer-events-none ${TOOLTIP_FIXED_CLASS}`, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    ...tooltipAnchorStyle,
                    pointerEvents: "none",
                }, children: _jsx(FeedbackHoverCard, { report: tooltipReport, detached: Boolean(tooltipAnchor?.detached), detachedKind: tooltipAnchor?.detachedKind ?? null, detachedHint: messages.marker.detachedHint, detachedModalHint: messages.marker.detachedModalHint }) })) : null] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map