import { useCallback, useRef, useState, type DragEvent } from "react";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { PanelMoreMenu } from "./PanelMoreMenu.js";
import { LogoIcon } from "./../icons/LogoIcon.js";
import { motion } from "../motion/index.js";
import { formatStatCount } from "../../utils/formatStatCount.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import type { ReportPanelTab } from "../../types/report-ui.js";
import type { ReportFeedback } from "../../types/report.js";
import { createFeedbackBackupFilename, downloadFeedbackJson, pickFeedbackJsonFile, readAllFeedback, readFeedbackJsonFile, writeAllFeedback } from "../../utils/feedbackDataTransfer.js";

const RECORDING_STATUS_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 4px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(0,0,0,0.75))";

function PanelCollapseTab({ collapsed, anchorSide, onClick }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void }) {
    const hideIcon = anchorSide === "right" ? <ChevronRightIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" /> : <ChevronLeftIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" />;
    const expandIcon =
        anchorSide === "right" ? <ChevronLeftIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" /> : <ChevronRightIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" />;

    return (
        <button
            type="button"
            onClick={onClick}
            className=""
            aria-expanded={!collapsed}
            aria-label={collapsed ? "패널 펼치기" : "패널 숨기기"}
            title={collapsed ? "패널 펼치기" : "패널 숨기기"}
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
            className={`flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[4px] ${active ? "bg-[var(--adaptive-black50)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}`}
        >
            <p className="text-[var(--adaptive-black500)] font-[500]">{label}</p>

            <ChevronDownIcon className={`h-4 w-4 transition-transform ${active ? "rotate-180" : ""}`} />
        </button>
    );
}

function EnvironmentBadge({ environment }: { environment?: string }) {
    if (!environment) {
        return null;
    }

    return (
        <span className="inline-flex items-center gap-[4px] rounded-full border border-[var(--adaptive-black300)] bg-[var(--adaptive-black50)] px-[4px] py-[2px]">
            <span className="text-[12px] text-[var(--adaptive-black500)]">{environment}</span>
            <span
                className="inline-flex h-[4px] w-[4px] rounded-full bg-[var(--adaptive-green500)]"
                aria-hidden
            />
        </span>
    );
}

function isJsonDragEvent(event: DragEvent) {
    const types = Array.from(event.dataTransfer.types);

    return types.includes("Files") || types.includes("application/json");
}

function isJsonFile(file: File) {
    return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}

export function ReportControlPanel() {
    const {
        mode,
        targetStats,
        statusText,
        errorMessage,
        environment,
        projectId,
        showFeedbackList,
        showTargetPreview,
        isMobileViewport,
        panelTab,
        canTransferFeedback,
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        openPanelTab,
        setErrorMessage,
        refetch,
    } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [pendingImport, setPendingImport] = useState<ReportFeedback[] | null>(null);
    const dragDepthRef = useRef(0);
    const isRecording = mode === "report";
    const isIssueMode = mode === "view";
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}-${panelTab ?? "none"}-${isIssueMode}-${pendingImport ? "import" : "none"}`,
    });
    const anchorSide = panelAnchorSide(placementCorner);
    const transferScope = { projectId, environment };

    const handlePanelTabClick = (tab: ReportPanelTab) => {
        if (tab === "feedback-list" && isIssueMode) {
            toggleIssueMode();
        }

        openPanelTab(tab);
    };

    const queueImport = useCallback(
        (items: ReportFeedback[]) => {
            setMoreMenuOpen(false);
            setPendingImport(items);
            setErrorMessage("");
        },
        [setErrorMessage],
    );

    const handleImportFile = useCallback(
        async (file: File) => {
            if (!canTransferFeedback) {
                setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
                return;
            }

            try {
                const items = await readFeedbackJsonFile(file);
                queueImport(items);
            } catch (nextError) {
                setErrorMessage(nextError instanceof Error ? nextError.message : "JSON import에 실패했어요.");
            }
        },
        [canTransferFeedback, queueImport, setErrorMessage],
    );

    const handleExport = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
            return;
        }

        setMoreMenuOpen(false);
        const items = readAllFeedback(transferScope);

        void downloadFeedbackJson(createFeedbackBackupFilename(projectId, environment), items).then((result) => {
            if (result === "failed") {
                setErrorMessage("JSON export에 실패했어요. 브라우저 다운로드 권한을 확인해주세요.");
                return;
            }

            if (result === "cancelled") {
                return;
            }

            setErrorMessage("");
        });
    }, [canTransferFeedback, environment, projectId, setErrorMessage, transferScope]);

    const handleImportFromMenu = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
            return;
        }

        setMoreMenuOpen(false);

        void pickFeedbackJsonFile()
            .then((file) => {
                if (!file) {
                    return;
                }

                return handleImportFile(file);
            })
            .catch((error) => {
                setErrorMessage(error instanceof Error ? error.message : "JSON import에 실패했어요.");
            });
    }, [canTransferFeedback, handleImportFile, setErrorMessage]);

    const applyImport = useCallback(
        async (items: ReportFeedback[]) => {
            writeAllFeedback(transferScope, items);
            setPendingImport(null);
            await refetch();
        },
        [refetch, transferScope],
    );

    const handleCancelImport = () => {
        setPendingImport(null);
    };

    const handleApplyImport = () => {
        if (!pendingImport) {
            return;
        }

        void applyImport(pendingImport);
    };

    const handleBackupAndApplyImport = () => {
        if (!pendingImport) {
            return;
        }

        const currentItems = readAllFeedback(transferScope);
        const pending = pendingImport;

        void downloadFeedbackJson(createFeedbackBackupFilename(projectId, environment), currentItems).then((result) => {
            if (result === "cancelled" || result === "failed") {
                if (result === "failed") {
                    setErrorMessage("백업 export에 실패해서 import를 중단했어요.");
                }

                return;
            }

            void applyImport(pending);
        });
    };

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
        if (isRecording || !canTransferFeedback || pendingImport) {
            return;
        }

        if (!isJsonDragEvent(event)) {
            return;
        }

        event.preventDefault();
        dragDepthRef.current += 1;
        setIsDragOver(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (isRecording || !canTransferFeedback) {
            return;
        }

        event.preventDefault();
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

        if (dragDepthRef.current === 0) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (isRecording || !canTransferFeedback || pendingImport) {
            return;
        }

        if (!isJsonDragEvent(event)) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        if (isRecording || !canTransferFeedback) {
            return;
        }

        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDragOver(false);

        const file = Array.from(event.dataTransfer.files).find(isJsonFile);

        if (!file) {
            setErrorMessage("JSON 파일만 import할 수 있어요.");
            return;
        }

        void handleImportFile(file);
    };

    return (
        <>
            <PanelDockGuides
                visible={isDragging}
                activeCorner={activeCorner}
            />

            {isRecording && statusText ? (
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
            ) : null}

            <motion.div
                ref={panelRef}
                layout
                layoutId="asdwsww"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`pointer-events-auto fixed z-[1000000] overflow-hidden rounded-[24px] shadow-[0_0_120px_0_var(--adaptive-blackOpacity500)] flex ${isRecording ? "min-h-[40px] p-[4px]" : "max-h-[80vh] min-h-[40px] max-w-[375px]"}`}
                style={{ ...panelStyle, fontSize: "14px" }}
            >
                {isRecording ? (
                    <section className="flex items-center justify-between gap-[16px] px-[12px] py-[8px]">
                        <section className="flex items-center gap-[4px] justify-start shrink-0">
                            <LogoIcon className="w-[18px]" />
                            <p className="text-[var(--adaptive-black900)] font-[900] text-[18px]">Radar°</p>
                        </section>

                        <button
                            type="button"
                            onClick={toggleReportMode}
                            className="flex items-center shrink-0"
                        >
                            <p className="text-[14px] font-bold text-[var(--adaptive-blue500)]">Stop Recording...</p>
                        </button>
                    </section>
                ) : (
                    <>
                        {!panelCollapsed ? (
                            <section className="relative flex min-w-0 flex-1 flex-col">
                                {isDragOver ? (
                                    <div className="pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]">
                                        <p className="text-[14px] font-bold text-[var(--adaptive-blue500)]">선택하신 JSON을 import 합니다</p>
                                    </div>
                                ) : null}

                                <section className="flex bg-[var(--adaptive-whiteOpacity700)] backdrop-blur-[50px]">
                                    {anchorSide === "left" ? (
                                        <PanelCollapseTab
                                            collapsed={panelCollapsed}
                                            anchorSide={anchorSide}
                                            onClick={() => setPanelCollapsed((current) => !current)}
                                        />
                                    ) : null}

                                    <div className="flex flex-col gap-[8px] p-[16px]">
                                        <section className="flex items-center justify-between gap-[8px]">
                                            <section className="flex min-w-0 items-center gap-[6px]">
                                                <LogoIcon className="w-[18px] shrink-0" />
                                                <p className="shrink-0 text-[var(--adaptive-black900)] font-[700] text-[16px]">Radar°</p>
                                                <EnvironmentBadge environment={environment} />
                                            </section>

                                            <section className="flex shrink-0 items-center gap-[4px]">
                                                <button
                                                    type="button"
                                                    onClick={toggleReportMode}
                                                    className="p-[4px_8px] rounded-[8px] bg-[var(--adaptive-black200)]"
                                                >
                                                    <p className="text-[12px] text-[var(--adaptive-black500)]">RECORD</p>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={toggleIssueMode}
                                                    className={
                                                        isIssueMode ? "rounded-full bg-[var(--adaptive-black300)] px-[10px] py-[4px]" : "p-[4px_8px] rounded-[8px] bg-[var(--adaptive-black200)]"
                                                    }
                                                    aria-pressed={isIssueMode}
                                                >
                                                    <p className="text-[12px] text-[var(--adaptive-black500)]">ISSUE</p>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={toggleTargetPreview}
                                                    disabled={mode !== "idle"}
                                                    aria-label={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                                    title={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                                    className={
                                                        showTargetPreview ? "rounded-full bg-[var(--adaptive-black300)] px-[10px] py-[4px]" : "p-[4px_8px] rounded-[8px] bg-[var(--adaptive-black200)]"
                                                    }
                                                    aria-pressed={showTargetPreview}
                                                >
                                                    <p className="text-[12px] text-[var(--adaptive-black500)]">X-RAY</p>
                                                </button>
                                            </section>
                                        </section>

                                        <section
                                            className="flex cursor-move"
                                            onPointerDown={handleDragHandlePointerDown}
                                            aria-label="패널 위치 변경"
                                            title="드래그해서 위치 변경"
                                            style={isDragging ? { opacity: 0.8 } : undefined}
                                        >
                                            <section className="flex flex-col items-start gap-[4px] flex-1">
                                                <p className="text-[12px] text-[var(--adaptive-black500)]">Found</p>
                                                <p className={`text-[18px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.found)}</p>
                                            </section>

                                            <section className="flex flex-col items-start gap-[4px] flex-1">
                                                <p className="text-[12px] text-[var(--adaptive-black500)]">Group</p>
                                                <p className={`text-[18px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.group)}</p>
                                            </section>

                                            <section className="flex flex-col items-start gap-[4px] flex-1">
                                                <p className="text-[12px] text-[var(--adaptive-black500)]">Item</p>
                                                <p className={`text-[18px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.item)}</p>
                                            </section>
                                        </section>
                                    </div>

                                    {anchorSide === "right" ? (
                                        <PanelCollapseTab
                                            collapsed={panelCollapsed}
                                            anchorSide={anchorSide}
                                            onClick={() => setPanelCollapsed((current) => !current)}
                                        />
                                    ) : null}
                                </section>

                                <section className="flex items-stretch border-t border-[var(--adaptive-black200)] bg-[var(--adaptive-black200)]">
                                    <div className="flex min-w-0 flex-1 overflow-hidden">
                                        <PanelTabButton
                                            label="Page Details"
                                            active={panelTab === "route-details"}
                                            onClick={() => handlePanelTabClick("route-details")}
                                        />
                                        <div className="h-full w-[1px] bg-[var(--adaptive-black200)]" />
                                        {showFeedbackList ? (
                                            <PanelTabButton
                                                label="Feedback List"
                                                active={panelTab === "feedback-list"}
                                                onClick={() => handlePanelTabClick("feedback-list")}
                                            />
                                        ) : null}
                                    </div>
                                    <div className="h-full w-[1px] bg-[var(--adaptive-black200)]" />

                                    <PanelMoreMenu
                                        open={moreMenuOpen}
                                        disabled={!canTransferFeedback}
                                        onToggle={() => setMoreMenuOpen((current) => !current)}
                                        onClose={() => setMoreMenuOpen(false)}
                                        onExport={handleExport}
                                        onImport={handleImportFromMenu}
                                    />
                                </section>

                                {errorMessage && !pendingImport ? <p className="px-[8px] text-[12px] text-rose-700">{errorMessage}</p> : null}

                                {pendingImport ? (
                                    <ReportImportConfirmDialog
                                        onApply={handleApplyImport}
                                        onCancel={handleCancelImport}
                                        onBackupAndApply={handleBackupAndApplyImport}
                                    />
                                ) : null}

                                {panelTab === "route-details" && !pendingImport ? <ReportRouteDetails /> : null}

                                {panelTab === "feedback-list" && showFeedbackList && !pendingImport ? <ReportFeedbackList /> : null}
                            </section>
                        ) : null}
                    </>
                )}
            </motion.div>
        </>
    );
}
