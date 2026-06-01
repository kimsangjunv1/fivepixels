import type { ReportStatus } from "../../types/report.js";
import type { ReportFilters } from "../../types/report-ui.js";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getStatusTone } from "../../utils/reportVisual.js";
import {
    badge,
    btnHint,
    btnLink,
    btnPrimary,
    btnRow,
    btnSecondary,
    cardItem,
    cardItemSelected,
    cardList,
    dividerTop,
    feedbackList,
    inputBase,
    inputGrow,
    listFilters,
    listHeader,
    row,
    scrollArea,
    stack,
    textBody,
    textMuted,
    textTitle,
    truncate,
    wFull,
} from "../report/classes.js";
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
        <section className={feedbackList}>
            <div className={listHeader}>
                <strong className={textTitle}>피드백 목록</strong>
                <span className={badge}>{filteredReports.length}</span>
            </div>

            <div className={listFilters}>
                <div className={row}>
                    <input
                        ref={searchInputRef}
                        value={filters.keyword}
                        onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                        placeholder="메시지 / report id 검색"
                        className={inputGrow}
                    />
                    <ShortcutHint binding={REPORT_SHORTCUTS.focusSearch} visible={visibleShortcutKeys} />
                </div>
                <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ReportFilters["status"] }))} className={inputBase}>
                    <option value="all">전체 상태</option>
                    <option value="open">open</option>
                    <option value="resolved">resolved</option>
                    <option value="archived">archived</option>
                </select>
                <select value={filters.reportType} onChange={(event) => setFilters((current) => ({ ...current, reportType: event.target.value as ReportFilters["reportType"] }))} className={inputBase}>
                    <option value="all">전체 타입</option>
                    <option value="item">item</option>
                    <option value="group">group</option>
                </select>
            </div>

            <div className={scrollArea}>
                {isError ? (
                    <div className={cardItem}>
                        <strong className={textTitle}>목록을 불러오지 못했어요.</strong>
                        <p className={textMuted}>{queryErrorMessage ?? "잠시 후 다시 시도해주세요."}</p>
                        <button type="button" onClick={() => void refetch()} className={btnSecondary}>
                            다시 시도
                        </button>
                    </div>
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div className={cardItem}>
                        <strong className={textTitle}>표시할 피드백이 없습니다.</strong>
                        <p className={textMuted}>{reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요."}</p>
                    </div>
                ) : null}

                <div className={cardList}>
                    {filteredReports.map((report) => {
                        const isSelected = report.id === selectedReport?.id;
                        const isEditing = report.id === editingReportId && editableDraft;
                        const isArchived = report.status === "archived";

                        return (
                            <div key={report.id} className={isSelected ? cardItemSelected : cardItem}>
                                <button type="button" onClick={() => selectReport(report.id)} className={wFull}>
                                    <div className={row}>
                                        <strong className={truncate}>{report.report_id}</strong>
                                        <span className={badge} style={getStatusTone(report.status)}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <p className={textMuted}>
                                        {report.report_type} · {formatDate(report.created_at)}
                                    </p>
                                    <p className={truncate}>{report.message}</p>
                                </button>

                                <button type="button" onClick={() => startEditing(report)} disabled={isArchived} className={btnLink}>
                                    {isArchived ? "보관됨" : isEditing ? "수정 중" : "수정"}
                                </button>

                                {isEditing && editableDraft ? (
                                    <div className={dividerTop}>
                                        <div className={stack}>
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
                                            onChange={(event) =>
                                                setEditableDraft((current) => (current ? { ...current, status: event.target.value as ReportStatus } : current))
                                            }
                                            className={inputBase}
                                        />

                                        <div className={btnRow}>
                                            <button type="button" onClick={stopEditing} className={btnSecondary}>
                                                <span className={btnHint}>
                                                    닫기
                                                    <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} />
                                                </span>
                                            </button>
                                            <button type="button" onClick={() => void handleUpdateSubmit()} disabled={isUpdating} className={btnPrimary}>
                                                <span className={btnHint}>
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
