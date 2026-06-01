import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
import { btnPrimary, btnRow, btnSecondary, cardTooltip, cardTooltipCompact, chip, dividerTop, highlight, marker, markerSelected, replyItem, row, stackSm, textBody, textMuted, textTitle, textareaCompact, } from "../report/classes.js";
export function ReportMarkersLayer() {
    const { mode, markers, selectedReport, activeReplyReportId, activeReplyReport, tooltipReport, tooltipAnchor, tooltipFieldTags, replyDraft, isUpdating, editingReportId, selectReport, openReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, closeReplyComposer, handleReplySubmit, } = useReport();
    if (mode !== "view") {
        return null;
    }
    return (_jsxs(_Fragment, { children: [markers.map((markerItem) => markerItem.rect ? (_jsx("div", { className: highlight, style: {
                    left: markerItem.rect.left,
                    top: markerItem.rect.top,
                    width: markerItem.rect.width,
                    height: markerItem.rect.height,
                    outline: `1px solid ${TARGET_COLOR[markerItem.report.report_type]}`,
                    backgroundColor: TARGET_SURFACE[markerItem.report.report_type],
                } }, `${markerItem.id}-rect`)) : null), markers.map((markerItem) => (_jsx("button", { type: "button", onClick: () => {
                    selectReport(markerItem.report.id);
                    openReplyComposer(markerItem.report);
                }, onMouseEnter: () => {
                    clearHoverLeaveTimeout();
                    setHoveredMarkerId(markerItem.report.id);
                    if (!editingReportId) {
                        selectReport(markerItem.report.id);
                    }
                }, onMouseLeave: () => scheduleHoverLeave(markerItem.report.id), title: `${markerItem.report.report_type} · ${markerItem.report.report_id}`, className: markerItem.report.id === selectedReport?.id ? markerSelected : marker, style: {
                    left: markerItem.left,
                    top: markerItem.top,
                    backgroundColor: getMarkerColor(markerItem.report),
                } }, markerItem.id))), tooltipReport && tooltipAnchor ? (_jsxs("div", { onMouseEnter: () => {
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
                }, className: activeReplyReport ? cardTooltip : cardTooltipCompact, style: {
                    left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                    top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                }, children: [_jsxs("strong", { className: textTitle, children: [tooltipReport.report_type, " \u00B7 ", tooltipReport.report_id] }), _jsxs("div", { className: row, children: [_jsx("span", { className: chip, style: getReplyStatusTone(hasReply(tooltipReport)), children: hasReply(tooltipReport) ? "답변 완료" : "답변 미완료" }), _jsx("span", { className: textMuted, children: formatDate(tooltipReport.created_at) })] }), tooltipFieldTags.length ? (_jsx("div", { className: row, children: tooltipFieldTags.map((fieldTag) => (_jsx("span", { className: chip, children: fieldTag.label }, fieldTag.key))) })) : null, _jsx("p", { className: textBody, children: tooltipReport.message }), activeReplyReport ? (_jsxs("div", { className: dividerTop, onClick: (event) => event.stopPropagation(), onMouseDown: (event) => event.stopPropagation(), children: [activeReplyReport.replies.length ? (_jsx("div", { className: stackSm, children: activeReplyReport.replies.map((reply) => (_jsxs("div", { className: replyItem, children: [_jsx("p", { className: textBody, children: reply.message }), _jsx("p", { className: textMuted, children: formatDate(reply.created_at) })] }, reply.id))) })) : null, _jsx("textarea", { value: replyDraft, onChange: (event) => setReplyDraft(event.target.value), placeholder: "\uB2F5\uBCC0\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", onClick: (event) => event.stopPropagation(), className: textareaCompact }), _jsxs("div", { className: btnRow, children: [_jsx("button", { type: "button", onClick: (event) => { event.stopPropagation(); closeReplyComposer(); }, className: btnSecondary, children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", onClick: (event) => { event.stopPropagation(); void handleReplySubmit(); }, disabled: isUpdating, className: btnPrimary, children: isUpdating ? "전송 중..." : "전송" })] })] })) : null] }, `${tooltipReport.id}-${activeReplyReport ? "expanded" : "preview"}`)) : null] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map