import type { ReportStatus } from "../../types/report.js";
import type { ReportFilters } from "../../types/report-ui.js";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getStatusTone } from "../../utils/reportVisual.js";
import { btnLink, btnPrimary, btnSecondary, inputBase } from "../report/classes.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";

export function ReportFeedbackList() {
    const {
        filters,
        setFilters,
        filteredReports,
        reports,
        selectedReport,
        editingReportId,
        editableDraft,
        fields,
        isError,
        isFetching,
        isUpdating,
        queryErrorMessage,
        visibleShortcutKeys,
        searchInputRef,
        selectReport,
        startEditing,
        stopEditing,
        setEditableDraft,
        handleUpdateSubmit,
        refetch,
    } = useReport();

    return (
        <section className="flex max-h-[min(52vh,480px)] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                <strong className="text-sm text-slate-900 dark:text-slate-100">피드백 목록</strong>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{filteredReports.length}</span>
            </div>

            <div className="grid gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <input
                        ref={searchInputRef}
                        value={filters.keyword}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                keyword: event.target.value,
                            }))
                        }
                        placeholder="메시지 / report id 검색"
                        className={`${inputBase} flex-1`}
                    />
                    <ShortcutHint binding={REPORT_SHORTCUTS.focusSearch} visible={visibleShortcutKeys} />
                </div>
                <select
                    value={filters.status}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            status: event.target.value as ReportFilters["status"],
                        }))
                    }
                    className={inputBase}
                >
                    <option value="all">전체 상태</option>
                    <option value="open">open</option>
                    <option value="resolved">resolved</option>
                    <option value="archived">archived</option>
                </select>
                <select
                    value={filters.reportType}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            reportType: event.target.value as ReportFilters["reportType"],
                        }))
                    }
                    className={inputBase}
                >
                    <option value="all">전체 타입</option>
                    <option value="item">item</option>
                    <option value="group">group</option>
                </select>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-2">
                {isError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/40">
                        <strong className="text-sm text-red-700 dark:text-red-300">목록을 불러오지 못했어요.</strong>
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{queryErrorMessage ?? "잠시 후 다시 시도해주세요."}</p>
                        <button type="button" onClick={() => void refetch()} className={`mt-3 ${btnSecondary}`}>
                            다시 시도
                        </button>
                    </div>
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-700">
                        <strong className="text-sm text-slate-800 dark:text-slate-100">표시할 피드백이 없습니다.</strong>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요."}
                        </p>
                    </div>
                ) : null}

                <div className="flex flex-col gap-2">
                    {filteredReports.map((report) => {
                        const isSelected = report.id === selectedReport?.id;
                        const isEditing = report.id === editingReportId && editableDraft;
                        const isArchived = report.status === "archived";

                        return (
                            <div
                                key={report.id}
                                className={`rounded-xl border bg-white p-2 dark:bg-slate-900 ${isSelected ? "border-blue-400 ring-1 ring-blue-200 dark:border-blue-600 dark:ring-blue-900" : "border-slate-200 dark:border-slate-700"}`}
                            >
                                <button type="button" onClick={() => selectReport(report.id)} className="pointer-events-auto w-full text-left">
                                    <div className="flex items-center justify-between gap-2">
                                        <strong className="truncate text-sm text-slate-900 dark:text-slate-100">{report.report_id}</strong>
                                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" style={getStatusTone(report.status)}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {report.report_type} · {formatDate(report.created_at)}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">{report.message}</p>
                                </button>

                                <div className="mt-2">
                                    <button type="button" onClick={() => startEditing(report)} disabled={isArchived} className={btnLink}>
                                        {isArchived ? "보관됨" : isEditing ? "수정 중" : "수정"}
                                    </button>
                                </div>

                                {isEditing && editableDraft ? (
                                    <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                                        <div className="flex flex-col gap-3">
                                            <FieldEditor
                                                fields={fields}
                                                message={editableDraft.message}
                                                fieldValues={editableDraft.fieldValues}
                                                onMessageChange={(nextMessage) => setEditableDraft((current) => (current ? { ...current, message: nextMessage } : current))}
                                                onFieldChange={(key, nextValue) =>
                                                    setEditableDraft((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  fieldValues: {
                                                                      ...current.fieldValues,
                                                                      [key]: nextValue,
                                                                  },
                                                              }
                                                            : current,
                                                    )
                                                }
                                            />
                                        </div>

                                        <select
                                            value={editableDraft.status}
                                            onChange={(event) =>
                                                setEditableDraft((current) =>
                                                    current
                                                        ? {
                                                              ...current,
                                                              status: event.target.value as ReportStatus,
                                                          }
                                                        : current,
                                                )
                                            }
                                            className={`${inputBase} mt-3`}
                                        >
                                            <option value="open">open</option>
                                            <option value="resolved">resolved</option>
                                            <option value="archived">archived</option>
                                        </select>

                                        <div className="mt-3 flex gap-2">
                                            <button type="button" onClick={stopEditing} className={`flex-1 ${btnSecondary}`}>
                                                <span className="inline-flex items-center gap-1">
                                                    닫기
                                                    <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} />
                                                </span>
                                            </button>
                                            <button type="button" onClick={() => void handleUpdateSubmit()} disabled={isUpdating} className={`flex-1 ${btnPrimary}`}>
                                                <span className="inline-flex items-center gap-1">
                                                    {isUpdating ? "저장 중..." : "수정 저장"}
                                                    <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
