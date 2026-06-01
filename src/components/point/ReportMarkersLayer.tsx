import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getMarkerColor, getReplyStatusTone, hasReply } from "../../utils/reportVisual.js";

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
                        className="pointer-events-none absolute rounded-[3px] border border-sky-400/70 bg-sky-200/20 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
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
                    className={
                        markerItem.report.id === selectedReport?.id
                            ? "absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-500 text-[10px] font-semibold text-white shadow-lg ring-2 ring-sky-300/60"
                            : "absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-[9px] font-semibold text-slate-700 shadow-sm hover:border-sky-400 hover:bg-sky-50"
                    }
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
                    className={
                        activeReplyReport
                            ? "pointer-events-auto absolute z-20 w-[280px] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
                            : "pointer-events-auto absolute z-20 w-[260px] rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
                    }
                    style={{
                        left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                        top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
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
                    {activeReplyReport ? (
                        <div
                            className="mt-2 space-y-2 border-t border-dashed border-slate-200 pt-2 dark:border-slate-700"
                            onClick={(event) => event.stopPropagation()}
                            onMouseDown={(event) => event.stopPropagation()}
                        >
                            {activeReplyReport.replies.length ? (
                                <div className="flex flex-col gap-1.5">
                                    {activeReplyReport.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="rounded-md border border-slate-100 bg-slate-50 p-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        >
                                            <p className="text-xs">{reply.message}</p>
                                            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
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
                                className="h-16 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                            />
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        closeReplyComposer();
                                    }}
                                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
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
                                    className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600"
                                >
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
