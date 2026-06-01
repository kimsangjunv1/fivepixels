import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback } from "react";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { AnimatedPresence, motion } from "../../components/motion/index.js";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getTooltipPosition } from "../../utils/coordinates.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
const TOOLTIP_MOTION_TRANSITION = {
    delay: 0,
    type: "spring",
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};
const MARKER_BUTTON_BASE_CLASS = "pointer-events-auto fixed z-[1000000] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full";
function MarkerButton({ markerItem, isSelected, onSelect, onOpenReply, onHoverStart, onHoverEnd }) {
    const hoverRef = useNativeHover({
        onEnter: onHoverStart,
        onLeave: onHoverEnd,
    });
    return (_jsx("button", { ref: hoverRef, type: "button", "data-stitchable-interactive": "", "data-marker-report-id": markerItem.report.id, "aria-label": `${markerItem.report.report_type} · ${markerItem.report.report_id}`, onClick: () => {
            onSelect();
            onOpenReply();
        }, className: isSelected
            ? `${MARKER_BUTTON_BASE_CLASS} h-5 w-5 border-2 border-sky-400 bg-sky-500 text-[10px] font-semibold text-white shadow-lg ring-2 ring-sky-300/60`
            : `${MARKER_BUTTON_BASE_CLASS} h-4 w-4 border border-slate-300 bg-slate-100 text-[9px] font-semibold text-slate-700 shadow-sm hover:border-sky-400 hover:bg-sky-50`, style: {
            left: markerItem.left,
            top: markerItem.top,
            backgroundColor: getMarkerColor(markerItem.report),
            pointerEvents: "auto",
        } }, markerItem.id));
}
export function ReportMarkersLayer() {
    const { mode, markers, selectedReport, activeReplyReportId, activeReplyReport, tooltipReport, tooltipAnchor, tooltipFieldTags, replyDraft, isUpdating, editingReportId, selectReport, openReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, closeReplyComposer, handleReplySubmit, } = useReport();
    const handleMarkerHoverStart = useCallback((reportId) => {
        clearHoverLeaveTimeout();
        setHoveredMarkerId(reportId);
        if (!editingReportId) {
            selectReport(reportId);
        }
    }, [clearHoverLeaveTimeout, editingReportId, selectReport, setHoveredMarkerId]);
    const handleMarkerHoverEnd = useCallback((reportId) => {
        scheduleHoverLeave(reportId);
    }, [scheduleHoverLeave]);
    const tooltipHoverRef = useNativeHover({
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
    return (_jsxs(_Fragment, { children: [markers.map((markerItem) => markerItem.rect ? (_jsx("div", { className: "pointer-events-none fixed rounded-[3px] border border-sky-400/70 bg-sky-200/20 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]", style: {
                    left: markerItem.rect.left,
                    top: markerItem.rect.top,
                    width: markerItem.rect.width,
                    height: markerItem.rect.height,
                    outline: `1px solid ${TARGET_COLOR[markerItem.report.report_type]}`,
                    backgroundColor: TARGET_SURFACE[markerItem.report.report_type],
                } }, `${markerItem.id}-rect`)) : null), markers.map((markerItem) => (_jsx(MarkerButton, { markerItem: markerItem, isSelected: markerItem.report.id === selectedReport?.id, onSelect: () => selectReport(markerItem.report.id), onOpenReply: () => openReplyComposer(markerItem.report), onHoverStart: () => handleMarkerHoverStart(markerItem.report.id), onHoverEnd: () => handleMarkerHoverEnd(markerItem.report.id) }, markerItem.id))), _jsx(AnimatedPresence, { children: showTooltip && tooltipReport && tooltipPosition ? (_jsxs(motion.div, { ref: tooltipHoverRef, "data-stitchable-interactive": "", initial: { opacity: 0, y: 5, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 5, scale: 0.97 }, transition: TOOLTIP_MOTION_TRANSITION, onClick: () => {
                        if (!isExpandedTooltip) {
                            openReplyComposer(tooltipReport);
                        }
                    }, className: isExpandedTooltip
                        ? "pointer-events-auto fixed z-[1000001] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
                        : "pointer-events-auto fixed z-[1000001] w-[260px] cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900", style: {
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        width: isExpandedTooltip ? tooltipPosition.width : undefined,
                        pointerEvents: "auto",
                    }, children: [_jsxs("strong", { className: "block text-sm font-semibold text-slate-900 dark:text-slate-100", children: [tooltipReport.report_type, " \u00B7 ", tooltipReport.report_id] }), _jsxs("div", { className: "mt-1 flex items-center justify-between gap-2", children: [_jsx("span", { className: "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200", style: getReplyStatusTone(hasReply(tooltipReport)), children: hasReply(tooltipReport) ? "답변 완료" : "답변 미완료" }), _jsx("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: formatDate(tooltipReport.created_at) })] }), tooltipFieldTags.length ? (_jsx("div", { className: "mt-1 flex flex-wrap items-center gap-1", children: tooltipFieldTags.map((fieldTag) => (_jsx("span", { className: "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200", children: fieldTag.label }, fieldTag.key))) })) : null, _jsx("p", { className: "mt-1 text-xs text-slate-700 dark:text-slate-200", children: tooltipReport.message }), isExpandedTooltip && activeReplyReport ? (_jsxs("div", { className: "mt-2 space-y-2 border-t border-dashed border-slate-200 pt-2 dark:border-slate-700", onClick: (event) => event.stopPropagation(), onPointerDown: (event) => event.stopPropagation(), children: [activeReplyReport.replies.length ? (_jsx("div", { className: "flex flex-col gap-1.5", children: activeReplyReport.replies.map((reply) => (_jsxs("div", { className: "rounded-md border border-slate-100 bg-slate-50 p-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200", children: [_jsx("p", { className: "text-xs", children: reply.message }), _jsx("p", { className: "mt-0.5 text-[10px] text-slate-500 dark:text-slate-400", children: formatDate(reply.created_at) })] }, reply.id))) })) : null, _jsx("textarea", { value: replyDraft, onChange: (event) => setReplyDraft(event.target.value), placeholder: "\uB2F5\uBCC0\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", onClick: (event) => event.stopPropagation(), className: "h-16 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700" }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", onClick: (event) => {
                                                event.stopPropagation();
                                                closeReplyComposer();
                                            }, className: "pointer-events-auto inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800", children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", onClick: (event) => {
                                                event.stopPropagation();
                                                void handleReplySubmit();
                                            }, disabled: isUpdating, className: "pointer-events-auto inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600", children: isUpdating ? "전송 중..." : "전송" })] })] })) : null] }, `${tooltipReport.id}-${isExpandedTooltip ? "expanded" : "preview"}`)) : null })] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map