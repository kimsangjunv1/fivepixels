import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { panelAnchorSide, placementToCollapsedPanelStyle, usePanelDock } from "../../shared/hooks/usePanelDock.js";
import { PANEL_DEFAULT_WIDTH, usePanelResize, panelSizeToStyle } from "../../shared/hooks/usePanelResize.js";
import { usePanelFeedbackTransfer } from "../../shared/hooks/usePanelFeedbackTransfer.js";
import { useReportData, useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon, MobilePreviewIcon, DevicePreviewIcon, EyeOpenIcon, LockIcon, LogoIcon, NotificationActiveIcon, NotificationIdleIcon, SelectIcon, SettingsIcon, } from "../../shared/components/icons/Icons.js";
import { IconTooltipButton } from "../../surfaces/tooltip/IconTooltipButton.js";
import { HoverTooltip } from "../../surfaces/tooltip/HoverTooltip.js";
import { useIntegrationLock } from "../../shared/components/ui/IntegrationLock.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportCommandPanel } from "./ReportCommandPanel.js";
import { ReportCommandReplaceConfirmDialog } from "./ReportCommandReplaceConfirmDialog.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { ReportImportProjectMismatchDialog } from "./ReportImportProjectMismatchDialog.js";
import { ReportPersonalKeyDialog } from "./ReportPersonalKeyDialog.js";
import { NoticeDialog } from "../../shared/components/ui/NoticeDialog.js";
import { PanelSettings } from "./PanelSettings.js";
import { CornerResizeGhost } from "../../surfaces/window/CornerResizeGhost.js";
import { PanelResizeHandles } from "./PanelResizeHandles.js";
import { PanelPresentationSwitch } from "./PanelPresentationSwitch.js";
import { PanelAutoRefreshControl } from "./PanelAutoRefreshControl.js";
import { PanelOnboarding } from "./PanelOnboarding.js";
import { isInsidePreviewGuestFrame } from "../../surfaces/preview/previewGuestFrame.js";
import { PanelKeyGate } from "./PanelKeyGate.js";
import { PanelProjectFooter } from "./PanelProjectFooter.js";
import { createPersonalKeyBackupFilename, downloadPersonalKeyBackup } from "../../shared/utils/feedback/feedbackDataTransfer.js";
import { MOTION, PANEL_TAB_FADE_MS, panelCollapseInClass } from "../../shared/constants/motionClasses.js";
import { PANEL_LAYER_Z_INDEX } from "../../shared/utils/overlay/floatingWindowStack.js";
import { PanelTabs } from "./PanelTabs.js";
import { PanelContent } from "./PanelContent.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick, messages }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-4 w-4" }) : _jsx(ChevronLeftIcon, { className: "h-4 w-4" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-4 w-4" }) : _jsx(ChevronRightIcon, { className: "h-4 w-4" });
    return (_jsx(HoverTooltip, { label: collapsed ? messages.panel.expand : messages.panel.collapse, className: "h-full", children: _jsx("button", { type: "button", onClick: onClick, "aria-expanded": !collapsed, "aria-label": collapsed ? messages.panel.expand : messages.panel.collapse, className: collapsed
                ? anchorSide === "right"
                    ? "flex h-[105px] w-[32px] items-center justify-center rounded-l-[12px] rounded-r-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                    : "flex h-[105px] w-[32px] items-center justify-center rounded-r-[12px] rounded-l-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                : "flex items-center justify-center py-[8px] text-[var(--adaptive-text-muted)]", children: collapsed ? expandIcon : hideIcon }) }));
}
export function Panel({ embedded = false, embeddedSettingsInitialCategory = null } = {}) {
    const { environment, projectId, appVersion, showFeedbackList, visiblePanelTabs, isMobileViewport, panelAppearance, setPanelAppearance, tooltipAppearance, setTooltipAppearance, questionThreadDisplay, setQuestionThreadDisplay, threadLayout, setThreadLayout, personalKey, publicKey, panelView, messages, devicePreviewUiOpen, setDevicePreviewUiOpen, mobilePreviewUiOpen, setMobilePreviewUiOpen, integrationCapabilities, } = useReportPreferences();
    const { mode, errorMessage, activeReplyReportId, panelTab, toggleReportMode, toggleIssueMode, openPanelTab, setErrorMessage, panelCollapsed, setPanelCollapsed, notificationUiOpen, toggleNotificationUiOpen, unreadNotificationCount, } = useReportSession();
    const { roleStatItems, canTransferFeedback, refetch } = useReportData();
    const showAutoRefreshControl = integrationCapabilities.persistenceMode !== "localStorage";
    const [personalKeyStep, setPersonalKeyStep] = useState("none");
    const [personalKeyNotice, setPersonalKeyNotice] = useState("");
    const isRecording = mode === "report";
    const persistenceLock = useIntegrationLock("feedbackPersistence");
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
        enabled: !embedded && !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}-${panelTab ?? "none"}-${isIssueMode}-${importStep !== "none" ? "import" : "none"}-${commandStep !== "none" ? "command" : "none"}-${panelView}`,
    });
    const panelExpanded = !panelCollapsed && !isRecording;
    const contentSectionOpen = panelTab !== null && personalKeyStep === "none" && importStep === "none" && !isGateView;
    const desiredTab = contentSectionOpen ? panelTab : null;
    const [renderedTab, setRenderedTab] = useState(null);
    const [tabShellOpen, setTabShellOpen] = useState(false);
    const tabShellMounted = renderedTab !== null;
    const { panelSize, resizeHandles, heightResizeEnabled, createResizePointerDown, resetPanelSize, isDefaultSize, isResizing, ghostRef } = usePanelResize({
        enabled: !embedded && !isMobileViewport && panelExpanded,
        corner: placementCorner,
        heightResizeEnabled: contentSectionOpen || tabShellMounted,
        panelRef,
    });
    const applyFixedHeight = (contentSectionOpen || tabShellMounted) && panelSize.height !== null;
    const anchorSide = panelAnchorSide(placementCorner);
    const shellMotionKey = `${panelCollapsed}-${isRecording}`;
    const prevShellMotionKeyRef = useRef(shellMotionKey);
    const shellMotionClassRef = useRef("");
    const isFirstShellMotionRef = useRef(true);
    if (isFirstShellMotionRef.current) {
        isFirstShellMotionRef.current = false;
    }
    else if (prevShellMotionKeyRef.current !== shellMotionKey) {
        shellMotionClassRef.current = panelCollapsed ? panelCollapseInClass(anchorSide) : MOTION.panelModeSwap;
        prevShellMotionKeyRef.current = shellMotionKey;
    }
    const shellMotionClass = shellMotionClassRef.current;
    useEffect(() => {
        let outerFrameId = 0;
        let innerFrameId = 0;
        const openTabShellAfterPaint = () => {
            // Two frames so the browser paints data-open="false" before expanding.
            outerFrameId = window.requestAnimationFrame(() => {
                innerFrameId = window.requestAnimationFrame(() => setTabShellOpen(true));
            });
        };
        if (desiredTab === renderedTab) {
            if (desiredTab !== null && !tabShellOpen) {
                openTabShellAfterPaint();
                return () => {
                    window.cancelAnimationFrame(outerFrameId);
                    window.cancelAnimationFrame(innerFrameId);
                };
            }
            return;
        }
        if (renderedTab === null && desiredTab !== null) {
            setRenderedTab(desiredTab);
            setTabShellOpen(false);
            return;
        }
        if (desiredTab === null && renderedTab !== null) {
            setTabShellOpen(false);
            const timeoutId = window.setTimeout(() => setRenderedTab(null), PANEL_TAB_FADE_MS);
            return () => window.clearTimeout(timeoutId);
        }
        // Tab-to-tab: swap immediately — no slide/fade/height morph (keeps inner scroll usable).
        if (desiredTab !== null && renderedTab !== null && desiredTab !== renderedTab) {
            setRenderedTab(desiredTab);
        }
    }, [desiredTab, renderedTab, tabShellOpen]);
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
    const resolvedPanelStyle = embedded
        ? { position: "relative", inset: "auto", width: PANEL_DEFAULT_WIDTH, maxWidth: "100%" }
        : panelCollapsed && !isRecording
            ? placementToCollapsedPanelStyle({ corner: placementCorner })
            : panelStyle;
    const resolvedSizeStyle = !embedded && panelExpanded ? panelSizeToStyle(panelSize, applyFixedHeight || isGateView) : undefined;
    const panelSideControls = panelExpanded ? (_jsx("div", { className: "flex shrink-0 flex-col items-center border-l border-l-[var(--adaptive-border-subtle)] h-full", children: _jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: handleTogglePanelCollapsed, messages: messages }) })) : null;
    const gateBody = panelView === "onboarding" ? _jsx(PanelOnboarding, {}) : panelView === "setup-complete" || panelView === "key-issue" ? _jsx(PanelKeyGate, { mode: panelView }) : null;
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: !embedded && isDragging, activeCorner: activeCorner }), !embedded && isResizing ? (_jsx(CornerResizeGhost, { ghostRef: ghostRef, zIndexClassName: "z-[1001001]" })) : null, _jsxs("div", { ref: panelRef, "data-fp-chrome": "panel", "data-collapsed": panelCollapsed && !isRecording ? "true" : "false", "data-dragging": isDragging ? "true" : "false", "data-anchor-side": anchorSide, "data-embedded": embedded ? "true" : undefined, onDragEnter: isGateView ? undefined : handleDragEnter, onDragLeave: isGateView ? undefined : handleDragLeave, onDragOver: isGateView ? undefined : handleDragOver, onDrop: isGateView ? undefined : handleDrop, className: `pointer-events-auto flex ${MOTION.panelEnter} ${MOTION.panelDock} ${isDragging ? MOTION.panelDockDragging : ""} ${isRecording
                    ? "min-h-[40px] bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[16px] shadow-[var(--adaptive-popup-shadow)]"
                    : panelCollapsed
                        ? ""
                        : "relative overflow-visible bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[16px] shadow-[var(--adaptive-popup-shadow)]"}`, style: { ...resolvedPanelStyle, ...resolvedSizeStyle, zIndex: PANEL_LAYER_Z_INDEX }, children: [panelExpanded && !embedded ? (_jsx(PanelResizeHandles, { edges: resizeHandles.edges, inactive: isDragging, heightResizeEnabled: heightResizeEnabled, messages: messages, createResizePointerDown: createResizePointerDown })) : null, _jsx("div", { className: `${shellMotionClass} ${panelCollapsed && !isRecording ? "flex shrink-0" : `flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden`}`.trim(), children: isRecording ? (_jsxs("section", { className: "flex items-center justify-between gap-[16px] px-[12px] py-[8px]", children: [_jsx("section", { className: "flex items-center gap-[4px] justify-start shrink-0", children: _jsx(LogoIcon, { className: "w-[94px]" }) }), _jsx("button", { type: "button", onClick: toggleReportMode, className: "flex items-center shrink-0 bg-[#F6572E] p-[4px_8px] rounded-[6px]", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-black50)]", children: messages.panel.stopFeedback }) })] })) : panelCollapsed ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: handleTogglePanelCollapsed, messages: messages })) : isGateView ? (_jsxs("section", { className: "relative flex h-full min-h-0 flex-1 flex-col", children: [_jsxs("section", { className: "flex shrink-0", children: [anchorSide === "left" ? panelSideControls : null, _jsx("div", { className: "flex flex-1 flex-col", children: _jsx("section", { className: "flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)] p-[4px_12px]", onPointerDown: handleDragHandlePointerDown, children: _jsx(LogoIcon, { className: "w-[94px] shrink-0" }) }) }), anchorSide === "right" ? panelSideControls : null] }), _jsx("div", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto", children: gateBody })] })) : (_jsx(_Fragment, { children: _jsxs("section", { className: `relative flex min-h-0 min-w-0 flex-col overflow-hidden ${applyFixedHeight || tabShellMounted ? "h-full flex-1" : "shrink-0"}`, children: [isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: messages.panel.importDragOverlay }) })) : null, _jsxs("section", { className: "flex shrink-0", children: [anchorSide === "left" ? panelSideControls : null, _jsxs("div", { className: "flex flex-1 flex-col", children: [_jsxs("section", { 
                                                        // className="flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)] p-[4px_12px]"
                                                        className: "flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)]", onPointerDown: handleDragHandlePointerDown, children: [_jsxs("section", { className: "flex min-w-0 items-center gap-[4px] py-[4px] pl-[12px]", children: [_jsx(LogoIcon, { className: "w-[94px] shrink-0" }), showAutoRefreshControl ? _jsx(PanelAutoRefreshControl, {}) : null] }), _jsxs("section", { className: "flex shrink-0 items-center h-full", children: [_jsx(PanelPresentationSwitch, {}), _jsx(IconTooltipButton, { label: messages.panel.viewFeedbacks, active: isIssueMode, onClick: toggleIssueMode, children: _jsx(EyeOpenIcon, { className: "h-[16px] w-[16px]" }) }), _jsx(IconTooltipButton, { label: messages.panel.mobilePreview, active: mobilePreviewUiOpen, onClick: () => setMobilePreviewUiOpen(!mobilePreviewUiOpen), children: _jsx(MobilePreviewIcon, { className: "h-[16px] w-[16px]" }) }), _jsx(IconTooltipButton, { label: notificationUiOpen ? messages.notifications.closeAriaLabel : messages.notifications.openAriaLabel, active: notificationUiOpen, onClick: toggleNotificationUiOpen, children: unreadNotificationCount > 0 ? _jsx(NotificationActiveIcon, { className: "h-[16px] w-[16px]" }) : _jsx(NotificationIdleIcon, { className: "h-[16px] w-[16px]" }) }), isInsidePreviewGuestFrame() ? null : (_jsx(IconTooltipButton, { label: messages.panel.devicePreview, active: devicePreviewUiOpen, onClick: () => {
                                                                            if (mode === "view") {
                                                                                toggleIssueMode();
                                                                            }
                                                                            setDevicePreviewUiOpen(!devicePreviewUiOpen);
                                                                        }, children: _jsx(DevicePreviewIcon, { className: "h-[16px] w-[16px]" }) })), _jsx(IconTooltipButton, { label: messages.panel.tabSettings, active: panelTab === "settings" || panelTab === "command", onClick: () => handlePanelTabClick("settings"), children: _jsx(SettingsIcon, { className: "h-[16px] w-[16px]" }) })] })] }), _jsxs("section", { className: "flex items-center h-full", children: [_jsx(HoverTooltip, { label: persistenceLock.locked ? persistenceLock.tooltipLabel : undefined, multiline: persistenceLock.locked, disabled: !persistenceLock.locked, className: "h-full", children: _jsx("button", { type: "button", onClick: () => {
                                                                        if (persistenceLock.locked) {
                                                                            return;
                                                                        }
                                                                        toggleReportMode();
                                                                    }, disabled: persistenceLock.locked, className: "flex flex-col shrink-0 justify-center items-center gap-[4px] p-[0_16px] border-r border-r-[var(--adaptive-border-subtle)] h-full hover:bg-[#f6572d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent", children: persistenceLock.locked ? _jsx(LockIcon, { className: "w-[20px] h-[20px]" }) : _jsx(SelectIcon, { className: "w-[24px]" }) }) }), _jsxs("section", { className: "flex flex-col min-w-0 flex-1 px-[16px] py-[8px] gap-[4px]", "aria-label": messages.panel.repositionAriaLabel, title: messages.panel.repositionTitle, style: isDragging ? { opacity: 0.8 } : undefined, children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)] font-bold", children: "\uB0B4 \uBAA8\uB4E0 \uD65C\uB3D9" }), _jsx("section", { className: "flex", children: roleStatItems.map((item) => item.kind === "cta" ? (_jsx("p", { className: "flex-1 self-center text-[12px] font-medium text-[var(--adaptive-black600)]", children: item.display }, item.key)) : (_jsxs("section", { className: "flex items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[14px] text-[var(--adaptive-black500)]", children: item.label }), _jsxs("p", { className: "text-[14px] font-semibold text-[var(--adaptive-black900)]", children: [item.display, "\uAC1C"] })] }, item.key))) })] })] })] }), anchorSide === "right" ? panelSideControls : null] }), _jsx("section", { className: "flex shrink-0 items-stretch border-t border-[var(--adaptive-border-subtle)]", children: _jsx(PanelTabs, { tabs: visiblePanelTabs, activeTab: panelTab, messages: messages, onTabClick: handlePanelTabClick }) }), errorMessage && importStep === "none" && commandStep === "none" && !activeReplyReportId ? (_jsx(NoticeDialog, { role: "alert", title: messages.common.noticeTitle, description: errorMessage })) : null, personalKeyNotice ? (_jsx(NoticeDialog, { role: "status", title: messages.common.noticeTitle, description: personalKeyNotice, actions: [
                                            {
                                                id: "dismiss",
                                                label: messages.common.ok,
                                                variant: "primary",
                                                onClick: () => setPersonalKeyNotice(""),
                                            },
                                        ] })) : null, personalKeyStep !== "none" ? (_jsx(ReportPersonalKeyDialog, { mode: personalKeyStep, onCancel: () => setPersonalKeyStep("none"), onComplete: (message) => {
                                            setPersonalKeyNotice(message);
                                            setPersonalKeyStep("none");
                                        } })) : null, personalKeyStep === "none" && importStep === "project-mismatch" && pendingImport ? (_jsx(ReportImportProjectMismatchDialog, { currentProject: transferScope, importedProject: pendingImport.project, exportedAt: pendingImport.exportedAt, onProceed: handleProceedImportAfterMismatch, onCancel: handleCancelImport })) : null, personalKeyStep === "none" && importStep === "confirm" && pendingImport ? (_jsx(ReportImportConfirmDialog, { onApply: handleApplyImport, onCancel: handleCancelImport, onBackupAndApply: handleBackupAndApplyImport })) : null, tabShellMounted ? (_jsx("div", { className: `${MOTION.panelTabShell} min-h-[0px] max-h-[min(50dvh,512px)] h-full flex-1`, "data-open": tabShellOpen ? "true" : "false", children: _jsx("div", { className: `${MOTION.panelTabShellInner} flex min-h-0 flex-col overflow-hidden`, children: _jsx(PanelContent, { activeTab: renderedTab, blocked: commandStep !== "none", showFeedbackList: showFeedbackList, settings: _jsx(PanelSettings, { transferDisabled: !canTransferFeedback, panelAppearance: panelAppearance, onPanelAppearanceChange: setPanelAppearance, tooltipAppearance: tooltipAppearance, onTooltipAppearanceChange: setTooltipAppearance, questionThreadDisplay: questionThreadDisplay, onQuestionThreadDisplayChange: setQuestionThreadDisplay, threadLayout: threadLayout, onThreadLayoutChange: setThreadLayout, onExport: handleExport, onImport: handleImportFromMenu, onCommand: handleOpenCommand, hasPersonalKey: Boolean(personalKey), onKeyCopy: () => void handleKeyCopy(), onPublicKeyCopy: () => void handlePublicKeyCopy(), onKeyInsert: () => {
                                                        setPersonalKeyStep("insert");
                                                        setPersonalKeyNotice("");
                                                    }, onKeyRotate: () => {
                                                        setPersonalKeyStep("rotate");
                                                        setPersonalKeyNotice("");
                                                    }, initialCategory: embeddedSettingsInitialCategory }), command: _jsx(ReportCommandPanel, { onExecute: handleCommandExecute, onClose: handleCloseCommand, notice: commandNotice, onNoticeClear: () => setCommandNotice(null) }) }) }) })) : null, personalKeyStep === "none" && commandStep === "replace-confirm" && pendingCommand ? (_jsx(ReportCommandReplaceConfirmDialog, { conflicts: commandConflicts, onConfirm: handleConfirmCommandReplace, onCancel: handleCancelCommandReplace })) : null, _jsx(PanelProjectFooter, {})] }) })) }, shellMotionKey)] })] }));
}
//# sourceMappingURL=Panel.js.map