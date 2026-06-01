import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";
import {
    btnPrimary,
    btnRow,
    btnSecondary,
    cardTooltip,
    cardTooltipCompact,
    chip,
    dividerTop,
    highlight,
    marker,
    markerSelected,
    replyItem,
    row,
    scrollArea,
    stackSm,
    textBody,
    textMuted,
    textTitle,
    textareaCompact,
} from "../report/classes.js";

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
            {markers.map((markerItem) =>
                markerItem.rect ? (
                    <div
                        key={`${markerItem.id}-rect`}
                        className={highlight}
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
                <button
                    key={markerItem.id}
                    type="button"
                    onClick={() => {
                        selectReport(markerItem.report.id);
                        openReplyComposer(markerItem.report);
                    }}
                    onMouseEnter={() => {
                        clearHoverLeaveTimeout();
                        setHoveredMarkerId(markerItem.report.id);
                        if (!editingReportId) {
                            selectReport(markerItem.report.id);
                        }
                    }}
                    onMouseLeave={() => scheduleHoverLeave(markerItem.report.id)}
                    title={`${markerItem.report.report_type} · ${markerItem.report.report_id}`}
                    className={markerItem.report.id === selectedReport?.id ? markerSelected : marker}
                    style={{
                        left: markerItem.left,
                        top: markerItem.top,
                        backgroundColor: getMarkerColor(markerItem.report),
                    }}
                />
            ))}

            {tooltipReport && tooltipAnchor ? (
                <div
                    key={`${tooltipReport.id}-${activeReplyReport ? "expanded" : "preview"}`}
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
                    className={activeReplyReport ? cardTooltip : cardTooltipCompact}
                    style={{
                        left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                        top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                    }}
                >
                    <strong className={textTitle}>
                        {tooltipReport.report_type} · {tooltipReport.report_id}
                    </strong>
                    <div className={row}>
                        <span className={chip} style={getReplyStatusTone(hasReply(tooltipReport))}>
                            {hasReply(tooltipReport) ? "답변 완료" : "답변 미완료"}
                        </span>
                        <span className={textMuted}>{formatDate(tooltipReport.created_at)}</span>
                    </div>
                    {tooltipFieldTags.length ? (
                        <div className={row}>
                            {tooltipFieldTags.map((fieldTag) => (
                                <span key={fieldTag.key} className={chip}>
                                    {fieldTag.label}
                                </span>
                            ))}
                        </div>
                    ) : null}
                    <p className={textBody}>{tooltipReport.message}</p>
                    {activeReplyReport ? (
                        <div className={dividerTop} onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
                            {activeReplyReport.replies.length ? (
                                <div className={stackSm}>
                                    {activeReplyReport.replies.map((reply) => (
                                        <div key={reply.id} className={replyItem}>
                                            <p className={textBody}>{reply.message}</p>
                                            <p className={textMuted}>{formatDate(reply.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                            <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="답변을 입력해주세요." onClick={(event) => event.stopPropagation()} className={textareaCompact} />
                            <div className={btnRow}>
                                <button type="button" onClick={(event) => { event.stopPropagation(); closeReplyComposer(); }} className={btnSecondary}>
                                    닫기
                                </button>
                                <button type="button" onClick={(event) => { event.stopPropagation(); void handleReplySubmit(); }} disabled={isUpdating} className={btnPrimary}>
                                    {isUpdating ? "전송 중..." : "전송"}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
