import { useState } from "react";
import { panelAnchorSide, placementToCollapsedPanelStyle, usePanelDock } from "@/hooks/usePanelDock.js";
import { usePanelResize, panelSizeToStyle } from "@/hooks/usePanelResize.js";
import { usePanelFeedbackTransfer } from "@/hooks/usePanelFeedbackTransfer.js";
import { useReport } from "@/providers/reportContext.js";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EyeOpenIcon, LogoIcon, SelectIcon, SettingsIcon } from "@/components/icons/Icons.js";
import { IconTooltipButton } from "@/components/ui/IconTooltipButton.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
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
import { CornerResizeGhost } from "@/components/ui/CornerResizeGhost.js";
import { CornerResizeHandle } from "@/components/ui/CornerResizeHandle.js";
import { ProbeEditModeBanner } from "./ProbeEditModeBanner.js";
import { PanelRoleSwitch } from "./PanelRoleSwitch.js";
import { PanelPresentationSwitch } from "./PanelPresentationSwitch.js";
import { PanelOnboarding } from "./PanelOnboarding.js";
import { PanelKeyGate } from "./PanelKeyGate.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import { createPersonalKeyBackupFilename, downloadPersonalKeyBackup } from "@/utils/feedbackDataTransfer.js";
import type { ReportPanelTab } from "@/types/report-ui.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick, messages }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void; messages: ReturnType<typeof useReport>["messages"] }) {
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

function PanelTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[2px] hover:bg-[var(--adaptive-black200)] ${active ? "bg-[var(--adaptive-black50)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}`}
        >
            <p className="font-[500] text-[var(--adaptive-black500)]">{label}</p>

            <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${active ? "rotate-180" : ""}`} />
        </button>
    );
}

export function ReportControlPanel() {
    const {
        mode,
        roleStatItems,
        errorMessage,
        environment,
        projectId,
        appVersion,
        activeReplyReportId,
        showFeedbackList,
        isMobileViewport,
        panelTab,
        panelAppearance,
        setPanelAppearance,
        tooltipAppearance,
        setTooltipAppearance,
        questionThreadDisplay,
        setQuestionThreadDisplay,
        canTransferFeedback,
        personalKey,
        publicKey,
        panelView,
        messages,
        toggleReportMode,
        toggleIssueMode,
        openPanelTab,
        setErrorMessage,
        refetch,
        panelCollapsed,
        setPanelCollapsed,
    } = useReport();
    const [personalKeyStep, setPersonalKeyStep] = useState<"none" | "required" | "insert" | "rotate">("none");
    const [personalKeyNotice, setPersonalKeyNotice] = useState("");
    const isRecording = mode === "report";
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

    const resolvedPanelStyle = panelCollapsed && !isRecording ? placementToCollapsedPanelStyle({ corner: placementCorner }) : panelStyle;
    const resolvedSizeStyle = panelExpanded ? panelSizeToStyle(panelSize, applyFixedHeight || isGateView) : undefined;

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

    const gateBody =
        panelView === "onboarding" ? (
            <PanelOnboarding />
        ) : panelView === "setup-complete" || panelView === "key-issue" ? (
            <PanelKeyGate mode={panelView} />
        ) : null;

    return (
        <>
            <PanelDockGuides
                visible={isDragging}
                activeCorner={activeCorner}
            />

            {isResizing ? (
                <CornerResizeGhost
                    ghostRef={ghostRef}
                    zIndexClassName="z-[1000001]"
                />
            ) : null}

            <div
                ref={panelRef}
                onDragEnter={isGateView ? undefined : handleDragEnter}
                onDragLeave={isGateView ? undefined : handleDragLeave}
                onDragOver={isGateView ? undefined : handleDragOver}
                onDrop={isGateView ? undefined : handleDrop}
                className={`pointer-events-auto z-[1000000] flex ${
                    isRecording
                        ? "min-h-[40px] bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[12px] shadow-[0_0_120px_0_var(--adaptive-black500)]"
                        : panelCollapsed
                          ? ""
                          : "relative bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[10px] rounded-[12px] border-0 shadow-[0_0_120px_0_var(--adaptive-black500)]"
                }`}
                style={{ ...resolvedPanelStyle, ...resolvedSizeStyle }}
            >
                {panelExpanded ? (
                    <CornerResizeHandle
                        corner={resizeCorner}
                        ariaLabel={messages.panel.resizeAriaLabel}
                        inactive={isDragging}
                        onPointerDown={handleResizePointerDown}
                    />
                ) : null}
                <div className={panelCollapsed && !isRecording ? "flex shrink-0" : `flex w-full min-w-0 flex-col ${applyFixedHeight || isGateView ? "h-full min-h-0" : ""}`}>
                    {panelCollapsed && !isRecording ? null : <ProbeEditModeBanner />}
                    {isRecording ? (
                        <section className="flex items-center justify-between gap-[16px] px-[12px] py-[8px]">
                            <section className="flex items-center gap-[4px] justify-start shrink-0">
                                <LogoIcon className="w-[94px]" />
                            </section>

                            <button
                                type="button"
                                onClick={toggleReportMode}
                                className="flex items-center shrink-0"
                            >
                                <p className="text-[14px] font-bold text-[var(--adaptive-blue500)]">{messages.panel.stopFeedback}</p>
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
                            <section className={`relative flex min-w-0 flex-col ${applyFixedHeight ? "h-full min-h-0 flex-1" : "shrink-0"}`}>
                                {isDragOver ? (
                                    <div className="pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]">
                                        <p className="text-[14px] font-bold text-[var(--adaptive-blue500)]">{messages.panel.importDragOverlay}</p>
                                    </div>
                                ) : null}

                                <section className="flex shrink-0">
                                    {anchorSide === "left" ? panelSideControls : null}

                                    <div className="flex flex-1 flex-col">
                                        <section
                                            className="flex items-center justify-between gap-[8px] cursor-move border-b border-b-[var(--adaptive-border-subtle)] p-[4px_12px]"
                                            onPointerDown={handleDragHandlePointerDown}
                                        >
                                            <section className="flex min-w-0 items-center gap-[4px]">
                                                <LogoIcon className="w-[94px] shrink-0" />
                                            </section>

                                            <section className="flex shrink-0 items-center gap-[4px]">
                                                <PanelPresentationSwitch />
                                                <PanelRoleSwitch />

                                                <IconTooltipButton
                                                    label={messages.panel.viewFeedbacks}
                                                    active={isIssueMode}
                                                    onClick={toggleIssueMode}
                                                >
                                                    <EyeOpenIcon className="h-[16px] w-[16px]" />
                                                </IconTooltipButton>

                                                <IconTooltipButton
                                                    label={messages.panel.tabSettings}
                                                    active={panelTab === "settings" || panelTab === "command"}
                                                    onClick={() => handlePanelTabClick("settings")}
                                                >
                                                    <SettingsIcon className="h-[16px] w-[16px]" />
                                                </IconTooltipButton>

                                                <IconTooltipButton
                                                    label={messages.panel.resetSizeTitle}
                                                    disabled={isDefaultSize}
                                                    onClick={resetPanelSize}
                                                >
                                                    <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border border-[var(--adaptive-border-subtle)] text-[10px] font-bold leading-none">
                                                        ↺
                                                    </span>
                                                </IconTooltipButton>
                                            </section>
                                        </section>

                                        <section className="flex items-center h-full">
                                            <button
                                                type="button"
                                                onClick={toggleReportMode}
                                                className="flex flex-col shrink-0 justify-center items-center gap-[4px] p-[0_16px] border-r border-r-[var(--adaptive-border-subtle)] h-full hover:bg-[#f6572d]"
                                            >
                                                <SelectIcon className="w-[24px]" />
                                            </button>

                                            <section
                                                className="flex min-w-0 flex-1 px-[16px] py-[8px]"
                                                aria-label={messages.panel.repositionAriaLabel}
                                                title={messages.panel.repositionTitle}
                                                style={isDragging ? { opacity: 0.8 } : undefined}
                                            >
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
                                                            className="flex flex-col items-start gap-[4px] flex-1"
                                                        >
                                                            <p className="text-[12px] text-[var(--adaptive-black500)]">{item.label}</p>
                                                            <p className={`text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{item.display}</p>
                                                        </section>
                                                    ),
                                                )}
                                            </section>
                                        </section>
                                    </div>

                                    {anchorSide === "right" ? panelSideControls : null}
                                </section>

                                <section className="flex shrink-0 items-stretch border-t border-[var(--adaptive-border-subtle)]">
                                    <div className="flex min-w-0 flex-1 overflow-hidden border-b border-b-[var(--adaptive-border-subtle)]">
                                        <PanelTabButton
                                            label={messages.panel.tabThisPage}
                                            active={panelTab === "route-details"}
                                            onClick={() => handlePanelTabClick("route-details")}
                                        />
                                        <div className="h-full w-[1px] bg-[var(--adaptive-border-subtle)]" />
                                        {showFeedbackList ? (
                                            <>
                                                <PanelTabButton
                                                    label={messages.panel.tabFeedbackList}
                                                    active={panelTab === "feedback-list"}
                                                    onClick={() => handlePanelTabClick("feedback-list")}
                                                />
                                                <div className="h-full w-[1px] bg-[var(--adaptive-border-subtle)]" />
                                            </>
                                        ) : null}
                                        <PanelTabButton
                                            label={messages.panel.tabDiagnostics}
                                            active={panelTab === "diagnostics"}
                                            onClick={() => handlePanelTabClick("diagnostics")}
                                        />
                                        <div className="h-full w-[1px] bg-[var(--adaptive-border-subtle)]" />
                                    </div>
                                </section>

                                {errorMessage && importStep === "none" && commandStep === "none" && !activeReplyReportId ? <p className="px-[8px] text-[12px] text-rose-700">{errorMessage}</p> : null}
                                {personalKeyNotice ? <p className="px-[8px] py-[4px] text-[12px] text-[var(--adaptive-green500)]">{personalKeyNotice}</p> : null}

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

                                {contentSectionOpen ? (
                                    <div className={applyFixedHeight ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "flex flex-col"}>
                                        {panelTab === "overview" && commandStep === "none" ? <ReportOverview /> : null}

                                        {panelTab === "route-details" && commandStep === "none" ? <ReportRouteDetails /> : null}

                                        {panelTab === "feedback-list" && showFeedbackList && commandStep === "none" ? <ReportFeedbackList /> : null}
                                        {panelTab === "diagnostics" && commandStep === "none" ? <ReportAuthDiagnostics /> : null}

                                        {panelTab === "settings" && commandStep === "none" ? (
                                            <PanelSettings
                                                transferDisabled={!canTransferFeedback}
                                                panelAppearance={panelAppearance}
                                                onPanelAppearanceChange={setPanelAppearance}
                                                tooltipAppearance={tooltipAppearance}
                                                onTooltipAppearanceChange={setTooltipAppearance}
                                                questionThreadDisplay={questionThreadDisplay}
                                                onQuestionThreadDisplayChange={setQuestionThreadDisplay}
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
                                            />
                                        ) : null}

                                        {panelTab === "command" && commandStep === "none" ? (
                                            <ReportCommandPanel
                                                onExecute={handleCommandExecute}
                                                onClose={handleCloseCommand}
                                                notice={commandNotice}
                                                onNoticeClear={() => setCommandNotice(null)}
                                            />
                                        ) : null}
                                    </div>
                                ) : null}

                                {personalKeyStep === "none" && commandStep === "replace-confirm" && pendingCommand ? (
                                    <ReportCommandReplaceConfirmDialog
                                        conflicts={commandConflicts}
                                        onConfirm={handleConfirmCommandReplace}
                                        onCancel={handleCancelCommandReplace}
                                    />
                                ) : null}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
