import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { AnimatedPresence, motion } from "../../motion/index.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
import { stitchablePartProps } from "../report/parts.js";
export function ReportMarkersLayer() {
    const { mode, markers, selectedReport, activeReplyReportId, activeReplyReport, tooltipReport, tooltipAnchor, tooltipFieldTags, replyDraft, isUpdating, editingReportId, selectReport, openReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, closeReplyComposer, handleReplySubmit, } = useReport();
    if (mode !== "view") {
        return null;
    }
    return (_jsxs(_Fragment, { children: [markers.map((marker) => marker.rect ? (_jsx("div", { ...stitchablePartProps("readonly-rect"), style: {
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
                }, onMouseLeave: () => scheduleHoverLeave(marker.report.id), title: `${marker.report.report_type} · ${marker.report.report_id}`, ...stitchablePartProps("marker-button", {
                    modifier: marker.report.id === selectedReport?.id ? "selected" : undefined,
                }), style: {
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
                    }, ...stitchablePartProps("marker-tooltip", {
                        modifier: activeReplyReport ? "expanded" : "compact",
                    }), style: {
                        left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                        top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                    }, children: [_jsxs("strong", { ...stitchablePartProps("marker-tooltip-title"), children: [tooltipReport.report_type, " \u00B7 ", tooltipReport.report_id] }), _jsxs("div", { ...stitchablePartProps("marker-tooltip-header"), children: [_jsx("span", { ...stitchablePartProps("status-badge"), style: getReplyStatusTone(hasReply(tooltipReport)), children: hasReply(tooltipReport) ? "답변 완료" : "답변 미완료" }), _jsx("span", { ...stitchablePartProps("report-meta", { className: "stitchable-report-meta--flat" }), children: formatDate(tooltipReport.created_at) })] }), tooltipFieldTags.length ? (_jsx("div", { ...stitchablePartProps("tag-list"), children: tooltipFieldTags.map((fieldTag) => (_jsx("span", { ...stitchablePartProps("field-tag"), children: fieldTag.label }, fieldTag.key))) })) : null, _jsx("p", { ...stitchablePartProps("marker-tooltip-message"), children: tooltipReport.message }), activeReplyReport ? (_jsxs("div", { ...stitchablePartProps("editor-section"), onClick: (event) => event.stopPropagation(), onMouseDown: (event) => event.stopPropagation(), children: [activeReplyReport.replies.length ? (_jsx("div", { ...stitchablePartProps("reply-list"), children: activeReplyReport.replies.map((reply) => (_jsxs("div", { ...stitchablePartProps("reply-item"), children: [_jsx("p", { ...stitchablePartProps("reply-text"), children: reply.message }), _jsx("p", { ...stitchablePartProps("report-meta"), children: formatDate(reply.created_at) })] }, reply.id))) })) : null, _jsx("textarea", { value: replyDraft, onChange: (event) => setReplyDraft(event.target.value), placeholder: "\uB2F5\uBCC0\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", onClick: (event) => event.stopPropagation(), ...stitchablePartProps("textarea", { className: "stitchable-textarea--compact" }) }), _jsxs("div", { ...stitchablePartProps("button-row"), children: [_jsx("button", { type: "button", onClick: (event) => {
                                                event.stopPropagation();
                                                closeReplyComposer();
                                            }, ...stitchablePartProps("secondary-button"), children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", onClick: (event) => {
                                                event.stopPropagation();
                                                void handleReplySubmit();
                                            }, disabled: isUpdating, ...stitchablePartProps("primary-button"), children: isUpdating ? "전송 중..." : "전송" })] })] })) : null] }, `${tooltipReport.id}-${activeReplyReport ? "expanded" : "preview"}`)) : null })] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map