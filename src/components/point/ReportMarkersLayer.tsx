import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { AnimatedPresence, motion } from "../../motion/index.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
import { stitchablePartProps } from "../report/parts.js";

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

    if (mode !== "view") {
        return null;
    }

    return (
        <>
            {markers.map((marker) =>
                marker.rect ? (
                    <div
                        key={`${marker.id}-rect`}
                        {...stitchablePartProps("readonly-rect")}
                        style={{
                            left: marker.rect.left,
                            top: marker.rect.top,
                            width: marker.rect.width,
                            height: marker.rect.height,
                            outline: `1px solid ${TARGET_COLOR[marker.report.report_type]}`,
                            backgroundColor: TARGET_SURFACE[marker.report.report_type],
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
                    {...stitchablePartProps("marker-button", {
                        modifier: marker.report.id === selectedReport?.id ? "selected" : undefined,
                    })}
                    style={{
                        left: marker.left,
                        top: marker.top,
                        backgroundColor: getMarkerColor(marker.report),
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
                        onClick={() => {
                            if (activeReplyReportId !== tooltipReport.id) {
                                openReplyComposer(tooltipReport);
                            }
                        }}
                        {...stitchablePartProps("marker-tooltip", {
                            modifier: activeReplyReport ? "expanded" : "compact",
                        })}
                        style={{
                            left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                            top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                        }}
                    >
                        <strong {...stitchablePartProps("marker-tooltip-title")}>
                            {tooltipReport.report_type} · {tooltipReport.report_id}
                        </strong>
                        <div {...stitchablePartProps("marker-tooltip-header")}>
                            <span
                                {...stitchablePartProps("status-badge")}
                                style={getReplyStatusTone(hasReply(tooltipReport))}
                            >
                                {hasReply(tooltipReport) ? "답변 완료" : "답변 미완료"}
                            </span>
                            <span {...stitchablePartProps("report-meta", { className: "stitchable-report-meta--flat" })}>
                                {formatDate(tooltipReport.created_at)}
                            </span>
                        </div>
                        {tooltipFieldTags.length ? (
                            <div {...stitchablePartProps("tag-list")}>
                                {tooltipFieldTags.map((fieldTag) => (
                                    <span
                                        key={fieldTag.key}
                                        {...stitchablePartProps("field-tag")}
                                    >
                                        {fieldTag.label}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                        <p {...stitchablePartProps("marker-tooltip-message")}>{tooltipReport.message}</p>
                        {activeReplyReport ? (
                            <div
                                {...stitchablePartProps("editor-section")}
                                onClick={(event) => event.stopPropagation()}
                                onMouseDown={(event) => event.stopPropagation()}
                            >
                                {activeReplyReport.replies.length ? (
                                    <div {...stitchablePartProps("reply-list")}>
                                        {activeReplyReport.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                {...stitchablePartProps("reply-item")}
                                            >
                                                <p {...stitchablePartProps("reply-text")}>{reply.message}</p>
                                                <p {...stitchablePartProps("report-meta")}>{formatDate(reply.created_at)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                                <textarea
                                    value={replyDraft}
                                    onChange={(event) => setReplyDraft(event.target.value)}
                                    placeholder="답변을 입력해주세요."
                                    onClick={(event) => event.stopPropagation()}
                                    {...stitchablePartProps("textarea", { className: "stitchable-textarea--compact" })}
                                />
                                <div {...stitchablePartProps("button-row")}>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            closeReplyComposer();
                                        }}
                                        {...stitchablePartProps("secondary-button")}
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
                                        {...stitchablePartProps("primary-button")}
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
