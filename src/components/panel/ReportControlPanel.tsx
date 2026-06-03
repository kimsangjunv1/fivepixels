import { useState } from "react";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { LogoIcon } from "./../icons/LogoIcon.js";
import { motion } from "../motion/index.js";

const RECORDING_STATUS_SHADOW =
    "drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 4px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(0,0,0,0.75))";

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

function formatStatCount(count: number) {
    return count > 0 ? `${count}+` : `${count}`;
}

export function ReportControlPanel() {
    const { mode, targetStats, statusText, errorMessage, showFeedbackList, showTargetPreview, isMobileViewport, toggleReportMode, toggleTargetPreview, toggleViewMode } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const isRecording = mode === "report";
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}`,
    });
    const showListSection = mode === "view" && showFeedbackList;
    const anchorSide = panelAnchorSide(placementCorner);

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
                className={
                    isRecording
                        ? "pointer-events-auto fixed z-[1000000] flex min-h-[40px] rounded-[16px] p-[4px] bg-[var(--adaptive-grey50)] shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]"
                        : "pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] rounded-[16px] p-[4px] bg-[var(--adaptive-grey50)] gap-[4px] max-w-[375px] shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]"
                }
                style={panelStyle}
            >
                {isRecording ? (
                    <section className="flex items-center justify-between gap-[16px] px-[12px] py-[8px]">
                        <section className="flex items-center gap-[4px] justify-start shrink-0">
                            <LogoIcon className="w-[18px]" />
                            <p className="text-[var(--adaptive-grey900)] font-[900]">Radar°</p>
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
                        {anchorSide === "left" ? (
                            <PanelCollapseTab
                                collapsed={panelCollapsed}
                                anchorSide={anchorSide}
                                onClick={() => setPanelCollapsed((current) => !current)}
                            />
                        ) : null}

                        {!panelCollapsed ? (
                            <section className="flex flex-1 flex-col gap-[4px]">
                                <section className="flex items-center justify-between">
                                    <section className="flex items-center gap-[4px] justify-start">
                                        <LogoIcon className="w-[18px]" />
                                        <p className="text-[var(--adaptive-grey900)] font-[900]">Radar°</p>
                                    </section>

                                    <section className="flex items-center justify-end gap-[12px] px-[16px]">
                                        <section className="flex items-center gap-[8px]">
                                            <button
                                                type="button"
                                                onClick={toggleReportMode}
                                                className="flex items-center gap-[4px]"
                                            >
                                                <p className="text-[14px] font-bold text-[var(--adaptive-grey700)]">Record</p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={toggleViewMode}
                                                className="flex items-center gap-[4px]"
                                            >
                                                <p className="text-[14px] font-bold text-[var(--adaptive-grey700)]">{showListSection ? "off" : "list"}</p>
                                            </button>
                                        </section>

                                        <button
                                            type="button"
                                            onClick={toggleTargetPreview}
                                            disabled={mode !== "idle"}
                                            aria-label={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                            title={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                            className="flex items-center gap-[4px]"
                                        >
                                            <p className="text-[14px] font-bold text-[var(--adaptive-grey700)]">{showTargetPreview ? "Stop" : "View"}</p>
                                        </button>
                                    </section>
                                </section>

                                <section className="flex flex-col gap-[16px]">
                                    <section className="flex flex-col gap-[4px]">
                                        <section
                                            className="flex cursor-move flex-col gap-[12px] bg-[var(--adaptive-grey50)]"
                                            onPointerDown={handleDragHandlePointerDown}
                                            aria-label="패널 위치 변경"
                                            title="드래그해서 위치 변경"
                                            style={isDragging ? { opacity: 0.8 } : undefined}
                                        >
                                            <section className="flex w-full items-center justify-between">
                                                <section className="flex flex-col items-start gap-[4px] flex-1">
                                                    <p className="text-[12px] text-[var(--adaptive-grey500)]">Found</p>
                                                    <p className="text-[14px] font-bold text-[var(--adaptive-grey900)]">{formatStatCount(targetStats.found)}</p>
                                                </section>

                                                <section className="flex flex-col items-start gap-[4px] flex-1">
                                                    <p className="text-[12px] text-[var(--adaptive-grey500)]">Group</p>
                                                    <p className="text-[14px] font-bold text-[var(--adaptive-grey900)]">{formatStatCount(targetStats.group)}</p>
                                                </section>

                                                <section className="flex flex-col items-start gap-[4px] flex-1">
                                                    <p className="text-[12px] text-[var(--adaptive-grey500)]">Item</p>
                                                    <p className="text-[14px] font-bold text-[var(--adaptive-grey900)]">{formatStatCount(targetStats.item)}</p>
                                                </section>
                                            </section>
                                        </section>
                                    </section>

                                    {showListSection ? (
                                        <section className="flex flex-1 flex-col gap-[16px]">
                                            {errorMessage ? (
                                                <p className="mt-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                                                    {errorMessage}
                                                </p>
                                            ) : null}

                                            <ReportFeedbackList />
                                        </section>
                                    ) : null}
                                </section>
                            </section>
                        ) : null}

                        {anchorSide === "right" ? (
                            <PanelCollapseTab
                                collapsed={panelCollapsed}
                                anchorSide={anchorSide}
                                onClick={() => setPanelCollapsed((current) => !current)}
                            />
                        ) : null}
                    </>
                )}
            </motion.div>
        </>
    );
}
