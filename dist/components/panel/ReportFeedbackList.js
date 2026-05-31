import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getStatusTone } from "../../utils/reportVisual.js";
import { stitchablePartProps } from "../report/parts.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
export function ReportFeedbackList() {
    const { filters, setFilters, filteredReports, reports, selectedReport, editingReportId, editableDraft, fields, isError, isFetching, isUpdating, queryErrorMessage, visibleShortcutKeys, searchInputRef, selectReport, startEditing, stopEditing, setEditableDraft, handleUpdateSubmit, refetch, } = useReport();
    return (_jsxs("section", { ...stitchablePartProps("side-panel"), children: [_jsxs("div", { ...stitchablePartProps("side-panel-header"), children: [_jsx("strong", { children: "\uD53C\uB4DC\uBC31 \uBAA9\uB85D" }), _jsx("span", { ...stitchablePartProps("badge"), children: filteredReports.length })] }), _jsxs("div", { ...stitchablePartProps("filter-grid"), children: [_jsxs("div", { ...stitchablePartProps("filter-search-row"), children: [_jsx("input", { ref: searchInputRef, value: filters.keyword, onChange: (event) => setFilters((current) => ({
                                    ...current,
                                    keyword: event.target.value,
                                })), placeholder: "\uBA54\uC2DC\uC9C0 / report id \uAC80\uC0C9", ...stitchablePartProps("input", { className: "stitchable-input--grow" }) }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.focusSearch, visible: visibleShortcutKeys })] }), _jsxs("select", { value: filters.status, onChange: (event) => setFilters((current) => ({
                            ...current,
                            status: event.target.value,
                        })), ...stitchablePartProps("input"), children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uC0C1\uD0DC" }), _jsx("option", { value: "open", children: "open" }), _jsx("option", { value: "resolved", children: "resolved" }), _jsx("option", { value: "archived", children: "archived" })] }), _jsxs("select", { value: filters.reportType, onChange: (event) => setFilters((current) => ({
                            ...current,
                            reportType: event.target.value,
                        })), ...stitchablePartProps("input"), children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uD0C0\uC785" }), _jsx("option", { value: "item", children: "item" }), _jsx("option", { value: "group", children: "group" })] })] }), _jsxs("div", { ...stitchablePartProps("report-list"), children: [isError ? (_jsxs("div", { ...stitchablePartProps("state-card"), children: [_jsx("strong", { children: "\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694." }), _jsx("p", { ...stitchablePartProps("report-meta"), children: queryErrorMessage ?? "잠시 후 다시 시도해주세요." }), _jsx("button", { type: "button", onClick: () => void refetch(), ...stitchablePartProps("secondary-button"), children: "\uB2E4\uC2DC \uC2DC\uB3C4" })] })) : null, !isError && !isFetching && filteredReports.length === 0 ? (_jsxs("div", { ...stitchablePartProps("state-card"), children: [_jsx("strong", { children: "\uD45C\uC2DC\uD560 \uD53C\uB4DC\uBC31\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("p", { ...stitchablePartProps("report-meta"), children: reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요." })] })) : null, filteredReports.map((report) => {
                        const isSelected = report.id === selectedReport?.id;
                        const isEditing = report.id === editingReportId && editableDraft;
                        const isArchived = report.status === "archived";
                        return (_jsxs("div", { ...stitchablePartProps("report-card", {
                                modifier: isSelected ? "selected" : undefined,
                            }), children: [_jsxs("button", { type: "button", onClick: () => selectReport(report.id), ...stitchablePartProps("report-card-button"), children: [_jsxs("div", { ...stitchablePartProps("report-card-header"), children: [_jsx("strong", { children: report.report_id }), _jsx("span", { ...stitchablePartProps("status-badge"), style: getStatusTone(report.status), children: report.status })] }), _jsxs("p", { ...stitchablePartProps("report-meta"), children: [report.report_type, " \u00B7 ", formatDate(report.created_at)] }), _jsx("p", { ...stitchablePartProps("report-message"), children: report.message })] }), _jsx("div", { ...stitchablePartProps("card-actions"), children: _jsx("button", { type: "button", onClick: () => startEditing(report), disabled: isArchived, ...stitchablePartProps("link-button"), children: isArchived ? "보관됨" : isEditing ? "수정 중" : "수정" }) }), isEditing && editableDraft ? (_jsxs("div", { ...stitchablePartProps("editor-section"), children: [_jsx("div", { ...stitchablePartProps("field-stack"), children: _jsx(FieldEditor, { fields: fields, message: editableDraft.message, fieldValues: editableDraft.fieldValues, onMessageChange: (nextMessage) => setEditableDraft((current) => (current ? { ...current, message: nextMessage } : current)), onFieldChange: (key, nextValue) => setEditableDraft((current) => current
                                                    ? {
                                                        ...current,
                                                        fieldValues: {
                                                            ...current.fieldValues,
                                                            [key]: nextValue,
                                                        },
                                                    }
                                                    : current) }) }), _jsxs("select", { value: editableDraft.status, onChange: (event) => setEditableDraft((current) => current
                                                ? {
                                                    ...current,
                                                    status: event.target.value,
                                                }
                                                : current), ...stitchablePartProps("input"), children: [_jsx("option", { value: "open", children: "open" }), _jsx("option", { value: "resolved", children: "resolved" }), _jsx("option", { value: "archived", children: "archived" })] }), _jsxs("div", { ...stitchablePartProps("button-row"), children: [_jsx("button", { type: "button", onClick: stopEditing, ...stitchablePartProps("secondary-button"), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: ["\uB2EB\uAE30", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.cancel, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: () => void handleUpdateSubmit(), disabled: isUpdating, ...stitchablePartProps("primary-button"), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [isUpdating ? "저장 중..." : "수정 저장", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.submit, visible: visibleShortcutKeys })] }) })] })] })) : null] }, report.id));
                    })] })] }));
}
//# sourceMappingURL=ReportFeedbackList.js.map