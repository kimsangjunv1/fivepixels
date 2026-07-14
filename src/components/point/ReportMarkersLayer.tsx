import { useCallback, useMemo } from "react";
import { useNativeHover } from "@/hooks/useNativeHover.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useReport } from "@/providers/reportContext.js";
import type { Marker, MarkerOverflowHint } from "@/types/report-ui.js";
import type { ReportFeedback } from "@/types/report.js";
import { resolveMarkerOverflowHints } from "@/utils/coordinates.js";
import { scrollContainerTowardEdge } from "@/utils/dom.js";
import { getDetachedMarkerAriaLabel, getModalGhostFrame } from "@/utils/markerContext.js";
import { getMarkerDotSize } from "@/utils/markerRuntime.js";
import { resolveMarkerShapeStyle } from "@/utils/markerShape.js";
import type { MarkerAppearancePreferences, TypographyPreferences } from "@/constants/markerAppearance.js";
import { getMarkerLabelFontSizePx } from "@/constants/markerAppearance.js";
import { getMarkerColor, getMarkerDisplayLabel } from "@/utils/reportVisual.js";
import { FeedbackHoverCard } from "@/components/panel/feedback/FeedbackHoverCard.js";
import { getReplyCount } from "@/utils/feedbackThread.js";
import { MarkerFeedbackWindow } from "./MarkerFeedbackWindow.js";

const TOOLTIP_SURFACE_CLASS =
    "overflow-hidden rounded-[12px] border-[3px] border-[var(--adaptive-black200)] bg-[var(--adaptive-fillOpacity800)] backdrop-blur-[5px] shadow-[var(--adaptive-popup-shadow)]";
// "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-blackOpacity500)] backdrop-blur-[10px] shadow-[var(--adaptive-popup-shadow)]";
const TOOLTIP_FIXED_CLASS = `fixed z-[1000001] ${TOOLTIP_SURFACE_CLASS}`;

const MARKER_ANCHOR_BASE_CLASS = "pointer-events-none fixed z-[1000000]";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center";
const OVERFLOW_HINT_BASE_CLASS = "pointer-events-auto fixed z-[1000000] flex items-center justify-center rounded-full bg-[#000000b3] backdrop-blur-[6px]";
const OVERFLOW_HINT_TEXT_CLASS = "max-w-[220px] whitespace-nowrap px-[10px] py-[6px] text-[12px] font-medium leading-none text-white";
const OVERFLOW_HINT_ARROW_CLASS = "flex h-[28px] w-[28px] items-center justify-center text-[16px] font-semibold leading-none";
const MODAL_GHOST_LAYER_CLASS = "pointer-events-none fixed inset-0 z-[999999]";

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

type DetachedModalGhostFrameProps = {
    markerItem: Marker;
};

function DetachedModalGhostFrame({ markerItem }: DetachedModalGhostFrameProps) {
    const frame = useMemo(() => getModalGhostFrame(markerItem.report), [markerItem.report]);

    return (
        <div
            className={MODAL_GHOST_LAYER_CLASS}
            aria-hidden
        >
            <div
                className="absolute bg-[#0f172a]/12"
                style={{
                    left: frame.backdrop.left,
                    top: frame.backdrop.top,
                    width: frame.backdrop.width,
                    height: frame.backdrop.height,
                }}
            />
            <div
                className="absolute rounded-[20px] border-2 border-dashed border-[#818cf8]/80 bg-white/10 shadow-[0_18px_48px_rgba(79,70,229,0.18)]"
                style={{
                    left: frame.dialog.left,
                    top: frame.dialog.top,
                    width: frame.dialog.width,
                    height: frame.dialog.height,
                }}
            />
        </div>
    );
}

type MarkerButtonProps = {
    markerItem: Marker;
    isSelected: boolean;
    detachedAriaLabel: string;
    detachedModalAriaLabel: string;
    markerAppearance: MarkerAppearancePreferences;
    typography: TypographyPreferences;
    onActivate: (report: ReportFeedback) => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
};

function MarkerButton({ markerItem, isSelected, detachedAriaLabel, detachedModalAriaLabel, markerAppearance, typography, onActivate, onHoverStart, onHoverEnd }: MarkerButtonProps) {
    const hoverRef = useNativeHover<HTMLButtonElement>({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = getReplyCount(markerItem.report);
    const markerBadgeLabel = getMarkerDisplayLabel(markerItem.report, replyCount);
    const markerLabel = markerBadgeLabel
        ? `${markerItem.report.report_type} · ${markerItem.report.report_id} · ${markerBadgeLabel}`
        : `${markerItem.report.report_type} · ${markerItem.report.report_id}`;
    const isDetached = markerItem.detached;
    const isModalDetached = markerItem.detachedKind === "modal";
    const resolvedDetachedAriaLabel = getDetachedMarkerAriaLabel(markerItem.detachedKind, {
        detachedAriaLabel,
        detachedModalAriaLabel,
    });
    const dotSize = getMarkerDotSize();
    const showMarkerLabel = typography.fontSize !== "none" && Boolean(markerBadgeLabel);
    const shapeStyle = resolveMarkerShapeStyle(markerAppearance.shape, dotSize, showMarkerLabel, isModalDetached);
    const ringColorClass = isModalDetached ? "border-[#a5b4fc]/90" : "border-white/80";
    const markerFontSizePx = typography.fontSize === "none" ? undefined : getMarkerLabelFontSizePx(typography.fontSize);

    return (
        <div
            className={`${MARKER_ANCHOR_BASE_CLASS} ${shapeStyle.anchorClass}`}
            style={{
                left: markerItem.left,
                top: markerItem.top,
            }}
        >
            <div className="relative pointer-events-auto">
                {isDetached ? (
                    <div
                        aria-hidden
                        className={`pointer-events-none absolute -inset-[6px] border border-dashed ${shapeStyle.ringClass} ${ringColorClass}`}
                    />
                ) : null}
                <button
                    ref={hoverRef}
                    key={markerItem.id}
                    type="button"
                    data-fivepixels-interactive=""
                    data-marker-report-id={markerItem.report.id}
                    aria-label={isDetached ? `${resolvedDetachedAriaLabel} · ${markerLabel}` : markerLabel}
                    onClick={() => {
                        void onActivate(markerItem.report);
                    }}
                    className={`${MARKER_BUTTON_BASE_CLASS} border-[2px] border-white shadow-[0_4px_10px_#00000090] ${shapeStyle.shapeClass} ${
                        isSelected ? "scale-[1.4]" : ""
                    } ${isDetached ? "border-dashed opacity-75" : ""} ${showMarkerLabel ? "text-white" : ""}`}
                    style={{
                        backgroundColor: getMarkerColor(markerItem.report, markerAppearance.colors),
                        pointerEvents: "auto",
                        width: shapeStyle.width,
                        height: shapeStyle.height,
                        minWidth: shapeStyle.width,
                        minHeight: shapeStyle.height,
                        paddingLeft: shapeStyle.paddingX,
                        paddingRight: shapeStyle.paddingX,
                        clipPath: shapeStyle.clipPath,
                        fontSize: markerFontSizePx === undefined ? undefined : `${markerFontSizePx}px`,
                        fontFamily: showMarkerLabel ? typography.fontFamily : undefined,
                    }}
                >
                    {showMarkerLabel ? (
                        markerBadgeLabel
                    ) : isModalDetached ? (
                        <span
                            aria-hidden
                            className="block h-[7px] w-[9px] border border-white/90 bg-white/15"
                        />
                    ) : null}
                </button>
            </div>
        </div>
    );
}

export function ReportMarkersLayer() {
    const {
        mode,
        markers,
        selectedReport,
        activeReplyReport,
        activeReplyReportId,
        tooltipReport,
        tooltipAnchor,
        editingReportId,
        messages,
        markerAppearance,
        typography,
        selectReport,
        activateFeedbackMarker,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
    } = useReport();

    const handleMarkerHoverStart = useCallback(
        (reportId: string) => {
            clearHoverLeaveTimeout();
            setHoveredMarkerId(reportId);
            if (!editingReportId) {
                selectReport(reportId);
            }
        },
        [clearHoverLeaveTimeout, editingReportId, selectReport, setHoveredMarkerId],
    );

    const handleMarkerHoverEnd = useCallback(
        (reportId: string) => {
            if (activeReplyReportId) {
                scheduleHoverLeave(reportId);
                return;
            }

            clearHoverLeaveTimeout();
            setHoveredMarkerId((current) => (current === reportId ? null : current));
        },
        [activeReplyReportId, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId],
    );

    const isExpandedTooltip = Boolean(activeReplyReport && tooltipReport && activeReplyReport.id === tooltipReport.id);

    const isViewMode = mode === "view";
    const visibleMarkers = useMemo(() => markers.filter((marker) => marker.clampedEdge === null), [markers]);
    const overflowHints = useMemo(() => resolveMarkerOverflowHints(markers), [markers]);
    const ghostFrameMarker = useMemo(() => {
        const activeReportId = tooltipReport?.id ?? selectedReport?.id;

        if (!activeReportId) {
            return null;
        }

        const marker = visibleMarkers.find((item) => item.report.id === activeReportId);

        if (!marker || marker.detachedKind !== "modal") {
            return null;
        }

        return marker;
    }, [selectedReport?.id, tooltipReport?.id, visibleMarkers]);

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

    const showTooltip = Boolean(tooltipReport && tooltipAnchor);
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(tooltipAnchor, isExpandedTooltip, showTooltip);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;

    const bindHoverTooltipRef = useCallback(
        (node: HTMLDivElement | null) => {
            setTooltipElement(node);
        },
        [setTooltipElement],
    );

    if (!isViewMode) {
        return null;
    }

    return (
        <>
            {ghostFrameMarker ? <DetachedModalGhostFrame markerItem={ghostFrameMarker} /> : null}

            {visibleMarkers.map((markerItem) => (
                <MarkerButton
                    key={markerItem.id}
                    markerItem={markerItem}
                    isSelected={markerItem.report.id === selectedReport?.id}
                    detachedAriaLabel={messages.marker.detachedAriaLabel}
                    detachedModalAriaLabel={messages.marker.detachedModalAriaLabel}
                    markerAppearance={markerAppearance}
                    typography={typography}
                    onActivate={activateFeedbackMarker}
                    onHoverStart={() => handleMarkerHoverStart(markerItem.report.id)}
                    onHoverEnd={() => handleMarkerHoverEnd(markerItem.report.id)}
                />
            ))}

            {overflowHints.map((hint) => (
                <MarkerOverflowHintButton
                    key={hint.id}
                    hint={hint}
                    label={getOverflowHintLabel(hint)}
                    onActivate={handleOverflowHintActivate}
                />
            ))}

            {showTooltip && !isExpandedTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle ? (
                <div
                    ref={bindHoverTooltipRef}
                    className={`pointer-events-none ${TOOLTIP_FIXED_CLASS}`}
                    style={{
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        width: tooltipPosition.width,
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

            {isExpandedTooltip && activeReplyReport && tooltipAnchor ? (
                <MarkerFeedbackWindow
                    key={activeReplyReport.id}
                    report={activeReplyReport}
                    anchor={tooltipAnchor}
                />
            ) : null}
        </>
    );
}
