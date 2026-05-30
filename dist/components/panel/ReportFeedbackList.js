import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDate } from "../../utils/format.js";
import { getStatusTone } from "../../utils/reportVisual.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
import { reportStyles } from "../report/styles.js";
export function ReportFeedbackList() {
    const { palette, resolvedAppearance, isMobileViewport, filters, setFilters, filteredReports, reports, selectedReport, editingReportId, editableDraft, fields, isError, isFetching, isUpdating, queryErrorMessage, visibleShortcutKeys, searchInputRef, selectReport, startEditing, stopEditing, setEditableDraft, handleUpdateSubmit, refetch, } = useReport();
    return (_jsxs("aside", { style: {
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
        }, children: [_jsxs("div", { style: reportStyles.sidePanelHeader, children: [_jsx("strong", { children: "\uD53C\uB4DC\uBC31 \uBAA9\uB85D" }), _jsx("span", { style: {
                            ...reportStyles.badge,
                            backgroundColor: palette.chip,
                            color: palette.muted,
                        }, children: filteredReports.length })] }), _jsxs("div", { style: reportStyles.filterGrid, children: [_jsxs("div", { style: reportStyles.filterSearchRow, children: [_jsx("input", { ref: searchInputRef, value: filters.keyword, onChange: (event) => setFilters((current) => ({
                                    ...current,
                                    keyword: event.target.value,
                                })), placeholder: "\uBA54\uC2DC\uC9C0 / report id \uAC80\uC0C9", style: {
                                    ...reportStyles.input,
                                    flex: 1,
                                    backgroundColor: palette.input,
                                    borderColor: palette.inputBorder,
                                    color: palette.inputText,
                                } }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.focusSearch, visible: visibleShortcutKeys, palette: palette })] }), _jsxs("select", { value: filters.status, onChange: (event) => setFilters((current) => ({
                            ...current,
                            status: event.target.value,
                        })), style: {
                            ...reportStyles.input,
                            backgroundColor: palette.input,
                            borderColor: palette.inputBorder,
                            color: palette.inputText,
                        }, children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uC0C1\uD0DC" }), _jsx("option", { value: "open", children: "open" }), _jsx("option", { value: "resolved", children: "resolved" }), _jsx("option", { value: "archived", children: "archived" })] }), _jsxs("select", { value: filters.reportType, onChange: (event) => setFilters((current) => ({
                            ...current,
                            reportType: event.target.value,
                        })), style: {
                            ...reportStyles.input,
                            backgroundColor: palette.input,
                            borderColor: palette.inputBorder,
                            color: palette.inputText,
                        }, children: [_jsx("option", { value: "all", children: "\uC804\uCCB4 \uD0C0\uC785" }), _jsx("option", { value: "item", children: "item" }), _jsx("option", { value: "group", children: "group" })] })] }), _jsxs("div", { style: reportStyles.reportList, children: [isError ? (_jsxs("div", { style: {
                            ...reportStyles.stateCard,
                            backgroundColor: palette.chip,
                            borderColor: palette.inputBorder,
                        }, children: [_jsx("strong", { style: { color: palette.text }, children: "\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694." }), _jsx("p", { style: { ...reportStyles.reportMeta, color: palette.muted }, children: queryErrorMessage ?? "잠시 후 다시 시도해주세요." }), _jsx("button", { type: "button", onClick: () => void refetch(), style: {
                                    ...reportStyles.secondaryButton,
                                    borderColor: palette.inputBorder,
                                    color: palette.text,
                                }, children: "\uB2E4\uC2DC \uC2DC\uB3C4" })] })) : null, !isError && !isFetching && filteredReports.length === 0 ? (_jsxs("div", { style: {
                            ...reportStyles.stateCard,
                            backgroundColor: palette.chip,
                            borderColor: palette.inputBorder,
                        }, children: [_jsx("strong", { style: { color: palette.text }, children: "\uD45C\uC2DC\uD560 \uD53C\uB4DC\uBC31\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("p", { style: { ...reportStyles.reportMeta, color: palette.muted }, children: reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요." })] })) : null, filteredReports.map((report) => {
                        const isSelected = report.id === selectedReport?.id;
                        const isEditing = report.id === editingReportId && editableDraft;
                        const isArchived = report.status === "archived";
                        return (_jsxs("div", { style: {
                                ...reportStyles.reportCard,
                                backgroundColor: isSelected ? palette.chip : "transparent",
                                borderColor: isSelected ? palette.inputBorder : "transparent",
                            }, children: [_jsxs("button", { type: "button", onClick: () => selectReport(report.id), style: reportStyles.reportCardButton, children: [_jsxs("div", { style: reportStyles.reportCardHeader, children: [_jsx("strong", { style: { color: palette.text }, children: report.report_id }), _jsx("span", { style: {
                                                        ...reportStyles.statusBadge,
                                                        ...getStatusTone(report.status),
                                                    }, children: report.status })] }), _jsxs("p", { style: { ...reportStyles.reportMeta, color: palette.muted }, children: [report.report_type, " \u00B7 ", formatDate(report.created_at)] }), _jsx("p", { style: { ...reportStyles.reportMessage, color: palette.text }, children: report.message })] }), _jsx("div", { style: reportStyles.cardActions, children: _jsx("button", { type: "button", onClick: () => startEditing(report), disabled: isArchived, style: {
                                            ...reportStyles.linkButton,
                                            color: isArchived ? palette.muted : "#2563eb",
                                            opacity: isArchived ? 0.6 : 1,
                                        }, children: isArchived ? "보관됨" : isEditing ? "수정 중" : "수정" }) }), isEditing && editableDraft ? (_jsxs("div", { style: reportStyles.editorSection, children: [_jsx("div", { style: reportStyles.fieldStack, children: _jsx(FieldEditor, { fields: fields, message: editableDraft.message, fieldValues: editableDraft.fieldValues, palette: palette, onMessageChange: (nextMessage) => setEditableDraft((current) => (current ? { ...current, message: nextMessage } : current)), onFieldChange: (key, nextValue) => setEditableDraft((current) => current
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
                                                : current), style: {
                                                ...reportStyles.input,
                                                backgroundColor: palette.input,
                                                borderColor: palette.inputBorder,
                                                color: palette.inputText,
                                            }, children: [_jsx("option", { value: "open", children: "open" }), _jsx("option", { value: "resolved", children: "resolved" }), _jsx("option", { value: "archived", children: "archived" })] }), _jsxs("div", { style: reportStyles.buttonRow, children: [_jsx("button", { type: "button", onClick: stopEditing, style: {
                                                        ...reportStyles.secondaryButton,
                                                        borderColor: palette.inputBorder,
                                                        color: palette.text,
                                                    }, children: _jsxs("span", { style: reportStyles.buttonWithHint, children: ["\uB2EB\uAE30", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.cancel, visible: visibleShortcutKeys, palette: palette })] }) }), _jsx("button", { type: "button", onClick: () => void handleUpdateSubmit(), disabled: isUpdating, style: {
                                                        ...reportStyles.primaryButton,
                                                        backgroundColor: "#2563eb",
                                                    }, children: _jsxs("span", { style: reportStyles.buttonWithHint, children: [isUpdating ? "저장 중..." : "수정 저장", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.submit, visible: visibleShortcutKeys, palette: palette })] }) })] })] })) : null] }, report.id));
                    })] })] }));
}
//# sourceMappingURL=ReportFeedbackList.js.map