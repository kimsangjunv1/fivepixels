import { useCallback, useEffect, useMemo } from "react";
import { useNativeHover } from "@/shared/hooks/useNativeHover.js";
import { useTooltipLayout } from "@/surfaces/tooltip/useTooltipLayout.js";
import { useReportPreferences, useReportSession } from "@/shared/providers/reportContext.js";
import type { Marker, MarkerOverflowHint } from "@/shared/types/report-ui.js";
import type { ReportFeedback } from "@/shared/types/report.js";
import { resolveMarkerOverflowHints } from "@/shared/utils/marker/coordinates.js";
import { scrollContainerTowardEdge } from "@/shared/utils/shared/dom.js";
import { getDetachedMarkerAriaLabel } from "@/shared/utils/marker/markerContext.js";
import { getMarkerDotSize } from "@/shared/utils/marker/markerRuntime.js";
import { getMarkerReplyBadgeSize, resolveMarkerGlyphPaint, resolveMarkerShapeStyle } from "@/shared/utils/marker/markerShape.js";
import type { MarkerAppearancePreferences, TypographyPreferences } from "@/shared/constants/markerAppearance.js";
import { resolveMarkerBadgeDisplay, MARKER_BADGE_LABEL_CLASS } from "@/shared/constants/markerAppearance.js";
import { getMarkerColor, getMarkerDisplayLabel, hasMarkerReplyIndicator } from "@/shared/utils/report/reportVisual.js";
import { FeedbackHoverCard } from "@/surfaces/feedback/FeedbackHoverCard.js";
import { getReplyCount } from "@/shared/utils/feedback/feedbackThread.js";
import { MOTION } from "@/shared/constants/motionClasses.js";
import { MarkerReplyBadge } from "./MarkerReplyBadge.js";
import { MarkerShapeGlyph } from "./MarkerShapeGlyph.js";

const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] bg-[var(--adaptive-fillOpacity700)] backdrop-blur-[10px] shadow-[var(--adaptive-popup-shadow)]";
const TOOLTIP_FIXED_CLASS = `fixed z-[1000001] ${TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipFadeIn}`;

const MARKER_ANCHOR_BASE_CLASS = "pointer-events-none fixed z-[1000000]";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center";
const OVERFLOW_HINT_BASE_CLASS = "pointer-events-auto fixed z-[1000000] flex items-center justify-center rounded-full bg-[#000000b3] backdrop-blur-[6px]";
const OVERFLOW_HINT_TEXT_CLASS = "max-w-[220px] whitespace-nowrap px-[10px] py-[6px] text-[12px] font-medium leading-none text-white";
const OVERFLOW_HINT_ARROW_CLASS = "flex h-[28px] w-[28px] items-center justify-center text-[16px] font-semibold leading-none";
const MODAL_GHOST_LAYER_CLASS = "pointer-events-none fixed inset-0 z-[999999]";
const REPORT_MODE_MARKER_PROXIMITY_PX = 56;

type MarkerOverflowHintButtonProps = {
    hint: MarkerOverflowHint;
    label: string;
    onActivate: (hint: MarkerOverflowHint) => void;
};

function MarkerOverflowHintButton({ hint, label, onActivate }: MarkerOverflowHintButtonProps) {
    const isVertical = hint.edge === "top" || hint.edge === "bottom";
    const transform = hint.edge === "top" ? "translate(-50%, 0)" : hint.edge === "bottom" ? "translate(-50%, -100%)" : hint.edge === "left" ? "translate(0, -50%)" : "translate(-100%, -50%)";

    return (
        <button
            type="button"
            data-fivepixels-interactive=""
            aria-label={label}
            onClick={() => onActivate(hint)}
            className={OVERFLOW_HINT_BASE_CLASS}
            style={{
                left: hint.left,
                top: hint.top,
                transform,
            }}
        >
            {isVertical ? <span className={OVERFLOW_HINT_TEXT_CLASS}>{label}</span> : <span className={OVERFLOW_HINT_ARROW_CLASS}>{hint.edge === "left" ? "←" : "→"}</span>}
        </button>
    );
}

function DetachedModalGhostFrame({ label }: { label: string }) {
    return (
        <div
            className={`${MODAL_GHOST_LAYER_CLASS} flex items-center justify-center bg-[var(--adaptive-neutralTintOpacity900)] p-[24px] text-center text-[14px] font-semibold text-[var(--adaptive-black900)] backdrop-blur-[10px] ${MOTION.tooltipFadeIn}`}
            aria-hidden
        >
            {label}
        </div>
    );
}

type MarkerButtonProps = {
    markerItem: Marker;
    isHovered: boolean;
    isReportMode: boolean;
    isInteractive: boolean;
    isProximityHighlighted: boolean;
    isWindowOpen: boolean;
    viewingWindowBadge: string;
    detachedAriaLabel: string;
    detachedModalAriaLabel: string;
    markerAppearance: MarkerAppearancePreferences;
    typography: TypographyPreferences;
    onActivate: (report: ReportFeedback) => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    onPointerMove: (clientX: number, clientY: number) => void;
};

function MarkerButton({
    markerItem,
    isHovered,
    isReportMode,
    isInteractive,
    isProximityHighlighted,
    isWindowOpen,
    viewingWindowBadge,
    detachedAriaLabel,
    detachedModalAriaLabel,
    markerAppearance,
    typography,
    onActivate,
    onHoverStart,
    onHoverEnd,
    onPointerMove,
}: MarkerButtonProps) {
    const hoverRef = useNativeHover<HTMLButtonElement>({
        onEnter: () => {
            if (!isInteractive) {
                return;
            }

            onHoverStart();
        },
        onLeave: () => {
            if (!isInteractive) {
                return;
            }

            onHoverEnd();
        },
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
    const paint = resolveMarkerGlyphPaint({
        color: markerColor,
        fillStyle: markerAppearance.fillStyle,
        strokeColor: markerAppearance.strokeColor,
        strokeWidthPx: shapeStyle.strokeWidthPx,
    });
    const replyBadgeSize = getMarkerReplyBadgeSize(dotSize);
    const scaleClass = isHovered ? "scale-[1.4]" : isReportMode && isProximityHighlighted ? "scale-110" : "";

    return (
        <div
            className={`${MARKER_ANCHOR_BASE_CLASS} ${shapeStyle.anchorClass}`}
            style={{
                left: markerItem.left,
                top: markerItem.top,
            }}
        >
            <div
                className={`relative transition-opacity duration-150 ${
                    isInteractive
                        ? "pointer-events-auto opacity-100"
                        : isReportMode
                          ? isProximityHighlighted
                              ? "pointer-events-none opacity-100"
                              : "pointer-events-none opacity-50"
                          : "pointer-events-auto"
                }`}
            >
                <div className={`relative transition-transform duration-150 ${scaleClass}`}>
                    <button
                        ref={hoverRef}
                        key={markerItem.id}
                        type="button"
                        data-fivepixels-interactive=""
                        data-marker-report-id={markerItem.report.id}
                        aria-label={isDetached ? `${resolvedDetachedAriaLabel} · ${markerLabel}` : markerLabel}
                        aria-hidden={isInteractive ? undefined : isReportMode || undefined}
                        tabIndex={isInteractive ? 0 : isReportMode ? -1 : undefined}
                        onClick={
                            isInteractive
                                ? (event) => {
                                      event.stopPropagation();
                                      onActivate(markerItem.report);
                                  }
                                : undefined
                        }
                        onPointerMove={
                            isInteractive
                                ? (event) => {
                                      onPointerMove(event.clientX, event.clientY);
                                  }
                                : undefined
                        }
                        className={`${MARKER_BUTTON_BASE_CLASS} relative border-0 bg-transparent p-0 shadow-none ${isInteractive ? "" : isReportMode ? "" : isDetached ? "opacity-75" : ""}`}
                        style={{
                            pointerEvents: isInteractive ? "auto" : isReportMode ? "none" : "auto",
                            width: shapeStyle.width,
                            height: shapeStyle.height,
                            minWidth: shapeStyle.width,
                            minHeight: shapeStyle.height,
                            fontFamily: showMarkerLabel ? typography.fontFamily : undefined,
                        }}
                    >
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <MarkerShapeGlyph
                                shape={glyphShape}
                                fill={paint.fill}
                                width={shapeStyle.width}
                                height={shapeStyle.height}
                                stroke={paint.stroke}
                                strokeWidthPx={paint.strokeWidthPx}
                            />
                        </span>
                        <span className={`relative z-[1] flex items-center justify-center ${showMarkerLabel ? MARKER_BADGE_LABEL_CLASS : ""}`}>{showMarkerLabel ? badgeDisplay.content : null}</span>
                    </button>
                    {aggregateCount > 1 ? (
                        <span
                            aria-hidden
                            className="pointer-events-none absolute z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white px-[4px] text-[10px] font-bold leading-none text-white"
                            style={{
                                top: -5,
                                right: -5,
                                backgroundColor: markerColor,
                                boxShadow: "0 1px 4px #00000040",
                            }}
                        >
                            {aggregateCount}
                        </span>
                    ) : null}
                    {showReplyIndicator ? (
                        <MarkerReplyBadge
                            size={replyBadgeSize}
                            accentColor={markerColor}
                        />
                    ) : null}
                    {isWindowOpen ? (
                        <span
                            aria-hidden
                            className="pointer-events-none absolute left-1/2 top-full z-20 mt-[2px] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-[2px] py-[1px] text-[10px] font-semibold leading-none text-white"
                        >
                            {viewingWindowBadge}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export function MarkerLayer() {
    const { messages, markerAppearance, typography, showHiddenDetachedMarkers, showModalDetachedMarkers } = useReportPreferences();
    const {
        mode,
        markers,
        openReplyReportIds,
        tooltipReport,
        tooltipAnchor,
        editingReportId,
        hoverPointer,
        setHoverPointer,
        activateFeedbackMarker,
        beginFeedbackEdit,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
    } = useReportSession();

    const handleMarkerHoverStart = useCallback(
        (reportId: string) => {
            clearHoverLeaveTimeout();
            setHoveredMarkerId(reportId);
        },
        [clearHoverLeaveTimeout, setHoveredMarkerId],
    );

    const handleMarkerHoverEnd = useCallback(
        (reportId: string) => {
            setHoverPointer(null);

            if (openReplyReportIds.length > 0) {
                scheduleHoverLeave(reportId);
                return;
            }

            clearHoverLeaveTimeout();
            setHoveredMarkerId((current) => (current === reportId ? null : current));
        },
        [clearHoverLeaveTimeout, openReplyReportIds.length, scheduleHoverLeave, setHoverPointer, setHoveredMarkerId],
    );

    const handleMarkerActivate = useCallback(
        (report: ReportFeedback) => {
            if (report.category === "memo") {
                beginFeedbackEdit(report);
                return;
            }

            void activateFeedbackMarker(report);
        },
        [activateFeedbackMarker, beginFeedbackEdit],
    );

    const openReplyReportIdSet = useMemo(() => new Set(openReplyReportIds), [openReplyReportIds]);
    const isHoveringOpenWindow = Boolean(tooltipReport && openReplyReportIdSet.has(tooltipReport.id));

    const isViewMode = mode === "view";
    const isReportMode = mode === "report";
    const visibleMarkers = useMemo(
        () =>
            markers.filter((marker) => {
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
            }),
        [markers, showHiddenDetachedMarkers, showModalDetachedMarkers],
    );
    const overflowHints = useMemo(() => resolveMarkerOverflowHints(visibleMarkers), [visibleMarkers]);
    const proximityHighlightedMarkerId = useMemo(() => {
        if (!isReportMode || !hoverPointer) {
            return null;
        }

        let closestMarkerId: string | null = null;
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

    const getOverflowHintLabel = useCallback(
        (hint: MarkerOverflowHint) => {
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
        },
        [messages.marker],
    );

    const handleOverflowHintActivate = useCallback((hint: MarkerOverflowHint) => {
        scrollContainerTowardEdge(hint.containerId, hint.edge);
    }, []);

    const showTooltip = Boolean(tooltipReport && tooltipAnchor) && (!editingReportId || tooltipReport?.id !== editingReportId) && !isHoveringOpenWindow;
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(tooltipAnchor, false, showTooltip);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;

    const bindHoverTooltipRef = useCallback(
        (node: HTMLDivElement | null) => {
            setTooltipElement(node);
        },
        [setTooltipElement],
    );

    if (!isViewMode && !isReportMode) {
        return null;
    }

    return (
        <>
            {isViewMode && ghostFrameMarker ? <DetachedModalGhostFrame label={messages.marker.detachedModalHint} /> : null}

            {visibleMarkers.map((markerItem) => {
                const isMemoMarker = markerItem.report.category === "memo";
                const isInteractive = isViewMode || isMemoMarker;
                const isHovered = isInteractive && tooltipReport?.id === markerItem.report.id && !openReplyReportIdSet.has(markerItem.report.id);

                return (
                    <MarkerButton
                        key={markerItem.id}
                        markerItem={markerItem}
                        isHovered={isHovered}
                        isReportMode={isReportMode}
                        isInteractive={isInteractive}
                        isProximityHighlighted={markerItem.id === proximityHighlightedMarkerId}
                        isWindowOpen={openReplyReportIdSet.has(markerItem.report.id)}
                        viewingWindowBadge={messages.marker.viewingWindowBadge}
                        detachedAriaLabel={messages.marker.detachedAriaLabel}
                        detachedModalAriaLabel={messages.marker.detachedModalAriaLabel}
                        markerAppearance={markerAppearance}
                        typography={typography}
                        onActivate={handleMarkerActivate}
                        onHoverStart={() => handleMarkerHoverStart(markerItem.report.id)}
                        onHoverEnd={() => handleMarkerHoverEnd(markerItem.report.id)}
                        onPointerMove={(clientX, clientY) => setHoverPointer({ clientX, clientY })}
                    />
                );
            })}

            {isViewMode
                ? overflowHints.map((hint) => (
                      <MarkerOverflowHintButton
                          key={hint.id}
                          hint={hint}
                          label={getOverflowHintLabel(hint)}
                          onActivate={handleOverflowHintActivate}
                      />
                  ))
                : null}

            {showTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle ? (
                <div
                    ref={bindHoverTooltipRef}
                    className={`pointer-events-none ${TOOLTIP_FIXED_CLASS}`}
                    style={{
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,

                        ...tooltipAnchorStyle,
                        pointerEvents: "none",
                    }}
                >
                    <FeedbackHoverCard
                        report={tooltipReport}
                        detached={Boolean(tooltipAnchor?.detached)}
                        detachedKind={tooltipAnchor?.detachedKind ?? null}
                        detachedHint={messages.marker.detachedHint}
                        detachedModalHint={messages.marker.detachedModalHint}
                    />
                </div>
            ) : null}
        </>
    );
}
