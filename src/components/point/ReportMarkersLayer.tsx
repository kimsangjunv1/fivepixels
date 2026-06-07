import { useCallback, useEffect, useMemo, useRef } from "react";
import { TARGET_COLOR, TARGET_SURFACE } from "@/constants/report.js";
import { AnimatedPresence, motion } from "@/components/motion/index.js";
import { useNativeHover } from "@/hooks/useNativeHover.js";
import { useReport } from "@/providers/reportContext.js";
import { getTooltipPosition } from "@/utils/coordinates.js";
import type { Marker } from "@/types/report-ui.js";
import { getMarkerColor } from "@/utils/reportVisual.js";
import { FeedbackComposer } from "@/components/panel/feedback/FeedbackComposer.js";
import { FeedbackHoverCard } from "@/components/panel/feedback/FeedbackHoverCard.js";
import { FeedbackIssueHeader } from "@/components/panel/feedback/FeedbackIssueHeader.js";
import { FeedbackThread } from "@/components/panel/feedback/FeedbackThread.js";
import { MarkerLocatePulse, TargetLocatePulse, useLocatePulseTick } from "./FeedbackLocatePulse.js";

const TOOLTIP_MOTION_TRANSITION = {
    delay: 0,
    type: "spring" as const,
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};

const TOOLTIP_BASE_CLASS =
    // "fixed z-[1000001] overflow-hidden rounded-[24px] bg-[var(--adaptive-blackOpacity900)] shadow-[0_0_90px_0_var(--adaptive-blackOpacity500)] backdrop-blur-sm border border-[2px] border-[var(--adaptive-black400)]";
    "fixed z-[1000001] overflow-hidden rounded-[24px] shadow-[0_0_90px_0_var(--adaptive-blackOpacity500)] border border-[2px] border-[var(--adaptive-black300)] backdrop-blur-[10px]";

const MARKER_BUTTON_BASE_CLASS = "pointer-events-auto fixed z-[1000000] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full";

type MarkerButtonProps = {
    markerItem: Marker;
    isSelected: boolean;
    isLocated: boolean;
    onSelect: () => void;
    onOpenReply: () => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
};

function MarkerButton({ markerItem, isSelected, isLocated, locatePulseTick, onSelect, onOpenReply, onHoverStart, onHoverEnd }: MarkerButtonProps & { locatePulseTick: number }) {
    const hoverRef = useNativeHover<HTMLButtonElement>({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });

    return (
        <>
            {isLocated ? (
                <MarkerLocatePulse
                    left={markerItem.left}
                    top={markerItem.top}
                    tick={locatePulseTick}
                    accentColor={getMarkerColor(markerItem.report)}
                />
            ) : null}

            <button
                ref={hoverRef}
                key={markerItem.id}
                type="button"
                data-stitchable-interactive=""
                data-marker-report-id={markerItem.report.id}
                aria-label={`${markerItem.report.report_type} · ${markerItem.report.report_id}`}
                onClick={() => {
                    onSelect();
                    onOpenReply();
                }}
                className={
                    isLocated
                        ? `${MARKER_BUTTON_BASE_CLASS} h-5 w-5 border-2 border-white/95 shadow-[0_0_18px_rgba(56,189,248,0.85)] ring-2 ring-sky-300/90`
                        : isSelected
                          ? `${MARKER_BUTTON_BASE_CLASS} h-5 w-5 border-2 border-white/80 shadow-lg ring-2 ring-white/30`
                          : `${MARKER_BUTTON_BASE_CLASS} h-4 w-4 border border-white/60 shadow-sm`
                }
                style={{
                    left: markerItem.left,
                    top: markerItem.top,
                    backgroundColor: getMarkerColor(markerItem.report),
                    pointerEvents: "auto",
                }}
            />
        </>
    );
}

export function ReportMarkersLayer() {
    const {
        mode,
        markers,
        selectedReport,
        locatedReportId,
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
        selectReport,
        openReplyComposer,
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
    const locatePulseTick = useLocatePulseTick(isViewMode && Boolean(locatedReportId));
    const locatedMarker = isViewMode ? (markers.find((markerItem) => markerItem.report.id === locatedReportId) ?? null) : null;

    if (!isViewMode) {
        return null;
    }

    const tooltipPosition = tooltipAnchor ? getTooltipPosition(tooltipAnchor, isExpandedTooltip) : null;
    const showTooltip = Boolean(tooltipReport && tooltipAnchor && tooltipPosition);

    return (
        <>
            {markers.map((markerItem) =>
                markerItem.rect && locatedReportId !== markerItem.report.id ? (
                    <div
                        key={`${markerItem.id}-rect`}
                        className="pointer-events-none fixed rounded-[3px] border border-sky-400/70 bg-sky-200/20 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                        style={{
                            left: markerItem.rect.left,
                            top: markerItem.rect.top,
                            width: markerItem.rect.width,
                            height: markerItem.rect.height,
                            outline: `1px solid ${TARGET_COLOR[markerItem.report.report_type]}`,
                            backgroundColor: TARGET_SURFACE[markerItem.report.report_type],
                        }}
                    />
                ) : null,
            )}

            {locatedMarker?.rect ? (
                <TargetLocatePulse
                    rect={locatedMarker.rect}
                    tick={locatePulseTick}
                    outlineColor={TARGET_COLOR[locatedMarker.report.report_type]}
                    surfaceColor={TARGET_SURFACE[locatedMarker.report.report_type]}
                />
            ) : null}

            {markers.map((markerItem) => (
                <MarkerButton
                    key={markerItem.id}
                    markerItem={markerItem}
                    isSelected={markerItem.report.id === selectedReport?.id}
                    isLocated={markerItem.report.id === locatedReportId}
                    locatePulseTick={locatePulseTick}
                    onSelect={() => selectReport(markerItem.report.id)}
                    onOpenReply={() => openReplyComposer(markerItem.report)}
                    onHoverStart={() => handleMarkerHoverStart(markerItem.report.id)}
                    onHoverEnd={() => handleMarkerHoverEnd(markerItem.report.id)}
                />
            ))}

            {showTooltip && !isExpandedTooltip && tooltipReport && tooltipPosition ? (
                <div
                    className={`pointer-events-none ${TOOLTIP_BASE_CLASS}`}
                    style={{
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        width: tooltipPosition.width,
                        pointerEvents: "none",
                    }}
                >
                    <FeedbackHoverCard
                        report={tooltipReport}
                        fieldTags={tooltipFieldTags}
                    />
                </div>
            ) : null}

            <AnimatedPresence>
                {showTooltip && isExpandedTooltip && tooltipReport && tooltipPosition && activeReplyReport ? (
                    <motion.div
                        ref={(node) => {
                            tooltipContainerRef.current = node;

                            if (node instanceof HTMLDivElement) {
                                expandedTooltipHoverRef(node);
                            }
                        }}
                        key={`${tooltipReport.id}-expanded`}
                        data-stitchable-interactive=""
                        initial={{ opacity: 0, y: 5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.97 }}
                        transition={TOOLTIP_MOTION_TRANSITION}
                        className={`pointer-events-auto ${TOOLTIP_BASE_CLASS}`}
                        style={{
                            left: tooltipPosition.left,
                            top: tooltipPosition.top,
                            width: tooltipPosition.width,
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

                            {showComposer ? (
                                <section className="backdrop-blur-[10px] bg-[var(--adaptive-blackOpacity900)]">
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
                    </motion.div>
                ) : null}
            </AnimatedPresence>
        </>
    );
}
