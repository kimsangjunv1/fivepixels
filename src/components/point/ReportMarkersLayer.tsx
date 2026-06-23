import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNativeHover } from "@/hooks/useNativeHover.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useReport } from "@/providers/reportContext.js";
import type { Marker, MarkerOverflowHint } from "@/types/report-ui.js";
import type { ReportFeedback } from "@/types/report.js";
import { resolveMarkerOverflowHints } from "@/utils/coordinates.js";
import { scrollContainerTowardEdge } from "@/utils/dom.js";
import { getMarkerColor } from "@/utils/reportVisual.js";
import { FeedbackComposer } from "@/components/panel/feedback/FeedbackComposer.js";
import { FeedbackHoverCard } from "@/components/panel/feedback/FeedbackHoverCard.js";
import { FeedbackIssueHeader } from "@/components/panel/feedback/FeedbackIssueHeader.js";
import { FeedbackThread } from "@/components/panel/feedback/FeedbackThread.js";

const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)]";
const TOOLTIP_FIXED_CLASS = `fixed z-[1000001] ${TOOLTIP_SURFACE_CLASS}`;
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";

const MARKER_ANCHOR_CLASS = "pointer-events-none fixed z-[1000000] -translate-x-1/2 -translate-y-1/2";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center rounded-full";
const OVERFLOW_HINT_BASE_CLASS =
    "pointer-events-auto fixed z-[1000000] flex items-center justify-center rounded-full border border-white/80 bg-[#000000b3] text-white shadow-[0_4px_10px_#00000090] backdrop-blur-[6px]";
const OVERFLOW_HINT_TEXT_CLASS = "max-w-[220px] whitespace-nowrap px-[10px] py-[6px] text-[12px] font-medium leading-none";
const OVERFLOW_HINT_ARROW_CLASS = "flex h-[28px] w-[28px] items-center justify-center text-[16px] font-semibold leading-none";

type MarkerOverflowHintButtonProps = {
    hint: MarkerOverflowHint;
    label: string;
    onActivate: (hint: MarkerOverflowHint) => void;
};

function MarkerOverflowHintButton({ hint, label, onActivate }: MarkerOverflowHintButtonProps) {
    const isVertical = hint.edge === "top" || hint.edge === "bottom";
    const transform =
        hint.edge === "top"
            ? "translate(-50%, 0)"
            : hint.edge === "bottom"
              ? "translate(-50%, -100%)"
              : hint.edge === "left"
                ? "translate(0, -50%)"
                : "translate(-100%, -50%)";

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

type MarkerButtonProps = {
    markerItem: Marker;
    isSelected: boolean;
    detachedAriaLabel: string;
    onActivate: (report: ReportFeedback) => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
};

function MarkerButton({ markerItem, isSelected, detachedAriaLabel, onActivate, onHoverStart, onHoverEnd }: MarkerButtonProps) {
    const hoverRef = useNativeHover<HTMLButtonElement>({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = markerItem.report.replies.length;
    const markerLabel =
        replyCount > 0 ? `${markerItem.report.report_type} · ${markerItem.report.report_id} · ${replyCount} replies` : `${markerItem.report.report_type} · ${markerItem.report.report_id}`;
    const isDetached = markerItem.detached;

    return (
        <div
            className={MARKER_ANCHOR_CLASS}
            style={{
                left: markerItem.left,
                top: markerItem.top,
            }}
        >
            <div className="relative pointer-events-auto">
                {isDetached ? (
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-[6px] rounded-full border border-dashed border-white/80"
                    />
                ) : null}
                <button
                    ref={hoverRef}
                    key={markerItem.id}
                    type="button"
                    data-fivepixels-interactive=""
                    data-marker-report-id={markerItem.report.id}
                    aria-label={isDetached ? `${detachedAriaLabel} · ${markerLabel}` : markerLabel}
                    onClick={() => {
                        void onActivate(markerItem.report);
                    }}
                    className={`${
                        isSelected
                            ? `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] scale-[1.4] border-white shadow-[0_4px_10px_#00000090]`
                            : `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] border-white shadow-[0_4px_10px_#00000090]`
                    } ${replyCount > 0 ? "p-[4px_8px] text-white" : ""} ${isDetached ? "border-dashed opacity-75" : ""}`}
                    style={{
                        backgroundColor: getMarkerColor(markerItem.report),
                        pointerEvents: "auto",
                    }}
                >
                    {replyCount > 0 ? `+${replyCount}` : null}
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
        fields,
        authors,
        activeReplyReportId,
        activeReplyReport,
        tooltipReport,
        tooltipAnchor,
        tooltipFieldTags,
        replyDraft,
        replyAuthorName,
        pendingComposer,
        isUpdating,
        editingReportId,
        messages,
        selectReport,
        activateFeedbackMarker,
        closeReplyComposer,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
        setReplyDraft,
        setReplyAuthorName,
        handleReplySubmit,
        startDenyReview,
        startCheckoutReview,
        confirmAuthorName,
        setConfirmAuthorName,
        showConfirmAuthorSelect,
        toggleConfirmAuthorSelect,
        handleConfirmResolution,
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

    const tooltipContainerRef = useRef<HTMLElement | null>(null);

    const expandedTooltipHoverRef = useNativeHover<HTMLDivElement>({
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

        const handlePointerDown = (event: PointerEvent) => {
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
    const visibleMarkers = useMemo(() => markers.filter((marker) => marker.clampedEdge === null), [markers]);
    const overflowHints = useMemo(() => resolveMarkerOverflowHints(markers), [markers]);

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

    const bindExpandedTooltipRef = useCallback(
        (node: HTMLDivElement | null) => {
            tooltipContainerRef.current = node;

            if (node instanceof HTMLDivElement) {
                expandedTooltipHoverRef(node);
            }

            setTooltipElement(node);
        },
        [expandedTooltipHoverRef, setTooltipElement],
    );

    if (!isViewMode) {
        return null;
    }

    return (
        <>
            {visibleMarkers.map((markerItem) => (
                <MarkerButton
                    key={markerItem.id}
                    markerItem={markerItem}
                    isSelected={markerItem.report.id === selectedReport?.id}
                    detachedAriaLabel={messages.marker.detachedAriaLabel}
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
                        fieldTags={tooltipFieldTags}
                        detached={Boolean(tooltipAnchor?.detached)}
                        detachedHint={messages.marker.detachedHint}
                    />
                </div>
            ) : null}

            {showTooltip && isExpandedTooltip && tooltipReport && tooltipPosition && tooltipAnchorStyle && activeReplyReport ? (
                <div
                    ref={bindExpandedTooltipRef}
                    data-fivepixels-interactive=""
                    className={EXPANDED_TOOLTIP_ANCHOR_CLASS}
                    style={{
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        width: tooltipPosition.width,
                        ...tooltipAnchorStyle,
                    }}
                >
                    <div
                        className={TOOLTIP_SURFACE_CLASS}
                        style={{
                            pointerEvents: "auto",
                        }}
                    >
                        <div
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                        >
                            <FeedbackIssueHeader
                                report={activeReplyReport}
                                fieldTags={tooltipFieldTags}
                                expanded
                            />

                            {tooltipAnchor?.detached ? (
                                <p className="border-b border-[var(--adaptive-border-subtle)] px-[12px] pb-[10px] text-[12px] leading-[1.4] text-[var(--adaptive-black500)]">
                                    {messages.marker.detachedHint}
                                </p>
                            ) : null}

                            {showComposer ? (
                                <section className="border-t border-[var(--adaptive-border-subtle)] bg-transparent">
                                    <FeedbackComposer
                                        message={replyDraft}
                                        onMessageChange={setReplyDraft}
                                        authorName={replyAuthorName}
                                        onAuthorNameChange={setReplyAuthorName}
                                        authors={authors}
                                        fields={fields}
                                        fieldValues={activeReplyReport.field_values}
                                        onFieldChange={() => undefined}
                                        showTags={false}
                                        onSubmit={() => void handleReplySubmit()}
                                        isSubmitting={isUpdating}
                                        autoFocus={pendingComposer !== null}
                                    />
                                </section>
                            ) : null}

                            <FeedbackThread
                                report={activeReplyReport}
                                authors={authors}
                                pendingComposer={pendingComposer}
                                confirmAuthorName={confirmAuthorName}
                                showConfirmAuthorSelect={showConfirmAuthorSelect}
                                onConfirmAuthorNameChange={setConfirmAuthorName}
                                onToggleConfirmAuthorSelect={toggleConfirmAuthorSelect}
                                onStartDeny={startDenyReview}
                                onStartCheckout={startCheckoutReview}
                                onConfirm={() => void handleConfirmResolution()}
                                isUpdating={isUpdating}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
