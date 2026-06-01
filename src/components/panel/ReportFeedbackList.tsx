import type { ReportStatus } from "../../types/report.js";
import type { ReportFilters } from "../../types/report-ui.js";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getStatusTone } from "../../utils/reportVisual.js";
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
        // <section className="flex flex-col gap-2 border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
        <section className="flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between gap-2">
                <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100">피드백 목록</strong>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {filteredReports.length}
                </span>
            </div>

            <div className="flex flex-col gap-2 border-y border-slate-100 py-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
                <div className="flex items-center gap-2">
                    <input
                        ref={searchInputRef}
                        value={filters.keyword}
                        onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                        placeholder="메시지 / report id 검색"
                        className="h-7 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-0 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                    />
                    <ShortcutHint
                        binding={REPORT_SHORTCUTS.focusSearch}
                        visible={visibleShortcutKeys}
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ReportFilters["status"] }))}
                    className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-0 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                >
                    <option value="all">전체 상태</option>
                    <option value="open">open</option>
                    <option value="resolved">resolved</option>
                    <option value="archived">archived</option>
                </select>
                <select
                    value={filters.reportType}
                    onChange={(event) => setFilters((current) => ({ ...current, reportType: event.target.value as ReportFilters["reportType"] }))}
                    className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-0 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                >
                    <option value="all">전체 타입</option>
                    <option value="item">item</option>
                    <option value="group">group</option>
                </select>
            </div>

            <div className="mt-1 max-h-[320px] space-y-2 overflow-y-auto pr-1 text-xs">
                {isError ? (
                    <div className="space-y-1 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                        <strong className="text-sm font-semibold">목록을 불러오지 못했어요.</strong>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{queryErrorMessage ?? "잠시 후 다시 시도해주세요."}</p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                            다시 시도
                        </button>
                    </div>
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div className="space-y-1 rounded-md border border-dashed border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100">표시할 피드백이 없습니다.</strong>
                        <p>{reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요."}</p>
                    </div>
                ) : null}

                <div className="mt-1 space-y-2">
                    {filteredReports.map((report) => {
                        const isSelected = report.id === selectedReport?.id;
                        const isEditing = report.id === editingReportId && editableDraft;
                        const isArchived = report.status === "archived";

                        return (
                            <div
                                key={report.id}
                                className={
                                    isSelected
                                        ? "space-y-1 rounded-md border border-sky-300 bg-sky-50 p-2 text-xs shadow-sm dark:border-sky-500 dark:bg-sky-950/40"
                                        : "space-y-1 rounded-md border border-slate-200 bg-white p-2 text-xs shadow-sm hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
                                }
                            >
                                <button
                                    type="button"
                                    onClick={() => selectReport(report.id)}
                                    className="flex w-full flex-col items-start gap-1 text-left"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <strong className="max-w-[160px] truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{report.report_id}</strong>
                                        <span
                                            className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            style={getStatusTone(report.status)}
                                        >
                                            {report.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {report.report_type} · {formatDate(report.created_at)}
                                    </p>
                                    <p className="line-clamp-2 text-xs text-slate-700 dark:text-slate-200">{report.message}</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => startEditing(report)}
                                    disabled={isArchived}
                                    className="mt-1 text-xs font-medium text-sky-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 dark:text-sky-400 dark:disabled:text-slate-500"
                                >
                                    {isArchived ? "보관됨" : isEditing ? "수정 중" : "수정"}
                                </button>

                                {isEditing && editableDraft ? (
                                    <div className="mt-2 border-t border-dashed border-slate-200 pt-2 dark:border-slate-700">
                                        <div className="flex flex-col gap-2">
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
                                                                  fieldValues: { ...current.fieldValues, [key]: nextValue },
                                                              }
                                                            : current,
                                                    )
                                                }
                                            />
                                        </div>

                                        <select
                                            value={editableDraft.status}
                                            onChange={(event) => setEditableDraft((current) => (current ? { ...current, status: event.target.value as ReportStatus } : current))}
                                            className="mt-2 h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-0 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                                        />

                                        <div className="mt-2 flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={stopEditing}
                                                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    닫기
                                                    <ShortcutHint
                                                        binding={REPORT_SHORTCUTS.cancel}
                                                        visible={visibleShortcutKeys}
                                                    />
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleUpdateSubmit()}
                                                disabled={isUpdating}
                                                className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600"
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    {isUpdating ? "저장 중..." : "수정 저장"}
                                                    <ShortcutHint
                                                        binding={REPORT_SHORTCUTS.submit}
                                                        visible={visibleShortcutKeys}
                                                    />
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
