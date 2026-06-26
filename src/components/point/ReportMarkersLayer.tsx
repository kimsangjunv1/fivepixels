import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNativeHover } from "@/hooks/useNativeHover.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useReport } from "@/providers/reportContext.js";
import type { Marker, MarkerOverflowHint } from "@/types/report-ui.js";
import type { ReportFeedback } from "@/types/report.js";
import { resolveMarkerOverflowHints } from "@/utils/coordinates.js";
import { scrollContainerTowardEdge } from "@/utils/dom.js";
import { getDetachedMarkerAriaLabel, getDetachedMarkerHint, getModalGhostFrame } from "@/utils/markerContext.js";
import { getMarkerColor } from "@/utils/reportVisual.js";
import { FeedbackComposer } from "@/components/panel/feedback/FeedbackComposer.js";
import { FeedbackHoverCard } from "@/components/panel/feedback/FeedbackHoverCard.js";
import { FeedbackIssuePinnedHeader } from "@/components/panel/feedback/FeedbackIssuePinnedHeader.js";
import { buildConfirmAuthorOptions, shouldShowReplyComposer } from "@/utils/feedbackThread.js";
import { FeedbackThread } from "@/components/panel/feedback/FeedbackThread.js";

const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)]";
const TOOLTIP_FIXED_CLASS = `fixed z-[1000001] ${TOOLTIP_SURFACE_CLASS}`;
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";

const MARKER_ANCHOR_CLASS = "pointer-events-none fixed z-[1000000] -translate-x-1/2 -translate-y-1/2";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center";
const OVERFLOW_HINT_BASE_CLASS =
    "pointer-events-auto fixed z-[1000000] flex items-center justify-center rounded-full border border-white/80 bg-[#000000b3] text-white shadow-[0_4px_10px_#00000090] backdrop-blur-[6px]";
const OVERFLOW_HINT_TEXT_CLASS = "max-w-[220px] whitespace-nowrap px-[10px] py-[6px] text-[12px] font-medium leading-none";
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
    onActivate: (report: ReportFeedback) => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
};

function MarkerButton({ markerItem, isSelected, detachedAriaLabel, detachedModalAriaLabel, onActivate, onHoverStart, onHoverEnd }: MarkerButtonProps) {
    const hoverRef = useNativeHover<HTMLButtonElement>({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    const replyCount = markerItem.report.replies.length;
    const markerLabel =
        replyCount > 0 ? `${markerItem.report.report_type} · ${markerItem.report.report_id} · ${replyCount} replies` : `${markerItem.report.report_type} · ${markerItem.report.report_id}`;
    const isDetached = markerItem.detached;
    const isModalDetached = markerItem.detachedKind === "modal";
    const resolvedDetachedAriaLabel = getDetachedMarkerAriaLabel(markerItem.detachedKind, {
        detachedAriaLabel,
        detachedModalAriaLabel,
    });
    const markerShapeClass = isModalDetached ? "rounded-[5px]" : "rounded-full";
    const ringShapeClass = isModalDetached ? "rounded-[8px]" : "rounded-full";
    const ringColorClass = isModalDetached ? "border-[#a5b4fc]/90" : "border-white/80";

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
                        className={`pointer-events-none absolute -inset-[6px] border border-dashed ${ringShapeClass} ${ringColorClass}`}
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
                    className={`${
                        isSelected
                            ? `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] scale-[1.4] border-white shadow-[0_4px_10px_#00000090]`
                            : `${MARKER_BUTTON_BASE_CLASS} min-h-[16px] min-w-[16px] border-[2px] border-white shadow-[0_4px_10px_#00000090]`
                    } ${markerShapeClass} ${replyCount > 0 ? "p-[4px_8px] text-white" : ""} ${isDetached ? "border-dashed opacity-75" : ""}`}
                    style={{
                        backgroundColor: getMarkerColor(markerItem.report),
                        pointerEvents: "auto",
                    }}
                >
                    {replyCount > 0 ? (
                        `+${replyCount}`
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
        errorMessage,
        setErrorMessage,
        isUpdating,
        editingReportId,
        messages,
        locale,
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
        startAskQuestion,
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
        if (!activeReplyReport) {
            return false;
        }

        return shouldShowReplyComposer(activeReplyReport, pendingComposer);
    }, [activeReplyReport, pendingComposer]);

    const isCreatorQuestionComposer = pendingComposer?.type === "question";
    const composerAuthors = useMemo(() => {
        if (!activeReplyReport || !isCreatorQuestionComposer) {
            return authors;
        }

        return buildConfirmAuthorOptions(activeReplyReport, authors);
    }, [activeReplyReport, authors, isCreatorQuestionComposer]);

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
    const resolvedDetachedHint = tooltipAnchor
        ? getDetachedMarkerHint(tooltipAnchor.detachedKind, {
              detachedHint: messages.marker.detachedHint,
              detachedModalHint: messages.marker.detachedModalHint,
          })
        : null;

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
            {ghostFrameMarker ? <DetachedModalGhostFrame markerItem={ghostFrameMarker} /> : null}

            {visibleMarkers.map((markerItem) => (
                <MarkerButton
                    key={markerItem.id}
                    markerItem={markerItem}
                    isSelected={markerItem.report.id === selectedReport?.id}
                    detachedAriaLabel={messages.marker.detachedAriaLabel}
                    detachedModalAriaLabel={messages.marker.detachedModalAriaLabel}
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
                        detachedKind={tooltipAnchor?.detachedKind ?? null}
                        detachedHint={messages.marker.detachedHint}
                        detachedModalHint={messages.marker.detachedModalHint}
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
                            className="flex max-h-[512px] flex-col"
                        >
                            <FeedbackIssuePinnedHeader
                                report={activeReplyReport}
                                locale={locale}
                            />

                            {tooltipAnchor?.detached && resolvedDetachedHint ? (
                                <p className="shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] pb-[10px] text-[12px] leading-[1.4] text-[var(--adaptive-black500)]">
                                    {resolvedDetachedHint}
                                </p>
                            ) : null}

                            <div className="flex min-h-0 flex-1 flex-col">
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
                                    onStartAskQuestion={startAskQuestion}
                                    onConfirm={() => void handleConfirmResolution()}
                                    isUpdating={isUpdating}
                                />

                                {showComposer ? (
                                    <section className="relative shrink-0 overflow-visible border-t border-[var(--adaptive-border-subtle)] bg-transparent">
                                        <FeedbackComposer
                                            message={replyDraft}
                                            onMessageChange={(value) => {
                                                setReplyDraft(value);

                                                if (errorMessage) {
                                                    setErrorMessage("");
                                                }
                                            }}
                                            authorName={isCreatorQuestionComposer ? confirmAuthorName : replyAuthorName}
                                            onAuthorNameChange={isCreatorQuestionComposer ? setConfirmAuthorName : setReplyAuthorName}
                                            authors={composerAuthors}
                                            fields={fields}
                                            fieldValues={activeReplyReport.field_values}
                                            onFieldChange={() => undefined}
                                            showTags={false}
                                            onSubmit={() => void handleReplySubmit()}
                                            isSubmitting={isUpdating}
                                            autoFocus={pendingComposer !== null}
                                            askQuestionForced={isCreatorQuestionComposer}
                                            errorMessage={errorMessage}
                                        />
                                    </section>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
