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
                    }, className: "pointer-events-auto fixed z-[1000001] bg-[var(--adaptive-grey200)] rounded-[24px] shadow-[0_0_90px_0_var(--adaptive-greyOpacity300)] overflow-hidden", 
                    // className={
                    //     isExpandedTooltip
                    //         ? "pointer-events-auto fixed z-[1000001] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
                    //         : "pointer-events-auto fixed z-[1000001] w-[260px] cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
                    // }
                    style: {
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        width: isExpandedTooltip ? tooltipPosition.width : undefined,
                        pointerEvents: "auto",
                    }, children: [_jsxs("section", { className: "p-[16px] bg-[var(--adaptive-grey50)]", children: [_jsxs("strong", { className: "block text-sm font-semibold text-slate-900 dark:text-slate-100", children: [tooltipReport.report_type, " \u00B7 ", tooltipReport.report_id] }), _jsxs("div", { className: "mt-1 flex items-center justify-between gap-2", children: [_jsx("span", { className: "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200", style: getReplyStatusTone(hasReply(tooltipReport)), children: hasReply(tooltipReport) ? "답변 완료" : "답변 미완료" }), _jsx("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: formatDate(tooltipReport.created_at) })] })] }), tooltipFieldTags.length ? (_jsx("div", { className: "mt-1 flex flex-wrap items-center gap-1", children: tooltipFieldTags.map((fieldTag) => (_jsx("span", { className: "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200", children: fieldTag.label }, fieldTag.key))) })) : null, isExpandedTooltip && activeReplyReport ? (_jsxs("div", { 
                            // className="mt-2 space-y-2 border-t border-dashed border-slate-200 dark:border-slate-700"
                            onClick: (event) => event.stopPropagation(), onPointerDown: (event) => event.stopPropagation(), children: [_jsxs("section", { className: "p-[16px]", children: [_jsxs("div", { className: "flex flex-col items-start gap-[4px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-grey500)]", children: "feedback" }), _jsx("p", { className: "bg-[var(--adaptive-greyOpacity200)] p-[12px_16px] rounded-[12px] ", children: tooltipReport.message })] }), activeReplyReport.replies.length ? (_jsx("div", { className: "flex flex-col items-end gap-1.5 p-[4px]", children: activeReplyReport.replies.map((reply) => (_jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsx("p", { className: "text-right text-[12px] text-[var(--adaptive-grey500)]", children: "answer" }), _jsxs("div", { 
                                                        // className="rounded-md border border-slate-100 bg-slate-50 p-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                        className: "bg-[var(--adaptive-blueOpacity100)] p-[12px_16px] rounded-[12px] text-right", children: [_jsx("p", { className: "text-xs", children: reply.message }), _jsx("p", { className: "mt-0.5 text-[10px] text-slate-500 dark:text-slate-400", children: formatDate(reply.created_at) })] })] }, reply.id))) })) : null] }), _jsx("textarea", { value: replyDraft, onChange: (event) => setReplyDraft(event.target.value), placeholder: "\uB2F5\uBCC0\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", onClick: (event) => event.stopPropagation(), className: "h-16 w-full resize-none m-0 p-[12px] text-[var(--adaptive-grey900)] bg-[var(--adaptive-grey100)]" }), _jsxs("div", { className: "flex items-center justify-end gap-2 p-[8px]", children: [_jsx("button", { type: "button", "data-stitchable-interactive": "", onClick: (event) => {
                                                event.stopPropagation();
                                                closeReplyComposer();
                                            }, className: "p-[8px_12px] rounded-[12px] bg-[var(--adaptive-grey400)] text-[var(--adaptive-grey900)] font-semibold", children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", "data-stitchable-interactive": "", onClick: (event) => {
                                                event.stopPropagation();
                                                void handleReplySubmit();
                                            }, disabled: isUpdating, className: "p-[8px_12px] rounded-[12px] bg-[var(--adaptive-blue400)] text-[var(--adaptive-grey900)] font-semibold", children: isUpdating ? "전송 중..." : "전송" })] })] })) : null] }, `${tooltipReport.id}-${isExpandedTooltip ? "expanded" : "preview"}`)) : null })] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map