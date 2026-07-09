import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { panelAnchorSide, placementToCollapsedPanelStyle, usePanelDock } from "../../hooks/usePanelDock.js";
import { usePanelResize, panelSizeToStyle } from "../../hooks/usePanelResize.js";
import { usePanelFeedbackTransfer } from "../../hooks/usePanelFeedbackTransfer.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EyeOpenIcon, LogoIcon, SelectIcon, SettingsIcon } from "../../components/icons/Icons.js";
import { IconTooltipButton } from "../../components/ui/IconTooltipButton.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportOverview } from "./ReportOverview.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { ReportAuthDiagnostics } from "./ReportAuthDiagnostics.js";
import { ReportCommandPanel } from "./ReportCommandPanel.js";
import { ReportCommandReplaceConfirmDialog } from "./ReportCommandReplaceConfirmDialog.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { ReportImportProjectMismatchDialog } from "./ReportImportProjectMismatchDialog.js";
import { ReportPersonalKeyDialog } from "./ReportPersonalKeyDialog.js";
import { PanelSettings } from "./PanelSettings.js";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
import { ProbeEditModeBanner } from "./ProbeEditModeBanner.js";
import { PanelRoleSwitch } from "./PanelRoleSwitch.js";
import { PanelPresentationSwitch } from "./PanelPresentationSwitch.js";
import { PanelOnboarding } from "./PanelOnboarding.js";
import { PanelKeyGate } from "./PanelKeyGate.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import { createPersonalKeyBackupFilename, downloadPersonalKeyBackup } from "../../utils/feedbackDataTransfer.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick, messages }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-4 w-4" }) : _jsx(ChevronLeftIcon, { className: "h-4 w-4" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-4 w-4" }) : _jsx(ChevronRightIcon, { className: "h-4 w-4" });
    return (_jsx(HoverTooltip, { label: collapsed ? messages.panel.expand : messages.panel.collapse, className: "h-full", children: _jsx("button", { type: "button", onClick: onClick, "aria-expanded": !collapsed, "aria-label": collapsed ? messages.panel.expand : messages.panel.collapse, className: collapsed
                ? anchorSide === "right"
                    ? "flex h-[105px] w-[32px] items-center justify-center rounded-l-[12px] rounded-r-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                    : "flex h-[105px] w-[32px] items-center justify-center rounded-r-[12px] rounded-l-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                : "flex items-center justify-center py-[8px] text-[var(--adaptive-text-muted)]", children: collapsed ? expandIcon : hideIcon }) }));
}
function PanelTabButton({ label, active, onClick }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: `flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[2px] hover:bg-[var(--adaptive-black200)] ${active ? "bg-[var(--adaptive-black50)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}`, children: [_jsx("p", { className: "font-[500] text-[var(--adaptive-black500)]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 shrink-0 transition-transform ${active ? "rotate-180" : ""}` })] }));
}
export function ReportControlPanel() {
    const { mode, roleStatItems, errorMessage, environment, projectId, appVersion, activeReplyReportId, showFeedbackList, isMobileViewport, panelTab, panelAppearance, setPanelAppearance, tooltipAppearance, setTooltipAppearance, questionThreadDisplay, setQuestionThreadDisplay, canTransferFeedback, personalKey, publicKey, panelView, messages, toggleReportMode, toggleIssueMode, openPanelTab, setErrorMessage, refetch, panelCollapsed, setPanelCollapsed, } = useReport();
    const [personalKeyStep, setPersonalKeyStep] = useState("none");
    const [personalKeyNotice, setPersonalKeyNotice] = useState("");
    const isRecording = mode === "report";
    const isIssueMode = mode === "view";
    const isGateView = panelView !== "ready";
    const transferScope = { projectId, environment, appVersion };
    const { isDragOver, pendingImport, importStep, pendingCommand, commandConflicts, commandStep, commandNotice, setCommandNotice, handleExport, handleImportFromMenu, handleOpenCommand, handleCloseCommand, handleCommandExecute, handleCancelCommandReplace, handleConfirmCommandReplace, handleCancelImport, handleProceedImportAfterMismatch, handleApplyImport, handleBackupAndApplyImport, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, } = usePanelFeedbackTransfer({
        transferScope,
        canTransferFeedback,
        messages,
        setErrorMessage,
        refetch,
        openPanelTab,
        isRecording,
    });
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}-${panelTab ?? "none"}-${isIssueMode}-${importStep !== "none" ? "import" : "none"}-${commandStep !== "none" ? "command" : "none"}-${panelView}`,
    });
    const panelExpanded = !panelCollapsed && !isRecording;
    const contentSectionOpen = panelTab !== null && personalKeyStep === "none" && importStep === "none" && !isGateView;
    const { panelSize, resizeCorner, handleResizePointerDown, resetPanelSize, isDefaultSize, isResizing, ghostRef } = usePanelResize({
        enabled: !isMobileViewport && panelExpanded,
        corner: placementCorner,
        heightResizeEnabled: contentSectionOpen,
        panelRef,
    });
    const applyFixedHeight = contentSectionOpen && panelSize.height !== null;
    const anchorSide = panelAnchorSide(placementCorner);
    const handleKeyCopy = async () => {
        if (!personalKey) {
            return;
        }
        const filename = createPersonalKeyBackupFilename(projectId, environment, appVersion);
        const result = await downloadPersonalKeyBackup(filename, personalKey);
        if (result === "saved" || result === "downloaded") {
            setPersonalKeyNotice(messages.personalKey.backupSaved);
        }
        else if (result === "cancelled") {
            setPersonalKeyNotice(messages.personalKey.backupCancelled);
        }
        else {
            setErrorMessage(messages.personalKey.backupFailed);
        }
    };
    const handlePublicKeyCopy = async () => {
        if (!publicKey) {
            return;
        }
        try {
            await navigator.clipboard.writeText(publicKey);
            setPersonalKeyNotice(messages.personalKey.publicKeyCopied);
        }
        catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };
    const handlePanelTabClick = (tab) => {
        openPanelTab(tab);
    };
    const handleTogglePanelCollapsed = () => {
        setPanelCollapsed((current) => !current);
    };
    const resolvedPanelStyle = panelCollapsed && !isRecording ? placementToCollapsedPanelStyle({ corner: placementCorner }) : panelStyle;
    const resolvedSizeStyle = panelExpanded ? panelSizeToStyle(panelSize, applyFixedHeight || isGateView) : undefined;
    const panelSideControls = panelExpanded ? (_jsx("div", { className: "flex shrink-0 flex-col items-center border-l border-l-[var(--adaptive-border-subtle)] h-full", children: _jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: handleTogglePanelCollapsed, messages: messages }) })) : null;
    const gateBody = panelView === "onboarding" ? (_jsx(PanelOnboarding, {})) : panelView === "setup-complete" || panelView === "key-issue" ? (_jsx(PanelKeyGate, { mode: panelView })) : null;
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), isResizing ? (_jsx(CornerResizeGhost, { ghostRef: ghostRef, zIndexClassName: "z-[1000001]" })) : null, _jsxs("div", { ref: panelRef, onDragEnter: isGateView ? undefined : handleDragEnter, onDragLeave: isGateView ? undefined : handleDragLeave, onDragOver: isGateView ? undefined : handleDragOver, onDrop: isGateView ? undefined : handleDrop, className: `pointer-events-auto z-[1000000] flex ${isRecording
                    ? "min-h-[40px] bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[12px] shadow-[0_0_120px_0_var(--adaptive-black500)]"
                    : panelCollapsed
                        ? ""
                        : "relative bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[12px] border-0 shadow-[0_0_120px_0_var(--adaptive-black500)]"}`, style: { ...resolvedPanelStyle, ...resolvedSizeStyle }, children: [panelExpanded ? (_jsx(CornerResizeHandle, { corner: resizeCorner, ariaLabel: messages.panel.resizeAriaLabel, inactive: isDragging, onPointerDown: handleResizePointerDown })) : null, _jsxs("div", { className: panelCollapsed && !isRecording ? "flex shrink-0" : `flex w-full min-w-0 flex-col ${applyFixedHeight || isGateView ? "h-full min-h-0" : ""}`, children: [panelCollapsed && !isRecording ? null : _jsx(ProbeEditModeBanner, {}), isRecording ? (_jsxs("section", { className: "flex items-center justify-between gap-[16px] px-[12px] py-[8px]", children: [_jsx("section", { className: "flex items-center gap-[4px] justify-start shrink-0", children: _jsx(LogoIcon, { className: "w-[94px]" }) }), _jsx("button", { type: "button", onClick: toggleReportMode, className: "flex items-center shrink-0", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: messages.panel.stopFeedback }) })] })) : panelCollapsed ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: handleTogglePanelCollapsed, messages: messages })) : isGateView ? (_jsxs("section", { className: "relative flex h-full min-h-0 flex-1 flex-col", children: [_jsxs("section", { className: "flex shrink-0", children: [anchorSide === "left" ? panelSideControls : null, _jsx("div", { className: "flex flex-1 flex-col", children: _jsx("section", { className: "flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)] p-[4px_12px]", onPointerDown: handleDragHandlePointerDown, children: _jsx(LogoIcon, { className: "w-[94px] shrink-0" }) }) }), anchorSide === "right" ? panelSideControls : null] }), _jsx("div", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto", children: gateBody })] })) : (_jsx(_Fragment, { children: _jsxs("section", { className: `relative flex min-w-0 flex-col ${applyFixedHeight ? "h-full min-h-0 flex-1" : "shrink-0"}`, children: [isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: messages.panel.importDragOverlay }) })) : null, _jsxs("section", { className: "flex shrink-0", children: [anchorSide === "left" ? panelSideControls : null, _jsxs("div", { className: "flex flex-1 flex-col", children: [_jsxs("section", { className: "flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)] p-[4px_12px]", onPointerDown: handleDragHandlePointerDown, children: [_jsx("section", { className: "flex min-w-0 items-center gap-[4px]", children: _jsx(LogoIcon, { className: "w-[94px] shrink-0" }) }), _jsxs("section", { className: "flex shrink-0 items-center gap-[4px]", children: [_jsx(PanelPresentationSwitch, {}), _jsx(PanelRoleSwitch, {}), _jsx(IconTooltipButton, { label: messages.panel.viewFeedbacks, active: isIssueMode, onClick: toggleIssueMode, children: _jsx(EyeOpenIcon, { className: "h-[16px] w-[16px]" }) }), _jsx(IconTooltipButton, { label: messages.panel.tabSettings, active: panelTab === "settings" || panelTab === "command", onClick: () => handlePanelTabClick("settings"), children: _jsx(SettingsIcon, { className: "h-[16px] w-[16px]" }) }), _jsx(IconTooltipButton, { label: messages.panel.resetSizeTitle, disabled: isDefaultSize, onClick: resetPanelSize, children: _jsx("span", { className: "inline-flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border border-[var(--adaptive-border-subtle)] text-[10px] font-bold leading-none", children: "\u21BA" }) })] })] }), _jsxs("section", { className: "flex items-center h-full", children: [_jsx("button", { type: "button", onClick: toggleReportMode, className: "flex flex-col shrink-0 justify-center items-center gap-[4px] p-[0_16px] border-r border-r-[var(--adaptive-border-subtle)] h-full hover:bg-[#f6572d]", children: _jsx(SelectIcon, { className: "w-[24px]" }) }), _jsx("section", { className: "flex min-w-0 flex-1 px-[16px] py-[8px]", "aria-label": messages.panel.repositionAriaLabel, title: messages.panel.repositionTitle, style: isDragging ? { opacity: 0.8 } : undefined, children: roleStatItems.map((item) => item.kind === "cta" ? (_jsx("p", { className: "flex-1 self-center text-[12px] font-medium text-[var(--adaptive-black600)]", children: item.display }, item.key)) : (_jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: item.label }), _jsx("p", { className: `text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: item.display })] }, item.key))) })] })] }), anchorSide === "right" ? panelSideControls : null] }), _jsx("section", { className: "flex shrink-0 items-stretch border-t border-[var(--adaptive-border-subtle)]", children: _jsxs("div", { className: "flex min-w-0 flex-1 overflow-hidden border-b border-b-[var(--adaptive-border-subtle)]", children: [_jsx(PanelTabButton, { label: messages.panel.tabThisPage, active: panelTab === "route-details", onClick: () => handlePanelTabClick("route-details") }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" }), showFeedbackList ? (_jsxs(_Fragment, { children: [_jsx(PanelTabButton, { label: messages.panel.tabFeedbackList, active: panelTab === "feedback-list", onClick: () => handlePanelTabClick("feedback-list") }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" })] })) : null, _jsx(PanelTabButton, { label: messages.panel.tabDiagnostics, active: panelTab === "diagnostics", onClick: () => handlePanelTabClick("diagnostics") }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" })] }) }), errorMessage && importStep === "none" && commandStep === "none" && !activeReplyReportId ? _jsx("p", { className: "px-[8px] text-[12px] text-rose-700", children: errorMessage }) : null, personalKeyNotice ? _jsx("p", { className: "px-[8px] py-[4px] text-[12px] text-[var(--adaptive-green500)]", children: personalKeyNotice }) : null, personalKeyStep !== "none" ? (_jsx(ReportPersonalKeyDialog, { mode: personalKeyStep, onCancel: () => setPersonalKeyStep("none"), onComplete: (message) => {
                                                setPersonalKeyNotice(message);
                                                setPersonalKeyStep("none");
                                            } })) : null, personalKeyStep === "none" && importStep === "project-mismatch" && pendingImport ? (_jsx(ReportImportProjectMismatchDialog, { currentProject: transferScope, importedProject: pendingImport.project, exportedAt: pendingImport.exportedAt, onProceed: handleProceedImportAfterMismatch, onCancel: handleCancelImport })) : null, personalKeyStep === "none" && importStep === "confirm" && pendingImport ? (_jsx(ReportImportConfirmDialog, { onApply: handleApplyImport, onCancel: handleCancelImport, onBackupAndApply: handleBackupAndApplyImport })) : null, contentSectionOpen ? (_jsxs("div", { className: applyFixedHeight ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "flex flex-col", children: [panelTab === "overview" && commandStep === "none" ? _jsx(ReportOverview, {}) : null, panelTab === "route-details" && commandStep === "none" ? _jsx(ReportRouteDetails, {}) : null, panelTab === "feedback-list" && showFeedbackList && commandStep === "none" ? _jsx(ReportFeedbackList, {}) : null, panelTab === "diagnostics" && commandStep === "none" ? _jsx(ReportAuthDiagnostics, {}) : null, panelTab === "settings" && commandStep === "none" ? (_jsx(PanelSettings, { transferDisabled: !canTransferFeedback, panelAppearance: panelAppearance, onPanelAppearanceChange: setPanelAppearance, tooltipAppearance: tooltipAppearance, onTooltipAppearanceChange: setTooltipAppearance, questionThreadDisplay: questionThreadDisplay, onQuestionThreadDisplayChange: setQuestionThreadDisplay, onExport: handleExport, onImport: handleImportFromMenu, onCommand: handleOpenCommand, hasPersonalKey: Boolean(personalKey), onKeyCopy: () => void handleKeyCopy(), onPublicKeyCopy: () => void handlePublicKeyCopy(), onKeyInsert: () => {
                                                        setPersonalKeyStep("insert");
                                                        setPersonalKeyNotice("");
                                                    }, onKeyRotate: () => {
                                                        setPersonalKeyStep("rotate");
                                                        setPersonalKeyNotice("");
                                                    } })) : null, panelTab === "command" && commandStep === "none" ? (_jsx(ReportCommandPanel, { onExecute: handleCommandExecute, onClose: handleCloseCommand, notice: commandNotice, onNoticeClear: () => setCommandNotice(null) })) : null] })) : null, personalKeyStep === "none" && commandStep === "replace-confirm" && pendingCommand ? (_jsx(ReportCommandReplaceConfirmDialog, { conflicts: commandConflicts, onConfirm: handleConfirmCommandReplace, onCancel: handleCancelCommandReplace })) : null] }) }))] })] })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map