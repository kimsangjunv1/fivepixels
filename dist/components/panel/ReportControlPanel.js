import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { panelAnchorSide, placementToCollapsedPanelStyle, usePanelDock } from "../../hooks/usePanelDock.js";
import { usePanelFeedbackTransfer } from "../../hooks/usePanelFeedbackTransfer.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EyeOpenIcon, LogoIcon, RouteWaitStatusIcon, SelectIcon } from "../../components/icons/Icons.js";
import { IconTooltipButton } from "../../components/ui/IconTooltipButton.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { ReportCommandPanel } from "./ReportCommandPanel.js";
import { ReportCommandReplaceConfirmDialog } from "./ReportCommandReplaceConfirmDialog.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { ReportImportProjectMismatchDialog } from "./ReportImportProjectMismatchDialog.js";
import { ReportPersonalKeyDialog } from "./ReportPersonalKeyDialog.js";
import { PanelMoreMenu } from "./PanelMoreMenu.js";
import { motion } from "../../components/motion/index.js";
import { formatStatCount } from "../../utils/formatStatCount.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick, messages }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-4 w-4" }) : _jsx(ChevronLeftIcon, { className: "h-4 w-4" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-4 w-4" }) : _jsx(ChevronRightIcon, { className: "h-4 w-4" });
    return (_jsx(HoverTooltip, { label: collapsed ? messages.panel.expand : messages.panel.collapse, children: _jsx("button", { type: "button", onClick: onClick, "aria-expanded": !collapsed, "aria-label": collapsed ? messages.panel.expand : messages.panel.collapse, className: collapsed
                ? anchorSide === "right"
                    ? "flex h-[105px] w-[32px] items-center justify-center rounded-l-[12px] rounded-r-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                    : "flex h-[105px] w-[32px] items-center justify-center rounded-r-[12px] rounded-l-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                : "flex items-center justify-center px-[4px] py-[8px] text-[var(--adaptive-text-muted)]", children: collapsed ? expandIcon : hideIcon }) }));
}
function PanelTabButton({ label, active, onClick }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: `flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[2px] ${active ? "bg-[var(--adaptive-black100)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}`, children: [_jsx("p", { className: "font-[500]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 shrink-0 transition-transform ${active ? "rotate-180" : ""}` })] }));
}
function EnvironmentBadge({ environment }) {
    if (!environment) {
        return null;
    }
    return (_jsxs("span", { className: "inline-flex items-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[4px] py-[2px]", children: [_jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: environment }), _jsx("span", { className: "inline-flex h-[4px] w-[4px] rounded-full bg-[var(--adaptive-green500)]", "aria-hidden": true })] }));
}
const RECORDING_STATUS_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 4px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(0,0,0,0.75))";
export function ReportControlPanel() {
    const { mode, targetStats, statusText, errorMessage, environment, projectId, appVersion, showFeedbackList, showTargetPreview, isMobileViewport, panelTab, appearance, setAppearance, canTransferFeedback, personalKey, publicKey, personalKeyRequired, personalKeyPendingRegistration, messages, toggleReportMode, toggleTargetPreview, toggleIssueMode, openPanelTab, setErrorMessage, refetch, } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [personalKeyStep, setPersonalKeyStep] = useState("none");
    const [personalKeyNotice, setPersonalKeyNotice] = useState("");
    const isRecording = mode === "report";
    const isIssueMode = mode === "view";
    const transferScope = { projectId, environment, appVersion };
    const { isDragOver, pendingImport, importStep, pendingCommand, commandConflicts, commandStep, commandNotice, setCommandNotice, handleExport, handleImportFromMenu, handleOpenCommand, handleCloseCommand, handleCommandExecute, handleCancelCommandReplace, handleConfirmCommandReplace, handleCancelImport, handleProceedImportAfterMismatch, handleApplyImport, handleBackupAndApplyImport, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, } = usePanelFeedbackTransfer({
        transferScope,
        canTransferFeedback,
        messages,
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
    useEffect(() => {
        if (personalKeyRequired && !personalKey) {
            setPersonalKeyStep("required");
        }
    }, [personalKey, personalKeyRequired]);
    const handleKeyCopy = async () => {
        if (!personalKey) {
            return;
        }
        try {
            await navigator.clipboard.writeText(personalKey);
            setPersonalKeyNotice(messages.personalKey.copySuccess);
            setMoreMenuOpen(false);
        }
        catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };
    const handlePublicKeyCopy = async () => {
        if (!publicKey) {
            return;
        }
        try {
            await navigator.clipboard.writeText(publicKey);
            setPersonalKeyNotice(messages.personalKey.publicKeyCopied);
            setMoreMenuOpen(false);
        }
        catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };
    const handlePanelTabClick = (tab) => {
        openPanelTab(tab);
    };
    const handleTogglePanelCollapsed = () => {
        setMoreMenuOpen(false);
        setPanelCollapsed((current) => !current);
    };
    const resolvedPanelStyle = panelCollapsed && !isRecording ? placementToCollapsedPanelStyle({ corner: placementCorner }) : panelStyle;
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), _jsx(motion.div, { ref: panelRef, transition: { duration: 0.25, ease: "cubic-bezier(0.22, 1, 0.36, 1)" }, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, className: `pointer-events-auto fixed z-[1000000] flex ${isRecording
                    ? "min-h-[40px] bg-[var(--adaptive-surface-overlay)] p-[4px] backdrop-blur-[50px] rounded-[12px] shadow-[0_0_120px_0_var(--adaptive-blackOpacity500)]"
                    : panelCollapsed
                        ? ""
                        : "max-h-[calc(100svh-(16px*2))] max-w-[calc(100svw-(16px*2))] bg-[var(--adaptive-surface-overlay)] backdrop-blur-[50px] rounded-[12px] shadow-[0_0_120px_0_var(--adaptive-blackOpacity500)]"}`, style: { ...resolvedPanelStyle, fontSize: "14px" }, children: _jsx(motion.div, { className: panelCollapsed && !isRecording ? "flex shrink-0" : "flex min-w-0 flex-1 flex-col w-full", children: isRecording ? (_jsxs("section", { className: "flex items-center justify-between gap-[16px] px-[12px] py-[8px]", children: [_jsx("section", { className: "flex items-center gap-[4px] justify-start shrink-0", children: _jsx(LogoIcon, { className: "w-[94px]" }) }), _jsx("button", { type: "button", onClick: toggleReportMode, className: "flex items-center shrink-0", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: messages.panel.stopFeedback }) })] })) : panelCollapsed ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: handleTogglePanelCollapsed, messages: messages })) : (_jsx(_Fragment, { children: _jsxs("section", { className: "relative flex min-w-0 flex-1 flex-col h-full", children: [isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: messages.panel.importDragOverlay }) })) : null, _jsxs("section", { className: "flex", children: [anchorSide === "left" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: handleTogglePanelCollapsed, messages: messages })) : null, _jsxs("div", { className: "flex flex-col gap-[8px] p-[8px_8px_8px_12px] flex-1", children: [_jsxs("section", { className: "flex items-center justify-between gap-[8px]", children: [_jsx("section", { className: "flex min-w-0 items-center gap-[4px]", children: _jsx(LogoIcon, { className: "w-[94px] shrink-0" }) }), _jsxs("section", { className: "flex shrink-0 items-center gap-[4px]", children: [_jsxs("button", { type: "button", onClick: toggleReportMode, className: "flex items-center gap-[4px] rounded-[8px] bg-[var(--adaptive-black100)] p-[0_8px] h-[24px]", children: [_jsx(SelectIcon, { className: "w-[16px]" }), _jsx("p", { className: "text-[12px] text-[var(--adaptive-black900)]", children: messages.panel.addFeedback })] }), _jsx(IconTooltipButton, { label: messages.panel.viewSelectableElements, active: showTargetPreview, disabled: mode !== "idle", onClick: toggleTargetPreview, children: _jsx(EyeOpenIcon, { className: "h-[16px] w-[16px]" }) }), _jsx(IconTooltipButton, { label: messages.panel.viewFeedbacks, active: isIssueMode, onClick: toggleIssueMode, children: _jsx(RouteWaitStatusIcon, { className: "h-[16px] w-[16px]" }) })] })] }), _jsx("section", { className: "flex gap-[12px]", children: _jsxs("section", { className: "flex cursor-move flex-1", onPointerDown: handleDragHandlePointerDown, "aria-label": messages.panel.repositionAriaLabel, title: messages.panel.repositionTitle, style: isDragging ? { opacity: 0.8 } : undefined, children: [_jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: messages.panel.statsFound }), _jsx("p", { className: `text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.found) })] }), _jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: messages.panel.statsGroup }), _jsx("p", { className: `text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.group) })] }), _jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: messages.panel.statsItem }), _jsx("p", { className: `text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.item) })] })] }) })] }), anchorSide === "right" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: handleTogglePanelCollapsed, messages: messages })) : null] }), _jsxs("section", { className: "flex items-stretch border-t border-[var(--adaptive-border-subtle)]", children: [_jsxs("div", { className: "flex min-w-0 flex-1 overflow-hidden", children: [_jsx(PanelTabButton, { label: messages.panel.tabPageDetails, active: panelTab === "route-details", onClick: () => handlePanelTabClick("route-details") }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" }), showFeedbackList ? (_jsx(PanelTabButton, { label: messages.panel.tabFeedbackList, active: panelTab === "feedback-list", onClick: () => handlePanelTabClick("feedback-list") })) : null] }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" }), _jsx(PanelMoreMenu, { open: moreMenuOpen, transferDisabled: !canTransferFeedback, appearance: appearance, onAppearanceChange: setAppearance, onToggle: () => setMoreMenuOpen((current) => !current), onClose: () => setMoreMenuOpen(false), onExport: handleExport, onImport: handleImportFromMenu, onCommand: handleOpenCommand, hasPersonalKey: Boolean(personalKey), onKeyCopy: () => void handleKeyCopy(), onPublicKeyCopy: () => void handlePublicKeyCopy(), onKeyInsert: () => {
                                                setMoreMenuOpen(false);
                                                setPersonalKeyStep("insert");
                                                setPersonalKeyNotice("");
                                            }, onKeyRotate: () => {
                                                setMoreMenuOpen(false);
                                                setPersonalKeyStep("rotate");
                                                setPersonalKeyNotice("");
                                            } })] }), errorMessage && importStep === "none" && commandStep === "none" ? _jsx("p", { className: "px-[8px] text-[12px] text-rose-700", children: errorMessage }) : null, personalKeyNotice ? _jsx("p", { className: "px-[8px] py-[4px] text-[12px] text-[var(--adaptive-green500)]", children: personalKeyNotice }) : null, personalKeyPendingRegistration ? _jsx("p", { className: "px-[8px] py-[4px] text-[12px] text-amber-700", children: messages.personalKey.registrationPending }) : null, personalKeyStep !== "none" ? (_jsx(ReportPersonalKeyDialog, { mode: personalKeyStep, onCancel: () => setPersonalKeyStep("none"), onComplete: (message) => {
                                        setPersonalKeyNotice(message);
                                        setPersonalKeyStep("none");
                                    } })) : null, personalKeyStep === "none" && importStep === "project-mismatch" && pendingImport ? (_jsx(ReportImportProjectMismatchDialog, { currentProject: transferScope, importedProject: pendingImport.project, exportedAt: pendingImport.exportedAt, onProceed: handleProceedImportAfterMismatch, onCancel: handleCancelImport })) : null, personalKeyStep === "none" && importStep === "confirm" && pendingImport ? (_jsx(ReportImportConfirmDialog, { onApply: handleApplyImport, onCancel: handleCancelImport, onBackupAndApply: handleBackupAndApplyImport })) : null, personalKeyStep === "none" && panelTab === "route-details" && importStep === "none" && commandStep === "none" ? _jsx(ReportRouteDetails, {}) : null, personalKeyStep === "none" && panelTab === "feedback-list" && showFeedbackList && importStep === "none" && commandStep === "none" ? _jsx(ReportFeedbackList, {}) : null, personalKeyStep === "none" && commandStep === "replace-confirm" && pendingCommand ? (_jsx(ReportCommandReplaceConfirmDialog, { conflicts: commandConflicts, onConfirm: handleConfirmCommandReplace, onCancel: handleCancelCommandReplace })) : null, personalKeyStep === "none" && panelTab === "command" && importStep === "none" && commandStep === "none" ? (_jsx(ReportCommandPanel, { onExecute: handleCommandExecute, onClose: handleCloseCommand, notice: commandNotice, onNoticeClear: () => setCommandNotice(null) })) : null] }) })) }) })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map