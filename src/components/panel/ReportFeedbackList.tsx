import type { ReportStatus } from "../../types/report.js";
import type { ReportFilters } from "../../types/report-ui.js";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getStatusTone } from "../../utils/reportVisual.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
import { reportStyles } from "../report/styles.js";

export function ReportFeedbackList() {
    const {
        palette,
        resolvedAppearance,
        isMobileViewport,
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
        <aside
            style={{
                ...reportStyles.sidePanel,
                backgroundColor: palette.panel,
                borderColor: palette.panelBorder,
                color: palette.text,
                width: isMobileViewport ? "calc(100vw - 32px)" : 360,
                maxHeight: isMobileViewport ? "min(68vh, 560px)" : "calc(100vh - 32px)",
                top: isMobileViewport ? "auto" : 16,
                bottom: isMobileViewport ? 16 : "auto",
                left: isMobileViewport ? 16 : "auto",
                right: 16,
                boxShadow: resolvedAppearance === "dark" ? "0 18px 48px rgba(15, 23, 42, 0.42)" : "0 18px 48px rgba(15, 23, 42, 0.16)",
                backdropFilter: "blur(14px)",
            }}
        >
            <div style={reportStyles.sidePanelHeader}>
                <strong>피드백 목록</strong>
                <span
                    style={{
                        ...reportStyles.badge,
                        backgroundColor: palette.chip,
                        color: palette.muted,
                    }}
                >
                    {filteredReports.length}
                </span>
            </div>

            <div style={reportStyles.filterGrid}>
                <div style={reportStyles.filterSearchRow}>
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
                        style={{
                            ...reportStyles.input,
                            flex: 1,
                            backgroundColor: palette.input,
                            borderColor: palette.inputBorder,
                            color: palette.inputText,
                        }}
                    />
                    <ShortcutHint binding={REPORT_SHORTCUTS.focusSearch} visible={visibleShortcutKeys} palette={palette} />
                </div>
                <select
                    value={filters.status}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            status: event.target.value as ReportFilters["status"],
                        }))
                    }
                    style={{
                        ...reportStyles.input,
                        backgroundColor: palette.input,
                        borderColor: palette.inputBorder,
                        color: palette.inputText,
                    }}
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
                    style={{
                        ...reportStyles.input,
                        backgroundColor: palette.input,
                        borderColor: palette.inputBorder,
                        color: palette.inputText,
                    }}
                >
                    <option value="all">전체 타입</option>
                    <option value="item">item</option>
                    <option value="group">group</option>
                </select>
            </div>

            <div style={reportStyles.reportList}>
                {isError ? (
                    <div
                        style={{
                            ...reportStyles.stateCard,
                            backgroundColor: palette.chip,
                            borderColor: palette.inputBorder,
                        }}
                    >
                        <strong style={{ color: palette.text }}>목록을 불러오지 못했어요.</strong>
                        <p style={{ ...reportStyles.reportMeta, color: palette.muted }}>{queryErrorMessage ?? "잠시 후 다시 시도해주세요."}</p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            style={{
                                ...reportStyles.secondaryButton,
                                borderColor: palette.inputBorder,
                                color: palette.text,
                            }}
                        >
                            다시 시도
                        </button>
                    </div>
                ) : null}

                {!isError && !isFetching && filteredReports.length === 0 ? (
                    <div
                        style={{
                            ...reportStyles.stateCard,
                            backgroundColor: palette.chip,
                            borderColor: palette.inputBorder,
                        }}
                    >
                        <strong style={{ color: palette.text }}>표시할 피드백이 없습니다.</strong>
                        <p style={{ ...reportStyles.reportMeta, color: palette.muted }}>
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
                            style={{
                                ...reportStyles.reportCard,
                                backgroundColor: isSelected ? palette.chip : "transparent",
                                borderColor: isSelected ? palette.inputBorder : "transparent",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => selectReport(report.id)}
                                style={reportStyles.reportCardButton}
                            >
                                <div style={reportStyles.reportCardHeader}>
                                    <strong style={{ color: palette.text }}>{report.report_id}</strong>
                                    <span
                                        style={{
                                            ...reportStyles.statusBadge,
                                            ...getStatusTone(report.status),
                                        }}
                                    >
                                        {report.status}
                                    </span>
                                </div>
                                <p style={{ ...reportStyles.reportMeta, color: palette.muted }}>
                                    {report.report_type} · {formatDate(report.created_at)}
                                </p>
                                <p style={{ ...reportStyles.reportMessage, color: palette.text }}>{report.message}</p>
                            </button>

                            <div style={reportStyles.cardActions}>
                                <button
                                    type="button"
                                    onClick={() => startEditing(report)}
                                    disabled={isArchived}
                                    style={{
                                        ...reportStyles.linkButton,
                                        color: isArchived ? palette.muted : "#2563eb",
                                        opacity: isArchived ? 0.6 : 1,
                                    }}
                                >
                                    {isArchived ? "보관됨" : isEditing ? "수정 중" : "수정"}
                                </button>
                            </div>

                            {isEditing && editableDraft ? (
                                <div style={reportStyles.editorSection}>
                                    <div style={reportStyles.fieldStack}>
                                        <FieldEditor
                                            fields={fields}
                                            message={editableDraft.message}
                                            fieldValues={editableDraft.fieldValues}
                                            palette={palette}
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
                                        style={{
                                            ...reportStyles.input,
                                            backgroundColor: palette.input,
                                            borderColor: palette.inputBorder,
                                            color: palette.inputText,
                                        }}
                                    >
                                        <option value="open">open</option>
                                        <option value="resolved">resolved</option>
                                        <option value="archived">archived</option>
                                    </select>

                                    <div style={reportStyles.buttonRow}>
                                        <button
                                            type="button"
                                            onClick={stopEditing}
                                            style={{
                                                ...reportStyles.secondaryButton,
                                                borderColor: palette.inputBorder,
                                                color: palette.text,
                                            }}
                                        >
                                            <span style={reportStyles.buttonWithHint}>
                                                닫기
                                                <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} palette={palette} />
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleUpdateSubmit()}
                                            disabled={isUpdating}
                                            style={{
                                                ...reportStyles.primaryButton,
                                                backgroundColor: "#2563eb",
                                            }}
                                        >
                                            <span style={reportStyles.buttonWithHint}>
                                                {isUpdating ? "저장 중..." : "수정 저장"}
                                                <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} palette={palette} />
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
