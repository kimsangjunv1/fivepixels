import { useState } from "react";
import { panelAnchorSide, usePanelDock } from "@/hooks/usePanelDock.js";
import { usePanelFeedbackTransfer } from "@/hooks/usePanelFeedbackTransfer.js";
import { useReport } from "@/providers/reportContext.js";
import { SelectIcon } from "@/components/icons/SelectIcon.js";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/ChevronIcon.js";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { ReportCommandPanel } from "./ReportCommandPanel.js";
import { ReportCommandReplaceConfirmDialog } from "./ReportCommandReplaceConfirmDialog.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { ReportImportProjectMismatchDialog } from "./ReportImportProjectMismatchDialog.js";
import { PanelMoreMenu } from "./PanelMoreMenu.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { LogoIcon } from "@/components/icons/LogoIcon.js";
import { motion } from "@/components/motion/index.js";
import { formatStatCount } from "@/utils/formatStatCount.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import type { ReportPanelTab } from "@/types/report-ui.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick, messages }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void; messages: ReturnType<typeof useReport>["messages"] }) {
    const hideIcon =
        anchorSide === "right" ? <ChevronRightIcon className="h-3 w-3 text-[var(--adaptive-text-muted)]" /> : <ChevronLeftIcon className="h-3 w-3 text-[var(--adaptive-text-muted)]" />;
    const expandIcon =
        anchorSide === "right" ? <ChevronLeftIcon className="h-3 w-3 text-[var(--adaptive-text-muted)]" /> : <ChevronRightIcon className="h-3 w-3 text-[var(--adaptive-text-muted)]" />;

    return (
        <button
            type="button"
            onClick={onClick}
            className=""
            aria-expanded={!collapsed}
            aria-label={collapsed ? messages.panel.expand : messages.panel.collapse}
            title={collapsed ? messages.panel.expand : messages.panel.collapse}
        >
            {collapsed ? expandIcon : hideIcon}
        </button>
    );
}

function PanelTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[2px] ${active ? "bg-[var(--adaptive-black100)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}`}
        >
            <p className="text-[var(--adaptive-black800)] font-[500]">{label}</p>

            <ChevronDownIcon className={`h-4 w-4 transition-transform ${active ? "rotate-180" : ""}`} />
        </button>
    );
}

function EnvironmentBadge({ environment }: { environment?: string }) {
    if (!environment) {
        return null;
    }

    return (
        <span className="inline-flex items-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[4px] py-[2px]">
            <span className="text-[12px] text-[var(--adaptive-black500)]">{environment}</span>
            <span
                className="inline-flex h-[4px] w-[4px] rounded-full bg-[var(--adaptive-green500)]"
                aria-hidden
            />
        </span>
    );
}

const RECORDING_STATUS_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 4px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(0,0,0,0.75))";

export function ReportControlPanel() {
    const {
        mode,
        targetStats,
        statusText,
        errorMessage,
        environment,
        projectId,
        appVersion,
        showFeedbackList,
        showTargetPreview,
        isMobileViewport,
        panelTab,
        appearance,
        setAppearance,
        canTransferFeedback,
        messages,
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        openPanelTab,
        setErrorMessage,
        refetch,
    } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [viewMenuOpen, setViewMenuOpen] = useState(false);
    const isRecording = mode === "report";
    const isIssueMode = mode === "view";
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
        onMoreMenuClose: () => setMoreMenuOpen(false),
        isRecording,
    });
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}-${panelTab ?? "none"}-${isIssueMode}-${importStep !== "none" ? "import" : "none"}-${commandStep !== "none" ? "command" : "none"}`,
    });
    const anchorSide = panelAnchorSide(placementCorner);

    const handlePanelTabClick = (tab: ReportPanelTab) => {
        openPanelTab(tab);
    };

    return (
        <>
            <PanelDockGuides
                visible={isDragging}
                activeCorner={activeCorner}
            />

            {/* 임시 주석 */}
            {/* {isRecording && statusText ? (
                <div
                    className="pointer-events-none fixed bottom-[52px] left-0 right-0 z-[1000000] flex flex-col items-center gap-[4px] px-4 text-center text-white"
                    style={{ filter: RECORDING_STATUS_SHADOW }}
                >
                    {statusText.split("\n").map((line, index) => (
                        <p
                            key={`${index}-${line}`}
                            className={index === 0 ? "text-[12px] font-medium" : "text-[18px] font-bold"}
                        >
                            {line}
                        </p>
                    ))}
                </div>
            ) : null} */}

            <motion.div
                ref={panelRef}
                transition={{ duration: 0.25, ease: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`pointer-events-auto fixed z-[1000000] bg-[var(--adaptive-surface-overlay)] backdrop-blur-[50px] rounded-[24px] shadow-[0_0_120px_0_var(--adaptive-blackOpacity500)] flex ${isRecording ? "min-h-[40px] p-[4px]" : "max-h-[80vh] max-w-[calc(100svw-(16px*2))]"}`}
                style={{ ...panelStyle, fontSize: "14px" }}
            >
                <motion.div className="flex min-w-0 flex-1 flex-col w-full">
                    {isRecording ? (
                        <section className="flex items-center justify-between gap-[16px] px-[12px] py-[8px]">
                            <section className="flex items-center gap-[4px] justify-start shrink-0">
                                <LogoIcon className="w-[16px]" />
                                <p className="text-[var(--adaptive-black900)] text-[14px]">Stitchable°</p>
                            </section>

                            <button
                                type="button"
                                onClick={toggleReportMode}
                                className="flex items-center shrink-0"
                            >
                                <p className="text-[14px] font-bold text-[var(--adaptive-blue500)]">{messages.panel.stopFeedback}</p>
                            </button>
                        </section>
                    ) : (
                        <>
                            {!panelCollapsed ? (
                                <section className="relative flex min-w-0 flex-1 flex-col">
                                    {isDragOver ? (
                                        <div className="pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]">
                                            <p className="text-[14px] font-bold text-[var(--adaptive-blue500)]">{messages.panel.importDragOverlay}</p>
                                        </div>
                                    ) : null}

                                    <section className="flex">
                                        {anchorSide === "left" ? (
                                            <PanelCollapseTab
                                                collapsed={panelCollapsed}
                                                anchorSide={anchorSide}
                                                onClick={() => setPanelCollapsed((current) => !current)}
                                                messages={messages}
                                            />
                                        ) : null}

                                        <div className="flex flex-col gap-[8px] p-[8px_0_8px_12px] flex-1">
                                            <section className="flex items-center justify-between gap-[8px]">
                                                <section className="flex min-w-0 items-center gap-[4px]">
                                                    <LogoIcon className="w-[16px] shrink-0" />
                                                    <p className="shrink-0 text-[var(--adaptive-black900)] font-[700] text-[14px] select-none">Stitchable°</p>
                                                    <EnvironmentBadge environment={environment} />
                                                </section>

                                                <section className="flex shrink-0 items-center">
                                                    <button
                                                        type="button"
                                                        onClick={toggleReportMode}
                                                        className="flex items-center gap-[4px] rounded-l-[8px] bg-[var(--adaptive-surface-inverse)] p-[0_8px]"
                                                    >
                                                        <SelectIcon className="w-[16px]" />
                                                        <p className="text-[12px] text-[var(--adaptive-text-inverse)]">{messages.panel.addFeedback}</p>
                                                    </button>

                                                    <PanelDropdownMenu
                                                        open={viewMenuOpen}
                                                        onClose={() => setViewMenuOpen(false)}
                                                        menuClassName="min-w-[200px]"
                                                        trigger={
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewMenuOpen((current) => !current)}
                                                                aria-expanded={viewMenuOpen}
                                                                aria-haspopup="menu"
                                                                aria-label={messages.panel.viewOptionsAriaLabel}
                                                                className="flex items-center rounded-r-[8px] border-l border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-inverse)] p-[2px_8px] h-[24px]"
                                                            >
                                                                <ChevronDownIcon className={`h-4 w-4 text-[var(--adaptive-text-inverse)] transition-transform ${viewMenuOpen ? "rotate-180" : ""}`} />
                                                            </button>
                                                        }
                                                    >
                                                        <PanelDropdownMenuItem
                                                            active={showTargetPreview}
                                                            disabled={mode !== "idle"}
                                                            onClick={() => {
                                                                setViewMenuOpen(false);
                                                                toggleTargetPreview();
                                                            }}
                                                        >
                                                            {messages.panel.viewSelectableElements}
                                                        </PanelDropdownMenuItem>
                                                        <PanelDropdownMenuItem
                                                            active={isIssueMode}
                                                            onClick={() => {
                                                                setViewMenuOpen(false);
                                                                toggleIssueMode();
                                                            }}
                                                        >
                                                            {messages.panel.viewFeedbacks}
                                                        </PanelDropdownMenuItem>
                                                    </PanelDropdownMenu>
                                                </section>
                                            </section>

                                            <section className="flex gap-[12px]">
                                                <section
                                                    className="flex cursor-move flex-1"
                                                    onPointerDown={handleDragHandlePointerDown}
                                                    aria-label={messages.panel.repositionAriaLabel}
                                                    title={messages.panel.repositionTitle}
                                                    style={isDragging ? { opacity: 0.8 } : undefined}
                                                >
                                                    <section className="flex flex-col items-start gap-[4px] flex-1">
                                                        <p className="text-[12px] text-[var(--adaptive-black500)]">{messages.panel.statsFound}</p>
                                                        <p className={`text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.found)}</p>
                                                    </section>

                                                    <section className="flex flex-col items-start gap-[4px] flex-1">
                                                        <p className="text-[12px] text-[var(--adaptive-black500)]">{messages.panel.statsGroup}</p>
                                                        <p className={`text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.group)}</p>
                                                    </section>

                                                    <section className="flex flex-col items-start gap-[4px] flex-1">
                                                        <p className="text-[12px] text-[var(--adaptive-black500)]">{messages.panel.statsItem}</p>
                                                        <p className={`text-[14px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.item)}</p>
                                                    </section>
                                                </section>
                                            </section>
                                        </div>

                                        {anchorSide === "right" ? (
                                            <PanelCollapseTab
                                                collapsed={panelCollapsed}
                                                anchorSide={anchorSide}
                                                onClick={() => setPanelCollapsed((current) => !current)}
                                                messages={messages}
                                            />
                                        ) : null}
                                    </section>

                                    <section className="flex items-stretch border-t border-[var(--adaptive-border-subtle)]">
                                        <div className="flex min-w-0 flex-1 overflow-hidden">
                                            <PanelTabButton
                                                label={messages.panel.tabPageDetails}
                                                active={panelTab === "route-details"}
                                                onClick={() => handlePanelTabClick("route-details")}
                                            />
                                            <div className="h-full w-[1px] bg-[var(--adaptive-border-subtle)]" />
                                            {showFeedbackList ? (
                                                <PanelTabButton
                                                    label={messages.panel.tabFeedbackList}
                                                    active={panelTab === "feedback-list"}
                                                    onClick={() => handlePanelTabClick("feedback-list")}
                                                />
                                            ) : null}
                                        </div>
                                        <div className="h-full w-[1px] bg-[var(--adaptive-border-subtle)]" />

                                        <PanelMoreMenu
                                            open={moreMenuOpen}
                                            disabled={!canTransferFeedback}
                                            appearance={appearance}
                                            onAppearanceChange={setAppearance}
                                            onToggle={() => setMoreMenuOpen((current) => !current)}
                                            onClose={() => setMoreMenuOpen(false)}
                                            onExport={handleExport}
                                            onImport={handleImportFromMenu}
                                            onCommand={handleOpenCommand}
                                        />
                                    </section>

                                    {errorMessage && importStep === "none" && commandStep === "none" ? <p className="px-[8px] text-[12px] text-rose-700">{errorMessage}</p> : null}

                                    {importStep === "project-mismatch" && pendingImport ? (
                                        <ReportImportProjectMismatchDialog
                                            currentProject={transferScope}
                                            importedProject={pendingImport.project}
                                            exportedAt={pendingImport.exportedAt}
                                            onProceed={handleProceedImportAfterMismatch}
                                            onCancel={handleCancelImport}
                                        />
                                    ) : null}

                                    {importStep === "confirm" && pendingImport ? (
                                        <ReportImportConfirmDialog
                                            onApply={handleApplyImport}
                                            onCancel={handleCancelImport}
                                            onBackupAndApply={handleBackupAndApplyImport}
                                        />
                                    ) : null}

                                    {panelTab === "route-details" && importStep === "none" && commandStep === "none" ? <ReportRouteDetails /> : null}

                                    {panelTab === "feedback-list" && showFeedbackList && importStep === "none" && commandStep === "none" ? <ReportFeedbackList /> : null}

                                    {commandStep === "replace-confirm" && pendingCommand ? (
                                        <ReportCommandReplaceConfirmDialog
                                            conflicts={commandConflicts}
                                            onConfirm={handleConfirmCommandReplace}
                                            onCancel={handleCancelCommandReplace}
                                        />
                                    ) : null}

                                    {panelTab === "command" && importStep === "none" && commandStep === "none" ? (
                                        <ReportCommandPanel
                                            onExecute={handleCommandExecute}
                                            onClose={handleCloseCommand}
                                            notice={commandNotice}
                                            onNoticeClear={() => setCommandNotice(null)}
                                        />
                                    ) : null}
                                </section>
                            ) : null}
                        </>
                    )}
                </motion.div>
            </motion.div>
        </>
    );
}
