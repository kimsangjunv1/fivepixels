import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { AnimatedPresence, motion } from "../motion/index.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
import { btnPrimary, btnSecondary, textareaBase } from "../report/classes.js";
export function ReportMarkersLayer() {
    const { mode, markers, selectedReport, activeReplyReportId, activeReplyReport, tooltipReport, tooltipAnchor, tooltipFieldTags, replyDraft, isUpdating, editingReportId, selectReport, openReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, closeReplyComposer, handleReplySubmit, } = useReport();
    if (mode !== "view") {
        return null;
    }
    return (_jsxs(_Fragment, { children: [markers.map((marker) => marker.rect ? (_jsx("div", { className: "pointer-events-none fixed box-border rounded-sm", style: {
                    left: marker.rect.left,
                    top: marker.rect.top,
                    width: marker.rect.width,
                    height: marker.rect.height,
                    outline: `1px solid ${TARGET_COLOR[marker.report.report_type]}`,
                    backgroundColor: TARGET_SURFACE[marker.report.report_type],
                } }, `${marker.id}-rect`)) : null), markers.map((marker) => (_jsx("button", { type: "button", onClick: () => {
                    selectReport(marker.report.id);
                    openReplyComposer(marker.report);
                }, onMouseEnter: () => {
                    clearHoverLeaveTimeout();
                    setHoveredMarkerId(marker.report.id);
                    if (!editingReportId) {
                        selectReport(marker.report.id);
                    }
                }, onMouseLeave: () => scheduleHoverLeave(marker.report.id), title: `${marker.report.report_type} · ${marker.report.report_id}`, className: `pointer-events-auto fixed h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm dark:border-slate-900 ${marker.report.id === selectedReport?.id ? "ring-2 ring-slate-400" : ""}`, style: {
                    left: marker.left,
                    top: marker.top,
                    backgroundColor: getMarkerColor(marker.report),
                } }, marker.id))), _jsx(AnimatedPresence, { children: tooltipReport && tooltipAnchor ? (_jsxs(motion.div, { initial: { opacity: 0, transform: "translateY(5px)", scale: 0.97 }, animate: { opacity: 1, transform: "translateY(0px)", scale: 1 }, exit: { opacity: 0, transform: "translateY(5px)", scale: 0.97 }, transition: {
                        delay: 0,
                        type: "spring",
                        mass: 0.1,
                        stiffness: 100,
                        damping: 10,
                    }, onMouseEnter: () => {
                        clearHoverLeaveTimeout();
                        setHoveredMarkerId(tooltipReport.id);
                    }, onMouseLeave: () => {
                        if (!activeReplyReportId) {
                            scheduleHoverLeave(tooltipReport.id);
                        }
                    }, onClick: () => {
                        if (activeReplyReportId !== tooltipReport.id) {
                            openReplyComposer(tooltipReport);
                        }
                    }, className: `pointer-events-auto fixed z-[2147483647] max-w-[calc(100vw-32px)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 ${activeReplyReport ? "w-80" : "w-72"}`, style: {
                        left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                        top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                    }, children: [_jsxs("strong", { className: "block text-sm font-semibold text-slate-900 dark:text-slate-100", children: [tooltipReport.report_type, " \u00B7 ", tooltipReport.report_id] }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("span", { className: "rounded-full px-2 py-0.5 text-[11px] font-medium", style: getReplyStatusTone(hasReply(tooltipReport)), children: hasReply(tooltipReport) ? "답변 완료" : "답변 미완료" }), _jsx("span", { className: "text-xs text-slate-500 dark:text-slate-400", children: formatDate(tooltipReport.created_at) })] }), tooltipFieldTags.length ? (_jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: tooltipFieldTags.map((fieldTag) => (_jsx("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300", children: fieldTag.label }, fieldTag.key))) })) : null, _jsx("p", { className: "mt-2 text-sm text-slate-700 dark:text-slate-200", children: tooltipReport.message }), activeReplyReport ? (_jsxs("div", { className: "mt-3 border-t border-slate-200 pt-3 dark:border-slate-700", onClick: (event) => event.stopPropagation(), onMouseDown: (event) => event.stopPropagation(), children: [activeReplyReport.replies.length ? (_jsx("div", { className: "mb-3 flex max-h-32 flex-col gap-2 overflow-auto", children: activeReplyReport.replies.map((reply) => (_jsxs("div", { className: "rounded-lg bg-slate-50 p-2 dark:bg-slate-800", children: [_jsx("p", { className: "text-sm text-slate-700 dark:text-slate-200", children: reply.message }), _jsx("p", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400", children: formatDate(reply.created_at) })] }, reply.id))) })) : null, _jsx("textarea", { value: replyDraft, onChange: (event) => setReplyDraft(event.target.value), placeholder: "\uB2F5\uBCC0\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", onClick: (event) => event.stopPropagation(), className: `${textareaBase} min-h-20` }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { type: "button", onClick: (event) => {
                                                event.stopPropagation();
                                                closeReplyComposer();
                                            }, className: `flex-1 ${btnSecondary}`, children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", onClick: (event) => {
                                                event.stopPropagation();
                                                void handleReplySubmit();
                                            }, disabled: isUpdating, className: `flex-1 ${btnPrimary}`, children: isUpdating ? "전송 중..." : "전송" })] })] })) : null] }, `${tooltipReport.id}-${activeReplyReport ? "expanded" : "preview"}`)) : null })] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map