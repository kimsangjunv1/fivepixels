import type { ReportStatus } from "../../types/report.js";
import type { ReportFilters } from "../../types/report-ui.js";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getStatusTone } from "../../utils/reportVisual.js";
import { stitchablePartProps } from "../report/parts.js";
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
        <section {...stitchablePartProps("side-panel")}>
            <div {...stitchablePartProps("side-panel-header")}>
                <strong>피드백 목록</strong>
                <span {...stitchablePartProps("badge")}>{filteredReports.length}</span>
            </div>

            <div {...stitchablePartProps("filter-grid")}>
                <div {...stitchablePartProps("filter-search-row")}>
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
                        {...stitchablePartProps("input", { className: "stitchable-input--grow" })}
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
                    {...stitchablePartProps("input")}
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
                    {...stitchablePartProps("input")}
                >
                    <option value="all">전체 타입</option>
                    <option value="item">item</option>
                    <option value="group">group</option>
                </select>
            </div>

            <div {...stitchablePartProps("report-list")}>
                {isError ? (
                    <div {...stitchablePartProps("state-card")}>
                        <strong>목록을 불러오지 못했어요.</strong>
                        <p {...stitchablePartProps("report-meta")}>{queryErrorMessage ?? "잠시 후 다시 시도해주세요."}</p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            {...stitchablePartProps("secondary-button")}
                        >
                            다시 시도
                        </button>
                    </div>
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div {...stitchablePartProps("state-card")}>
                        <strong>표시할 피드백이 없습니다.</strong>
                        <p {...stitchablePartProps("report-meta")}>
                            {reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요."}
                        </p>
                    </div>
                ) : null}

                {filteredReports.map((report) => {
                    const isSelected = report.id === selectedReport?.id;
                    const isEditing = report.id === editingReportId && editableDraft;
                    const isArchived = report.status === "archived";

                    return (
                        <div
                            key={report.id}
                            {...stitchablePartProps("report-card", {
                                modifier: isSelected ? "selected" : undefined,
                            })}
                        >
                            <button
                                type="button"
                                onClick={() => selectReport(report.id)}
                                {...stitchablePartProps("report-card-button")}
                            >
                                <div {...stitchablePartProps("report-card-header")}>
                                    <strong>{report.report_id}</strong>
                                    <span
                                        {...stitchablePartProps("status-badge")}
                                        style={getStatusTone(report.status)}
                                    >
                                        {report.status}
                                    </span>
                                </div>
                                <p {...stitchablePartProps("report-meta")}>
                                    {report.report_type} · {formatDate(report.created_at)}
                                </p>
                                <p {...stitchablePartProps("report-message")}>{report.message}</p>
                            </button>

                            <div {...stitchablePartProps("card-actions")}>
                                <button
                                    type="button"
                                    onClick={() => startEditing(report)}
                                    disabled={isArchived}
                                    {...stitchablePartProps("link-button")}
                                >
                                    {isArchived ? "보관됨" : isEditing ? "수정 중" : "수정"}
                                </button>
                            </div>

                            {isEditing && editableDraft ? (
                                <div {...stitchablePartProps("editor-section")}>
                                    <div {...stitchablePartProps("field-stack")}>
                                        <FieldEditor
                                            fields={fields}
                                            message={editableDraft.message}
                                            fieldValues={editableDraft.fieldValues}
                                            onMessageChange={(nextMessage) =>
                                                setEditableDraft((current) => (current ? { ...current, message: nextMessage } : current))
                                            }
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
                                        {...stitchablePartProps("input")}
                                    >
                                        <option value="open">open</option>
                                        <option value="resolved">resolved</option>
                                        <option value="archived">archived</option>
                                    </select>

                                    <div {...stitchablePartProps("button-row")}>
                                        <button
                                            type="button"
                                            onClick={stopEditing}
                                            {...stitchablePartProps("secondary-button")}
                                        >
                                            <span {...stitchablePartProps("button-with-hint")}>
                                                닫기
                                                <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} />
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleUpdateSubmit()}
                                            disabled={isUpdating}
                                            {...stitchablePartProps("primary-button")}
                                        >
                                            <span {...stitchablePartProps("button-with-hint")}>
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
        </section>
    );
}
