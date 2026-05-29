import { TARGET_COLOR } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { AnimatedPresence, motion } from "../../motion/index.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
import { reportStyles } from "../report/styles.js";

export function ReportMarkersLayer() {
    const {
        mode,
        markers,
        palette,
        resolvedAppearance,
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

    if (mode !== "view") {
        return null;
    }

    return (
        <>
            {markers.map((marker) =>
                marker.rect ? (
                    <div
                        key={`${marker.id}-rect`}
                        style={{
                            ...reportStyles.readonlyRect,
                            left: marker.rect.left,
                            top: marker.rect.top,
                            width: marker.rect.width,
                            height: marker.rect.height,
                            outline: `1px solid ${TARGET_COLOR[marker.report.report_type]}`,
                            backgroundColor: `${TARGET_COLOR[marker.report.report_type]}10`,
                        }}
                    />
                ) : null,
            )}

            {markers.map((marker) => (
                <button
                    key={marker.id}
                    type="button"
                    onClick={() => {
                        selectReport(marker.report.id);
                        openReplyComposer(marker.report);
                    }}
                    onMouseEnter={() => {
                        clearHoverLeaveTimeout();
                        setHoveredMarkerId(marker.report.id);
                        if (!editingReportId) {
                            selectReport(marker.report.id);
                        }
                    }}
                    onMouseLeave={() => scheduleHoverLeave(marker.report.id)}
                    title={`${marker.report.report_type} · ${marker.report.report_id}`}
                    style={{
                        ...reportStyles.markerButton,
                        left: marker.left,
                        top: marker.top,
                        backgroundColor: getMarkerColor(marker.report),
                        boxShadow: marker.report.id === selectedReport?.id ? "0 0 0 4px rgba(15, 23, 42, 0.2)" : reportStyles.markerButton.boxShadow,
                        transform: marker.report.id === selectedReport?.id ? "scale(1.15)" : "scale(1)",
                    }}
                />
            ))}

            <AnimatedPresence>
                {tooltipReport && tooltipAnchor ? (
                    <motion.div
                        key={`${tooltipReport.id}-${activeReplyReport ? "expanded" : "preview"}`}
                        initial={{ opacity: 0, transform: "translateY(5px)", scale: 0.97 }}
                        animate={{ opacity: 1, transform: "translateY(0px)", scale: 1 }}
                        exit={{ opacity: 0, transform: "translateY(5px)", scale: 0.97 }}
                        transition={{
                            delay: 0,
                            type: "spring",
                            mass: 0.1,
                            stiffness: 100,
                            damping: 10,
                        }}
                        onMouseEnter={() => {
                            clearHoverLeaveTimeout();
                            setHoveredMarkerId(tooltipReport.id);
                        }}
                        onMouseLeave={() => {
                            if (!activeReplyReportId) {
                                scheduleHoverLeave(tooltipReport.id);
                            }
                        }}
                        onClick={() => openReplyComposer(tooltipReport)}
                        style={{
                            ...reportStyles.markerTooltip,
                            left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                            top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                            backgroundColor: activeReplyReport ? palette.panel : resolvedAppearance === "dark" ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.72)",
                            borderColor: palette.panelBorder,
                            color: palette.text,
                            pointerEvents: "auto",
                            cursor: activeReplyReport ? "default" : "pointer",
                            backdropFilter: "blur(14px)",
                        }}
                    >
                        <strong style={{ fontSize: 12 }}>
                            {tooltipReport.report_type} · {tooltipReport.report_id}
                        </strong>
                        <div style={reportStyles.markerTooltipHeader}>
                            <span
                                style={{
                                    ...reportStyles.statusBadge,
                                    ...getReplyStatusTone(hasReply(tooltipReport)),
                                }}
                            >
                                {hasReply(tooltipReport) ? "답변 완료" : "답변 미완료"}
                            </span>
                            <span
                                style={{
                                    ...reportStyles.reportMeta,
                                    margin: 0,
                                    color: palette.muted,
                                }}
                            >
                                {formatDate(tooltipReport.created_at)}
                            </span>
                        </div>
                        {tooltipFieldTags.length ? (
                            <div style={reportStyles.tagList}>
                                {tooltipFieldTags.map((fieldTag) => (
                                    <span
                                        key={fieldTag.key}
                                        style={{
                                            ...reportStyles.fieldTag,
                                            backgroundColor: palette.chip,
                                            color: palette.text,
                                        }}
                                    >
                                        {fieldTag.label}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                        <p
                            style={{
                                ...reportStyles.markerTooltipMessage,
                                color: palette.text,
                            }}
                        >
                            {tooltipReport.message}
                        </p>
                        {activeReplyReport ? (
                            <div style={reportStyles.editorSection}>
                                {activeReplyReport.replies.length ? (
                                    <div style={reportStyles.replyList}>
                                        {activeReplyReport.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                style={{
                                                    ...reportStyles.replyItem,
                                                    backgroundColor: palette.chip,
                                                    color: palette.text,
                                                }}
                                            >
                                                <p style={{ margin: 0, fontSize: 12 }}>{reply.message}</p>
                                                <p
                                                    style={{
                                                        ...reportStyles.reportMeta,
                                                        color: palette.muted,
                                                    }}
                                                >
                                                    {formatDate(reply.created_at)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                                <textarea
                                    value={replyDraft}
                                    onChange={(event) => setReplyDraft(event.target.value)}
                                    placeholder="답변을 입력해주세요."
                                    onClick={(event) => event.stopPropagation()}
                                    style={{
                                        ...reportStyles.textarea,
                                        minHeight: 96,
                                        backgroundColor: palette.input,
                                        borderColor: palette.inputBorder,
                                        color: palette.inputText,
                                    }}
                                />
                                <div style={reportStyles.buttonRow}>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            closeReplyComposer();
                                        }}
                                        style={{
                                            ...reportStyles.secondaryButton,
                                            borderColor: palette.inputBorder,
                                            color: palette.text,
                                        }}
                                    >
                                        닫기
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void handleReplySubmit();
                                        }}
                                        disabled={isUpdating}
                                        style={{
                                            ...reportStyles.primaryButton,
                                            backgroundColor: "#2563eb",
                                        }}
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
