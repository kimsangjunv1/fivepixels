import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { usePanelFeedbackTransfer } from "../../hooks/usePanelFeedbackTransfer.js";
import { useReport } from "../../providers/reportContext.js";
import { SelectIcon } from "../../components/icons/SelectIcon.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { ReportCommandPanel } from "./ReportCommandPanel.js";
import { ReportCommandReplaceConfirmDialog } from "./ReportCommandReplaceConfirmDialog.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { ReportImportProjectMismatchDialog } from "./ReportImportProjectMismatchDialog.js";
import { PanelMoreMenu } from "./PanelMoreMenu.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { LogoIcon } from "./../icons/LogoIcon.js";
import { motion } from "../motion/index.js";
import { formatStatCount } from "../../utils/formatStatCount.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    return (_jsx("button", { type: "button", onClick: onClick, className: "", "aria-expanded": !collapsed, "aria-label": collapsed ? "패널 펼치기" : "패널 숨기기", title: collapsed ? "패널 펼치기" : "패널 숨기기", children: collapsed ? expandIcon : hideIcon }));
}
function PanelTabButton({ label, active, onClick }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: `flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[2px] ${active ? "bg-[var(--adaptive-black100)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}`, children: [_jsx("p", { className: "text-[var(--adaptive-black800)] font-[500]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 transition-transform ${active ? "rotate-180" : ""}` })] }));
}
function EnvironmentBadge({ environment }) {
    if (!environment) {
        return null;
    }
    return (_jsxs("span", { className: "inline-flex items-center gap-[4px] rounded-full border border-[var(--adaptive-black300)] bg-[var(--adaptive-black50)] px-[4px] py-[2px]", children: [_jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: environment }), _jsx("span", { className: "inline-flex h-[4px] w-[4px] rounded-full bg-[var(--adaptive-green500)]", "aria-hidden": true })] }));
}
const RECORDING_STATUS_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 4px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(0,0,0,0.75))";
export function ReportControlPanel() {
    const { mode, targetStats, statusText, errorMessage, environment, projectId, appVersion, showFeedbackList, showTargetPreview, isMobileViewport, panelTab, appearance, setAppearance, canTransferFeedback, toggleReportMode, toggleTargetPreview, toggleIssueMode, openPanelTab, setErrorMessage, refetch, } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [viewMenuOpen, setViewMenuOpen] = useState(false);
    const isRecording = mode === "report";
    const isIssueMode = mode === "view";
    const transferScope = { projectId, environment, appVersion };
    const { isDragOver, pendingImport, importStep, pendingCommand, commandConflicts, commandStep, commandNotice, setCommandNotice, handleExport, handleImportFromMenu, handleOpenCommand, handleCloseCommand, handleCommandExecute, handleCancelCommandReplace, handleConfirmCommandReplace, handleCancelImport, handleProceedImportAfterMismatch, handleApplyImport, handleBackupAndApplyImport, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, } = usePanelFeedbackTransfer({
        transferScope,
        canTransferFeedback,
        setErrorMessage,
        refetch,
        openPanelTab,
        onMoreMenuClose: () => setMoreMenuOpen(false),
        isRecording,
    });
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}-${panelTab ?? "none"}-${isIssueMode}-${importStep !== "none" ? "import" : "none"}-${commandStep !== "none" ? "command" : "none"}`,
    });
    const anchorSide = panelAnchorSide(placementCorner);
    const handlePanelTabClick = (tab) => {
        openPanelTab(tab);
    };
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), _jsx(motion.div, { ref: panelRef, transition: { duration: 0.25, ease: "cubic-bezier(0.22, 1, 0.36, 1)" }, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, className: `pointer-events-auto fixed z-[1000000] bg-[var(--adaptive-whiteOpacity800)] backdrop-blur-[50px] rounded-[24px] shadow-[0_0_120px_0_var(--adaptive-blackOpacity500)] flex ${isRecording ? "min-h-[40px] p-[4px]" : "max-h-[80vh] min-h-[40px w-full max-w-[375px]"}`, style: { ...panelStyle, fontSize: "14px" }, children: _jsx(motion.div, { className: "flex min-w-0 flex-1 flex-col w-full", children: isRecording ? (_jsxs("section", { className: "flex items-center justify-between gap-[16px] px-[12px] py-[8px]", children: [_jsxs("section", { className: "flex items-center gap-[4px] justify-start shrink-0", children: [_jsx(LogoIcon, { className: "w-[16px]" }), _jsx("p", { className: "text-[var(--adaptive-black900)] text-[14px]", children: "Stitchable\u00B0" })] }), _jsx("button", { type: "button", onClick: toggleReportMode, className: "flex items-center shrink-0", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: "Stop Feedback..." }) })] })) : (_jsx(_Fragment, { children: !panelCollapsed ? (_jsxs("section", { className: "relative flex min-w-0 flex-1 flex-col", children: [isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: "\uC120\uD0DD\uD558\uC2E0 JSON\uC744 import \uD569\uB2C8\uB2E4" }) })) : null, _jsxs("section", { className: "flex", children: [anchorSide === "left" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null, _jsxs("div", { className: "flex flex-col gap-[8px] p-[8px_0_8px_12px] flex-1", children: [_jsxs("section", { className: "flex items-center justify-between gap-[8px]", children: [_jsxs("section", { className: "flex min-w-0 items-center gap-[4px]", children: [_jsx(LogoIcon, { className: "w-[16px] shrink-0" }), _jsx("p", { className: "shrink-0 text-[var(--adaptive-black900)] font-[700] text-[14px] select-none", children: "Stitchable\u00B0" }), _jsx(EnvironmentBadge, { environment: environment })] }), _jsxs("section", { className: "flex shrink-0 items-center", children: [_jsxs("button", { type: "button", onClick: toggleReportMode, className: "flex items-center gap-[4px] rounded-l-[8px] bg-[var(--adaptive-black900)] p-[0_8px]", children: [_jsx(SelectIcon, { className: "w-[16px]" }), _jsx("p", { className: "text-[12px] text-[var(--adaptive-black50)]", children: "add feedback" })] }), _jsxs(PanelDropdownMenu, { open: viewMenuOpen, onClose: () => setViewMenuOpen(false), menuClassName: "min-w-[200px]", trigger: _jsx("button", { type: "button", onClick: () => setViewMenuOpen((current) => !current), "aria-expanded": viewMenuOpen, "aria-haspopup": "menu", "aria-label": "View options", className: "flex items-center rounded-r-[8px] border-l border-[var(--adaptive-black700)] bg-[var(--adaptive-black900)] p-[2px_8px] h-[24px]", children: _jsx(ChevronDownIcon, { className: `h-4 w-4 text-[var(--adaptive-black900)] transition-transform ${viewMenuOpen ? "rotate-180" : ""}` }) }), children: [_jsx(PanelDropdownMenuItem, { active: showTargetPreview, disabled: mode !== "idle", onClick: () => {
                                                                                setViewMenuOpen(false);
                                                                                toggleTargetPreview();
                                                                            }, children: "View Selectable Elements" }), _jsx(PanelDropdownMenuItem, { active: isIssueMode, onClick: () => {
                                                                                setViewMenuOpen(false);
                                                                                toggleIssueMode();
                                                                            }, children: "View Feedbacks" })] })] })] }), _jsx("section", { className: "flex gap-[12px]", children: _jsxs("section", { className: "flex cursor-move flex-1", onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", style: isDragging ? { opacity: 0.8 } : undefined, children: [_jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "Found" }), _jsx("p", { className: `text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.found) })] }), _jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "Group" }), _jsx("p", { className: `text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.group) })] }), _jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "Item" }), _jsx("p", { className: `text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.item) })] })] }) })] }), anchorSide === "right" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null] }), _jsxs("section", { className: "flex items-stretch border-t border-[var(--adaptive-black200)]", children: [_jsxs("div", { className: "flex min-w-0 flex-1 overflow-hidden", children: [_jsx(PanelTabButton, { label: "Page Details", active: panelTab === "route-details", onClick: () => handlePanelTabClick("route-details") }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-black200)]" }), showFeedbackList ? (_jsx(PanelTabButton, { label: "Feedback List", active: panelTab === "feedback-list", onClick: () => handlePanelTabClick("feedback-list") })) : null] }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-black200)]" }), _jsx(PanelMoreMenu, { open: moreMenuOpen, disabled: !canTransferFeedback, appearance: appearance, onAppearanceChange: setAppearance, onToggle: () => setMoreMenuOpen((current) => !current), onClose: () => setMoreMenuOpen(false), onExport: handleExport, onImport: handleImportFromMenu, onCommand: handleOpenCommand })] }), errorMessage && importStep === "none" && commandStep === "none" ? _jsx("p", { className: "px-[8px] text-[12px] text-rose-700", children: errorMessage }) : null, importStep === "project-mismatch" && pendingImport ? (_jsx(ReportImportProjectMismatchDialog, { currentProject: transferScope, importedProject: pendingImport.project, exportedAt: pendingImport.exportedAt, onProceed: handleProceedImportAfterMismatch, onCancel: handleCancelImport })) : null, importStep === "confirm" && pendingImport ? (_jsx(ReportImportConfirmDialog, { onApply: handleApplyImport, onCancel: handleCancelImport, onBackupAndApply: handleBackupAndApplyImport })) : null, panelTab === "route-details" && importStep === "none" && commandStep === "none" ? _jsx(ReportRouteDetails, {}) : null, panelTab === "feedback-list" && showFeedbackList && importStep === "none" && commandStep === "none" ? _jsx(ReportFeedbackList, {}) : null, commandStep === "replace-confirm" && pendingCommand ? (_jsx(ReportCommandReplaceConfirmDialog, { conflicts: commandConflicts, onConfirm: handleConfirmCommandReplace, onCancel: handleCancelCommandReplace })) : null, panelTab === "command" && importStep === "none" && commandStep === "none" ? (_jsx(ReportCommandPanel, { onExecute: handleCommandExecute, onClose: handleCloseCommand, notice: commandNotice, onNoticeClear: () => setCommandNotice(null) })) : null] })) : null })) }) })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map