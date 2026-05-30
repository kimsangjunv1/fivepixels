import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TARGET_COLOR } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { AnimatedPresence, motion } from "../../motion/index.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
import { reportStyles } from "../report/styles.js";
export function ReportMarkersLayer() {
    const { mode, markers, palette, resolvedAppearance, selectedReport, activeReplyReportId, activeReplyReport, tooltipReport, tooltipAnchor, tooltipFieldTags, replyDraft, isUpdating, editingReportId, selectReport, openReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, closeReplyComposer, handleReplySubmit, } = useReport();
    if (mode !== "view") {
        return null;
    }
    return (_jsxs(_Fragment, { children: [markers.map((marker) => marker.rect ? (_jsx("div", { style: {
                    ...reportStyles.readonlyRect,
                    left: marker.rect.left,
                    top: marker.rect.top,
                    width: marker.rect.width,
                    height: marker.rect.height,
                    outline: `1px solid ${TARGET_COLOR[marker.report.report_type]}`,
                    backgroundColor: `${TARGET_COLOR[marker.report.report_type]}10`,
                } }, `${marker.id}-rect`)) : null), markers.map((marker) => (_jsx("button", { type: "button", onClick: () => {
                    selectReport(marker.report.id);
                    openReplyComposer(marker.report);
                }, onMouseEnter: () => {
                    clearHoverLeaveTimeout();
                    setHoveredMarkerId(marker.report.id);
                    if (!editingReportId) {
                        selectReport(marker.report.id);
                    }
                }, onMouseLeave: () => scheduleHoverLeave(marker.report.id), title: `${marker.report.report_type} · ${marker.report.report_id}`, style: {
                    ...reportStyles.markerButton,
                    left: marker.left,
                    top: marker.top,
                    backgroundColor: getMarkerColor(marker.report),
                    boxShadow: marker.report.id === selectedReport?.id ? "0 0 0 4px rgba(15, 23, 42, 0.2)" : reportStyles.markerButton.boxShadow,
                    transform: marker.report.id === selectedReport?.id ? "scale(1.15)" : "scale(1)",
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
                    }, style: {
                        ...reportStyles.markerTooltip,
                        left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                        top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                        backgroundColor: activeReplyReport ? palette.panel : resolvedAppearance === "dark" ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.72)",
                        borderColor: palette.panelBorder,
                        color: palette.text,
                        pointerEvents: "auto",
                        cursor: activeReplyReport ? "default" : "pointer",
                        backdropFilter: "blur(14px)",
                    }, children: [_jsxs("strong", { style: { fontSize: 12 }, children: [tooltipReport.report_type, " \u00B7 ", tooltipReport.report_id] }), _jsxs("div", { style: reportStyles.markerTooltipHeader, children: [_jsx("span", { style: {
                                        ...reportStyles.statusBadge,
                                        ...getReplyStatusTone(hasReply(tooltipReport)),
                                    }, children: hasReply(tooltipReport) ? "답변 완료" : "답변 미완료" }), _jsx("span", { style: {
                                        ...reportStyles.reportMeta,
                                        margin: 0,
                                        color: palette.muted,
                                    }, children: formatDate(tooltipReport.created_at) })] }), tooltipFieldTags.length ? (_jsx("div", { style: reportStyles.tagList, children: tooltipFieldTags.map((fieldTag) => (_jsx("span", { style: {
                                    ...reportStyles.fieldTag,
                                    backgroundColor: palette.chip,
                                    color: palette.text,
                                }, children: fieldTag.label }, fieldTag.key))) })) : null, _jsx("p", { style: {
                                ...reportStyles.markerTooltipMessage,
                                color: palette.text,
                            }, children: tooltipReport.message }), activeReplyReport ? (_jsxs("div", { style: reportStyles.editorSection, onClick: (event) => event.stopPropagation(), onMouseDown: (event) => event.stopPropagation(), children: [activeReplyReport.replies.length ? (_jsx("div", { style: reportStyles.replyList, children: activeReplyReport.replies.map((reply) => (_jsxs("div", { style: {
                                            ...reportStyles.replyItem,
                                            backgroundColor: palette.chip,
                                            color: palette.text,
                                        }, children: [_jsx("p", { style: { margin: 0, fontSize: 12 }, children: reply.message }), _jsx("p", { style: {
                                                    ...reportStyles.reportMeta,
                                                    color: palette.muted,
                                                }, children: formatDate(reply.created_at) })] }, reply.id))) })) : null, _jsx("textarea", { value: replyDraft, onChange: (event) => setReplyDraft(event.target.value), placeholder: "\uB2F5\uBCC0\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", onClick: (event) => event.stopPropagation(), style: {
                                        ...reportStyles.textarea,
                                        minHeight: 96,
                                        backgroundColor: palette.input,
                                        borderColor: palette.inputBorder,
                                        color: palette.inputText,
                                    } }), _jsxs("div", { style: reportStyles.buttonRow, children: [_jsx("button", { type: "button", onClick: (event) => {
                                                event.stopPropagation();
                                                closeReplyComposer();
                                            }, style: {
                                                ...reportStyles.secondaryButton,
                                                borderColor: palette.inputBorder,
                                                color: palette.text,
                                            }, children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", onClick: (event) => {
                                                event.stopPropagation();
                                                void handleReplySubmit();
                                            }, disabled: isUpdating, style: {
                                                ...reportStyles.primaryButton,
                                                backgroundColor: "#2563eb",
                                            }, children: isUpdating ? "전송 중..." : "전송" })] })] })) : null] }, `${tooltipReport.id}-${activeReplyReport ? "expanded" : "preview"}`)) : null })] }));
}
//# sourceMappingURL=ReportMarkersLayer.js.map