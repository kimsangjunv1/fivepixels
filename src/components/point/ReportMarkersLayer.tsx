import { useCallback } from "react";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { AnimatedPresence, motion } from "../../components/motion/index.js";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getTooltipPosition } from "../../utils/coordinates.js";
import type { Marker } from "../../types/report-ui.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";

const TOOLTIP_MOTION_TRANSITION = {
    delay: 0,
    type: "spring" as const,
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};

const MARKER_BUTTON_BASE_CLASS = "pointer-events-auto fixed z-[1000000] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full";

type MarkerButtonProps = {
    markerItem: Marker;
    isSelected: boolean;
    onSelect: () => void;
    onOpenReply: () => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
};

function MarkerButton({ markerItem, isSelected, onSelect, onOpenReply, onHoverStart, onHoverEnd }: MarkerButtonProps) {
    const hoverRef = useNativeHover<HTMLButtonElement>({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });

    return (
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
                isSelected
                    ? `${MARKER_BUTTON_BASE_CLASS} h-5 w-5 border-2 border-sky-400 bg-sky-500 text-[10px] font-semibold text-white shadow-lg ring-2 ring-sky-300/60`
                    : `${MARKER_BUTTON_BASE_CLASS} h-4 w-4 border border-slate-300 bg-slate-100 text-[9px] font-semibold text-slate-700 shadow-sm hover:border-sky-400 hover:bg-sky-50`
            }
            style={{
                left: markerItem.left,
                top: markerItem.top,
                backgroundColor: getMarkerColor(markerItem.report),
                pointerEvents: "auto",
            }}
        />
    );
}

export function ReportMarkersLayer() {
    const {
        mode,
        markers,
        selectedReport,
        activeReplyReportId,
        activeReplyReport,
        tooltipReport,
        tooltipAnchor,
        tooltipFieldTags,
        replyDraft,
        isUpdating,
        editingReportId,
        selectReport,
        openReplyComposer,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
        setReplyDraft,
        closeReplyComposer,
        handleReplySubmit,
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
            scheduleHoverLeave(reportId);
        },
        [scheduleHoverLeave],
    );

    const tooltipHoverRef = useNativeHover<HTMLDivElement>({
        onEnter: () => {
            if (tooltipReport) {
                clearHoverLeaveTimeout();
                setHoveredMarkerId(tooltipReport.id);
            }
        },
        onLeave: () => {
            if (tooltipReport && !activeReplyReportId) {
                scheduleHoverLeave(tooltipReport.id);
            }
        },
    });

    if (mode !== "view") {
        return null;
    }

    const isExpandedTooltip = Boolean(activeReplyReport && tooltipReport && activeReplyReport.id === tooltipReport.id);
    const tooltipPosition = tooltipAnchor ? getTooltipPosition(tooltipAnchor, isExpandedTooltip) : null;
    const showTooltip = Boolean(tooltipReport && tooltipAnchor && tooltipPosition);

    return (
        <>
            {markers.map((markerItem) =>
                markerItem.rect ? (
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

            {markers.map((markerItem) => (
                <MarkerButton
                    key={markerItem.id}
                    markerItem={markerItem}
                    isSelected={markerItem.report.id === selectedReport?.id}
                    onSelect={() => selectReport(markerItem.report.id)}
                    onOpenReply={() => openReplyComposer(markerItem.report)}
                    onHoverStart={() => handleMarkerHoverStart(markerItem.report.id)}
                    onHoverEnd={() => handleMarkerHoverEnd(markerItem.report.id)}
                />
            ))}

            <AnimatedPresence>
                {showTooltip && tooltipReport && tooltipPosition ? (
                    <motion.div
                        ref={tooltipHoverRef}
                        key={`${tooltipReport.id}-${isExpandedTooltip ? "expanded" : "preview"}`}
                        data-stitchable-interactive=""
                        initial={{ opacity: 0, y: 5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.97 }}
                        transition={TOOLTIP_MOTION_TRANSITION}
                        onClick={() => {
                            if (!isExpandedTooltip) {
                                openReplyComposer(tooltipReport);
                            }
                        }}
                        className={
                            isExpandedTooltip
                                ? "pointer-events-auto fixed z-[1000001] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
                                : "pointer-events-auto fixed z-[1000001] w-[260px] cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
                        }
                        style={{
                            left: tooltipPosition.left,
                            top: tooltipPosition.top,
                            width: isExpandedTooltip ? tooltipPosition.width : undefined,
                            pointerEvents: "auto",
                        }}
                    >
                        <strong className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {tooltipReport.report_type} · {tooltipReport.report_id}
                        </strong>
                        <div className="mt-1 flex items-center justify-between gap-2">
                            <span
                                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                style={getReplyStatusTone(hasReply(tooltipReport))}
                            >
                                {hasReply(tooltipReport) ? "답변 완료" : "답변 미완료"}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(tooltipReport.created_at)}</span>
                        </div>
                        {tooltipFieldTags.length ? (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                                {tooltipFieldTags.map((fieldTag) => (
                                    <span
                                        key={fieldTag.key}
                                        className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {fieldTag.label}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">{tooltipReport.message}</p>
                        {isExpandedTooltip && activeReplyReport ? (
                            <div
                                className="mt-2 space-y-2 border-t border-dashed border-slate-200 pt-2 dark:border-slate-700"
                                onClick={(event) => event.stopPropagation()}
                                onPointerDown={(event) => event.stopPropagation()}
                            >
                                {activeReplyReport.replies.length ? (
                                    <div className="flex flex-col gap-1.5">
                                        {activeReplyReport.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="rounded-md border border-slate-100 bg-slate-50 p-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                <p className="text-xs">{reply.message}</p>
                                                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{formatDate(reply.created_at)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                                <textarea
                                    value={replyDraft}
                                    onChange={(event) => setReplyDraft(event.target.value)}
                                    placeholder="답변을 입력해주세요."
                                    onClick={(event) => event.stopPropagation()}
                                    className="h-16 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        data-stitchable-interactive=""
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            closeReplyComposer();
                                        }}
                                        className="pointer-events-auto inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                    >
                                        닫기
                                    </button>
                                    <button
                                        type="button"
                                        data-stitchable-interactive=""
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void handleReplySubmit();
                                        }}
                                        disabled={isUpdating}
                                        className="pointer-events-auto inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600"
                                    >
                                        {isUpdating ? "전송 중..." : "전송"}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                ) : null}
            </AnimatedPresence>
        </>
    );
}
