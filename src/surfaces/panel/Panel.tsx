import { useEffect, useRef, useState } from "react";
import { panelAnchorSide, placementToCollapsedPanelStyle, usePanelDock } from "@/shared/hooks/usePanelDock.js";
import { PANEL_DEFAULT_WIDTH, usePanelResize, panelSizeToStyle } from "@/shared/hooks/usePanelResize.js";
import { usePanelFeedbackTransfer } from "@/shared/hooks/usePanelFeedbackTransfer.js";
import { useReportData, useReportPreferences, useReportSession } from "@/shared/providers/reportContext.js";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MobilePreviewIcon,
    DevicePreviewIcon,
    EyeOpenIcon,
    LockIcon,
    LogoIcon,
    NotificationActiveIcon,
    NotificationIdleIcon,
    SelectIcon,
    SettingsIcon,
} from "@/shared/components/icons/Icons.js";
import { IconTooltipButton } from "@/surfaces/tooltip/IconTooltipButton.js";
import { HoverTooltip } from "@/surfaces/tooltip/HoverTooltip.js";
import { useIntegrationLock } from "@/shared/components/ui/IntegrationLock.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportCommandPanel } from "./ReportCommandPanel.js";
import { ReportCommandReplaceConfirmDialog } from "./ReportCommandReplaceConfirmDialog.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { ReportImportProjectMismatchDialog } from "./ReportImportProjectMismatchDialog.js";
import { ReportPersonalKeyDialog } from "./ReportPersonalKeyDialog.js";
import { NoticeDialog } from "@/shared/components/ui/NoticeDialog.js";
import { PanelSettings, type PanelSettingsInitialCategory } from "./PanelSettings.js";
import { CornerResizeGhost } from "@/surfaces/window/CornerResizeGhost.js";
import { PanelResizeHandles } from "./PanelResizeHandles.js";
import { PanelStatusBannerStack } from "./PanelStatusBannerStack.js";
import { PanelNetworkFailureBanner } from "./PanelNetworkFailureBanner.js";
import { PanelRoleSwitch } from "./PanelRoleSwitch.js";
import { PanelPresentationSwitch } from "./PanelPresentationSwitch.js";
import { PanelAutoRefreshControl } from "./PanelAutoRefreshControl.js";
import { PanelOnboarding } from "./PanelOnboarding.js";
import { isInsidePreviewGuestFrame } from "@/surfaces/preview/previewGuestFrame.js";
import { PanelKeyGate } from "./PanelKeyGate.js";
import { PanelProjectFooter } from "./PanelProjectFooter.js";
import { createPersonalKeyBackupFilename, downloadPersonalKeyBackup } from "@/shared/utils/feedback/feedbackDataTransfer.js";
import { MOTION, PANEL_TAB_FADE_MS, panelCollapseInClass } from "@/shared/constants/motionClasses.js";
import { PANEL_LAYER_Z_INDEX } from "@/shared/utils/overlay/floatingWindowStack.js";
import type { ReportPanelTab } from "@/shared/types/report-ui.js";
import type { ReportMessages } from "@/shared/i18n/types.js";
import { PanelTabs } from "./PanelTabs.js";
import { PanelContent } from "./PanelContent.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick, messages }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void; messages: ReportMessages }) {
    const hideIcon = anchorSide === "right" ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />;
    const expandIcon = anchorSide === "right" ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />;

    return (
        <HoverTooltip
            label={collapsed ? messages.panel.expand : messages.panel.collapse}
            className="h-full"
        >
            <button
                type="button"
                onClick={onClick}
                aria-expanded={!collapsed}
                aria-label={collapsed ? messages.panel.expand : messages.panel.collapse}
                className={
                    collapsed
                        ? anchorSide === "right"
                            ? "flex h-[105px] w-[32px] items-center justify-center rounded-l-[12px] rounded-r-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                            : "flex h-[105px] w-[32px] items-center justify-center rounded-r-[12px] rounded-l-none bg-[var(--adaptive-black200)] text-[var(--adaptive-blue500)] shadow-[0_0_24px_0_rgba(0,0,0,0.35)]"
                        : "flex items-center justify-center py-[8px] text-[var(--adaptive-text-muted)]"
                }
            >
                {collapsed ? expandIcon : hideIcon}
            </button>
        </HoverTooltip>
    );
}

type PanelProps = {
    /** Render the production panel inside a bounded preview instead of docking it to the viewport. */
    embedded?: boolean;
    /** Initial settings section for embedded previews. */
    embeddedSettingsInitialCategory?: PanelSettingsInitialCategory | null;
};

export function Panel({ embedded = false, embeddedSettingsInitialCategory = null }: PanelProps = {}) {
    const {
        environment,
        projectId,
        appVersion,
        showFeedbackList,
        visiblePanelTabs,
        isMobileViewport,
        panelAppearance,
        setPanelAppearance,
        tooltipAppearance,
        setTooltipAppearance,
        questionThreadDisplay,
        setQuestionThreadDisplay,
        threadLayout,
        setThreadLayout,
        personalKey,
        publicKey,
        panelView,
        messages,
        devicePreviewUiOpen,
        setDevicePreviewUiOpen,
        mobilePreviewUiOpen,
        setMobilePreviewUiOpen,
        integrationCapabilities,
    } = useReportPreferences();
    const {
        mode,
        errorMessage,
        activeReplyReportId,
        panelTab,
        toggleReportMode,
        toggleIssueMode,
        openPanelTab,
        setErrorMessage,
        panelCollapsed,
        setPanelCollapsed,
        notificationUiOpen,
        toggleNotificationUiOpen,
        unreadNotificationCount,
    } = useReportSession();
    const { roleStatItems, canTransferFeedback, refetch } = useReportData();
    const showAutoRefreshControl = integrationCapabilities.persistenceMode !== "localStorage";
    const [personalKeyStep, setPersonalKeyStep] = useState<"none" | "required" | "insert" | "rotate">("none");
    const [personalKeyNotice, setPersonalKeyNotice] = useState("");
    const isRecording = mode === "report";
    const persistenceLock = useIntegrationLock("feedbackPersistence");
    const isIssueMode = mode === "view";
    const isGateView = panelView !== "ready";
    const transferScope = { projectId, environment, appVersion };
    const {
        isDragOver,
        pendingImport,
        importStep,
        pendingCommand,
        commandConflicts,
        commandStep,
        commandNotice,
        setCommandNotice,
        handleExport,
        handleImportFromMenu,
        handleOpenCommand,
        handleCloseCommand,
        handleCommandExecute,
        handleCancelCommandReplace,
        handleConfirmCommandReplace,
        handleCancelImport,
        handleProceedImportAfterMismatch,
        handleApplyImport,
        handleBackupAndApplyImport,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
    } = usePanelFeedbackTransfer({
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
    const [renderedTab, setRenderedTab] = useState<ReportPanelTab | null>(null);
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
    } else if (prevShellMotionKeyRef.current !== shellMotionKey) {
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
        } else if (result === "cancelled") {
            setPersonalKeyNotice(messages.personalKey.backupCancelled);
        } else {
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
        } catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };

    const handlePanelTabClick = (tab: ReportPanelTab) => {
        openPanelTab(tab);
    };

    const handleTogglePanelCollapsed = () => {
        setPanelCollapsed((current) => !current);
    };

    const resolvedPanelStyle = embedded
        ? { position: "relative" as const, inset: "auto", width: PANEL_DEFAULT_WIDTH, maxWidth: "100%" }
        : panelCollapsed && !isRecording
          ? placementToCollapsedPanelStyle({ corner: placementCorner })
          : panelStyle;
    const resolvedSizeStyle = !embedded && panelExpanded ? panelSizeToStyle(panelSize, applyFixedHeight || isGateView) : undefined;

    const panelSideControls = panelExpanded ? (
        <div className="flex shrink-0 flex-col items-center border-l border-l-[var(--adaptive-border-subtle)] h-full">
            <PanelCollapseTab
                collapsed={panelCollapsed}
                anchorSide={anchorSide}
                onClick={handleTogglePanelCollapsed}
                messages={messages}
            />
        </div>
    ) : null;

    const gateBody = panelView === "onboarding" ? <PanelOnboarding /> : panelView === "setup-complete" || panelView === "key-issue" ? <PanelKeyGate mode={panelView} /> : null;

    return (
        <>
            <PanelDockGuides
                visible={!embedded && isDragging}
                activeCorner={activeCorner}
            />

            {!embedded && isResizing ? (
                <CornerResizeGhost
                    ghostRef={ghostRef}
                    zIndexClassName="z-[1001001]"
                />
            ) : null}

            <div
                ref={panelRef}
                data-fp-chrome="panel"
                data-collapsed={panelCollapsed && !isRecording ? "true" : "false"}
                data-dragging={isDragging ? "true" : "false"}
                data-anchor-side={anchorSide}
                data-embedded={embedded ? "true" : undefined}
                onDragEnter={isGateView ? undefined : handleDragEnter}
                onDragLeave={isGateView ? undefined : handleDragLeave}
                onDragOver={isGateView ? undefined : handleDragOver}
                onDrop={isGateView ? undefined : handleDrop}
                className={`pointer-events-auto flex ${MOTION.panelEnter} ${MOTION.panelDock} ${isDragging ? MOTION.panelDockDragging : ""} ${
                    isRecording
                        ? "min-h-[40px] bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[16px] shadow-[var(--adaptive-popup-shadow)]"
                        : panelCollapsed
                          ? ""
                          : "relative overflow-visible bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[16px] shadow-[var(--adaptive-popup-shadow)]"
                }`}
                style={{ ...resolvedPanelStyle, ...resolvedSizeStyle, zIndex: PANEL_LAYER_Z_INDEX }}
            >
                {panelExpanded && !embedded ? (
                    <PanelResizeHandles
                        edges={resizeHandles.edges}
                        inactive={isDragging}
                        heightResizeEnabled={heightResizeEnabled}
                        messages={messages}
                        createResizePointerDown={createResizePointerDown}
                    />
                ) : null}
                <div
                    key={shellMotionKey}
                    className={`${shellMotionClass} ${panelCollapsed && !isRecording ? "flex shrink-0" : `flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden`}`.trim()}
                >
                    {panelCollapsed && !isRecording ? null : (
                        <>
                            <PanelNetworkFailureBanner />
                            <PanelStatusBannerStack />
                        </>
                    )}
                    {isRecording ? (
                        <section className="flex items-center justify-between gap-[16px] px-[12px] py-[8px]">
                            <section className="flex items-center gap-[4px] justify-start shrink-0">
                                <LogoIcon className="w-[94px]" />
                            </section>

                            <button
                                type="button"
                                onClick={toggleReportMode}
                                className="flex items-center shrink-0 bg-[#F6572E] p-[4px_8px] rounded-[6px]"
                            >
                                <p className="text-[14px] font-bold text-[var(--adaptive-black50)]">{messages.panel.stopFeedback}</p>
                            </button>
                        </section>
                    ) : panelCollapsed ? (
                        <PanelCollapseTab
                            collapsed={panelCollapsed}
                            anchorSide={anchorSide}
                            onClick={handleTogglePanelCollapsed}
                            messages={messages}
                        />
                    ) : isGateView ? (
                        <section className="relative flex h-full min-h-0 flex-1 flex-col">
                            <section className="flex shrink-0">
                                {anchorSide === "left" ? panelSideControls : null}

                                <div className="flex flex-1 flex-col">
                                    <section
                                        className="flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)] p-[4px_12px]"
                                        onPointerDown={handleDragHandlePointerDown}
                                    >
                                        <LogoIcon className="w-[94px] shrink-0" />
                                    </section>
                                </div>

                                {anchorSide === "right" ? panelSideControls : null}
                            </section>

                            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{gateBody}</div>
                        </section>
                    ) : (
                        <>
                            <section className={`relative flex min-h-0 min-w-0 flex-col overflow-hidden ${applyFixedHeight || tabShellMounted ? "h-full flex-1" : "shrink-0"}`}>
                                {isDragOver ? (
                                    <div className="pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]">
                                        <p className="text-[14px] font-bold text-[var(--adaptive-blue500)]">{messages.panel.importDragOverlay}</p>
                                    </div>
                                ) : null}

                                <section className="flex shrink-0">
                                    {anchorSide === "left" ? panelSideControls : null}

                                    <div className="flex flex-1 flex-col">
                                        <section
                                            // className="flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)] p-[4px_12px]"
                                            className="flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)]"
                                            onPointerDown={handleDragHandlePointerDown}
                                        >
                                            <section className="flex min-w-0 items-center gap-[4px] py-[4px] pl-[12px]">
                                                <LogoIcon className="w-[94px] shrink-0" />
                                                {showAutoRefreshControl ? <PanelAutoRefreshControl /> : null}
                                            </section>

                                            <section className="flex shrink-0 items-center h-full">
                                                <PanelPresentationSwitch />
                                                {/* <PanelRoleSwitch /> */}

                                                <IconTooltipButton
                                                    label={messages.panel.viewFeedbacks}
                                                    active={isIssueMode}
                                                    onClick={toggleIssueMode}
                                                >
                                                    <EyeOpenIcon className="h-[16px] w-[16px]" />
                                                </IconTooltipButton>

                                                <IconTooltipButton
                                                    label={messages.panel.mobilePreview}
                                                    active={mobilePreviewUiOpen}
                                                    onClick={() => setMobilePreviewUiOpen(!mobilePreviewUiOpen)}
                                                >
                                                    <MobilePreviewIcon className="h-[16px] w-[16px]" />
                                                </IconTooltipButton>

                                                <IconTooltipButton
                                                    label={messages.panel.notifications}
                                                    active={notificationUiOpen}
                                                    onClick={toggleNotificationUiOpen}
                                                >
                                                    {unreadNotificationCount > 0 ? <NotificationActiveIcon className="h-[16px] w-[16px]" /> : <NotificationIdleIcon className="h-[16px] w-[16px]" />}
                                                </IconTooltipButton>

                                                {isInsidePreviewGuestFrame() ? null : (
                                                    <IconTooltipButton
                                                        label={messages.panel.devicePreview}
                                                        active={devicePreviewUiOpen}
                                                        onClick={() => {
                                                            if (mode === "view") {
                                                                toggleIssueMode();
                                                            }

                                                            setDevicePreviewUiOpen(!devicePreviewUiOpen);
                                                        }}
                                                    >
                                                        <DevicePreviewIcon className="h-[16px] w-[16px]" />
                                                    </IconTooltipButton>
                                                )}

                                                <IconTooltipButton
                                                    label={messages.panel.tabSettings}
                                                    active={panelTab === "settings" || panelTab === "command"}
                                                    onClick={() => handlePanelTabClick("settings")}
                                                >
                                                    <SettingsIcon className="h-[16px] w-[16px]" />
                                                </IconTooltipButton>

                                                {/* <IconTooltipButton
                                                    label={messages.panel.resetSizeTitle}
                                                    disabled={isDefaultSize}
                                                    onClick={resetPanelSize}
                                                >
                                                    <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border border-[var(--adaptive-border-subtle)] text-[10px] font-bold leading-none">
                                                        ↺
                                                    </span>
                                                </IconTooltipButton> */}
                                            </section>
                                        </section>

                                        <section className="flex items-center h-full">
                                            <HoverTooltip
                                                label={persistenceLock.locked ? persistenceLock.tooltipLabel : undefined}
                                                multiline={persistenceLock.locked}
                                                disabled={!persistenceLock.locked}
                                                className="h-full"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (persistenceLock.locked) {
                                                            return;
                                                        }
                                                        toggleReportMode();
                                                    }}
                                                    disabled={persistenceLock.locked}
                                                    className="flex flex-col shrink-0 justify-center items-center gap-[4px] p-[0_16px] border-r border-r-[var(--adaptive-border-subtle)] h-full hover:bg-[#f6572d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                                                >
                                                    {persistenceLock.locked ? <LockIcon className="w-[20px] h-[20px]" /> : <SelectIcon className="w-[24px]" />}
                                                </button>
                                            </HoverTooltip>

                                            <section
                                                className="flex flex-col min-w-0 flex-1 px-[16px] py-[8px] gap-[4px]"
                                                aria-label={messages.panel.repositionAriaLabel}
                                                title={messages.panel.repositionTitle}
                                                style={isDragging ? { opacity: 0.8 } : undefined}
                                            >
                                                <p className="text-[12px] text-[var(--adaptive-black500)] font-bold">내 모든 활동</p>

                                                <section className="flex">
                                                    {roleStatItems.map((item) =>
                                                        item.kind === "cta" ? (
                                                            <p
                                                                key={item.key}
                                                                className="flex-1 self-center text-[12px] font-medium text-[var(--adaptive-black600)]"
                                                            >
                                                                {item.display}
                                                            </p>
                                                        ) : (
                                                            <section
                                                                key={item.key}
                                                                className="flex items-start gap-[4px] flex-1"
                                                            >
                                                                <p className="text-[14px] text-[var(--adaptive-black500)]">{item.label}</p>
                                                                <p className="text-[14px] font-semibold text-[var(--adaptive-black900)]">{item.display}개</p>
                                                            </section>
                                                        ),
                                                    )}
                                                </section>
                                            </section>
                                        </section>
                                    </div>

                                    {anchorSide === "right" ? panelSideControls : null}
                                </section>

                                <section className="flex shrink-0 items-stretch border-t border-[var(--adaptive-border-subtle)]">
                                    <PanelTabs
                                        tabs={visiblePanelTabs}
                                        activeTab={panelTab}
                                        messages={messages}
                                        onTabClick={handlePanelTabClick}
                                    />
                                </section>

                                {errorMessage && importStep === "none" && commandStep === "none" && !activeReplyReportId ? (
                                    <NoticeDialog
                                        role="alert"
                                        title={messages.common.noticeTitle}
                                        description={errorMessage}
                                    />
                                ) : null}
                                {personalKeyNotice ? (
                                    <NoticeDialog
                                        role="status"
                                        title={messages.common.noticeTitle}
                                        description={personalKeyNotice}
                                        actions={[
                                            {
                                                id: "dismiss",
                                                label: messages.common.ok,
                                                variant: "primary",
                                                onClick: () => setPersonalKeyNotice(""),
                                            },
                                        ]}
                                    />
                                ) : null}

                                {personalKeyStep !== "none" ? (
                                    <ReportPersonalKeyDialog
                                        mode={personalKeyStep}
                                        onCancel={() => setPersonalKeyStep("none")}
                                        onComplete={(message) => {
                                            setPersonalKeyNotice(message);
                                            setPersonalKeyStep("none");
                                        }}
                                    />
                                ) : null}

                                {personalKeyStep === "none" && importStep === "project-mismatch" && pendingImport ? (
                                    <ReportImportProjectMismatchDialog
                                        currentProject={transferScope}
                                        importedProject={pendingImport.project}
                                        exportedAt={pendingImport.exportedAt}
                                        onProceed={handleProceedImportAfterMismatch}
                                        onCancel={handleCancelImport}
                                    />
                                ) : null}

                                {personalKeyStep === "none" && importStep === "confirm" && pendingImport ? (
                                    <ReportImportConfirmDialog
                                        onApply={handleApplyImport}
                                        onCancel={handleCancelImport}
                                        onBackupAndApply={handleBackupAndApplyImport}
                                    />
                                ) : null}

                                {tabShellMounted ? (
                                    <div
                                        className={`${MOTION.panelTabShell} min-h-[0px] max-h-[min(50dvh,512px)] h-full flex-1`}
                                        data-open={tabShellOpen ? "true" : "false"}
                                    >
                                        <div className={`${MOTION.panelTabShellInner} flex min-h-0 flex-col overflow-hidden`}>
                                            <PanelContent
                                                activeTab={renderedTab}
                                                blocked={commandStep !== "none"}
                                                showFeedbackList={showFeedbackList}
                                                settings={
                                                    <PanelSettings
                                                    transferDisabled={!canTransferFeedback}
                                                    panelAppearance={panelAppearance}
                                                    onPanelAppearanceChange={setPanelAppearance}
                                                    tooltipAppearance={tooltipAppearance}
                                                    onTooltipAppearanceChange={setTooltipAppearance}
                                                    questionThreadDisplay={questionThreadDisplay}
                                                    onQuestionThreadDisplayChange={setQuestionThreadDisplay}
                                                    threadLayout={threadLayout}
                                                    onThreadLayoutChange={setThreadLayout}
                                                    onExport={handleExport}
                                                    onImport={handleImportFromMenu}
                                                    onCommand={handleOpenCommand}
                                                    hasPersonalKey={Boolean(personalKey)}
                                                    onKeyCopy={() => void handleKeyCopy()}
                                                    onPublicKeyCopy={() => void handlePublicKeyCopy()}
                                                    onKeyInsert={() => {
                                                        setPersonalKeyStep("insert");
                                                        setPersonalKeyNotice("");
                                                    }}
                                                    onKeyRotate={() => {
                                                        setPersonalKeyStep("rotate");
                                                        setPersonalKeyNotice("");
                                                    }}
                                                    initialCategory={embeddedSettingsInitialCategory}
                                                    />
                                                }
                                                command={
                                                    <ReportCommandPanel
                                                        onExecute={handleCommandExecute}
                                                        onClose={handleCloseCommand}
                                                        notice={commandNotice}
                                                        onNoticeClear={() => setCommandNotice(null)}
                                                    />
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                {personalKeyStep === "none" && commandStep === "replace-confirm" && pendingCommand ? (
                                    <ReportCommandReplaceConfirmDialog
                                        conflicts={commandConflicts}
                                        onConfirm={handleConfirmCommandReplace}
                                        onCancel={handleCancelCommandReplace}
                                    />
                                ) : null}

                                <PanelProjectFooter />
                            </section>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
