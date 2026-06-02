import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { LogoIcon } from "./../icons/LogoIcon.js";
import { LogoTextIcon } from "./../icons/LogoTextIcon.js";
import { SearchIcon } from "./../icons/SearchIcon.js";
import { motion } from "../motion/index.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void }) {
    const hideIcon = anchorSide === "right" ? <ChevronRightIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" /> : <ChevronLeftIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" />;
    const expandIcon =
        anchorSide === "right" ? <ChevronLeftIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" /> : <ChevronRightIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" />;

    return (
        <button
            type="button"
            onClick={onClick}
            className=""
            // className={
            //     anchorSide === "right"
            //         ? "pointer-events-auto absolute right-0 top-4 z-20 flex h-6 w-4 translate-x-full items-center justify-center rounded-r-md border border-l-0 border-slate-300 bg-slate-100 text-xs text-slate-500 shadow-sm hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            //         : "pointer-events-auto absolute left-0 top-4 z-20 flex h-6 w-4 -translate-x-full items-center justify-center rounded-l-md border border-r-0 border-slate-300 bg-slate-100 text-xs text-slate-500 shadow-sm hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            // }
            aria-expanded={!collapsed}
            aria-label={collapsed ? "패널 펼치기" : "패널 숨기기"}
            title={collapsed ? "패널 펼치기" : "패널 숨기기"}
        >
            {collapsed ? expandIcon : hideIcon}
        </button>
    );
}

export function ReportControlPanel() {
    const { mode, helperText, errorMessage, showFeedbackList, showTargetPreview, visibleShortcutKeys, isMobileViewport, toggleReportMode, toggleTargetPreview, toggleViewMode } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: panelCollapsed,
    });
    const showListSection = mode === "view" && showFeedbackList;
    const anchorSide = panelAnchorSide(placementCorner);

    return (
        <>
            <PanelDockGuides
                visible={isDragging}
                activeCorner={activeCorner}
            />

            <motion.div
                ref={panelRef}
                layout
                layoutId="asdwsww"
                className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] rounded-[16px] p-[4px] bg-[var(--adaptive-whiteOpacity100)] backdrop-blur-[30px] gap-[4px] shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]"
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] rounded-[16px] p-[4px] bg-[var(--adaptive-greyOpacity100)] backdrop-blur-[30px] flex-col shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]"
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] w-[320px] flex-col"
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg shadow-lg"
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-[var(--adaptive-grey50)] shadow-lg"
                // className={
                //     panelCollapsed
                //         ? "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-slate-50/90 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90"
                //         : "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[160px] w-[360px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900"
                // }
                style={panelStyle}
            >
                {anchorSide === "left" ? (
                    <PanelCollapseTab
                        collapsed={panelCollapsed}
                        anchorSide={anchorSide}
                        onClick={() => setPanelCollapsed((current) => !current)}
                    />
                ) : null}

                {!panelCollapsed ? (
                    <section className="flex flex-1 flex-col gap-[4px]">
                        <section className="flex items-center gap-[4px] justify-center">
                            <LogoIcon className="w-[18px]" />
                            {/* <LogoTextIcon className="h-[12px] w-[58px]" /> */}
                            <p className="text-[#E26909] font-[900]">Radar°</p>
                        </section>

                        <section className="flex flex-col gap-[16px]">
                            <section className="flex flex-col gap-[4px]">
                                <section
                                    className="flex items-center cursor-move gap-[8px] bg-[var(--adaptive-grey50)] shadow-[var(--shadow-normal)] rounded-[12px] p-[8px_12px]"
                                    // className="flex cursor-move flex-col gap-0.5 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/80"
                                    onPointerDown={handleDragHandlePointerDown}
                                    aria-label="패널 위치 변경"
                                    title="드래그해서 위치 변경"
                                    style={isDragging ? { opacity: 0.8 } : undefined}
                                >
                                    {/* <LogoIcon className="w-[34px]" /> */}
                                    <section className="flex flex-col items-center gap-[4px] flex-1">
                                        <p className="text-[12px] text-[var(--adaptive-grey500)] text-left">status</p>
                                        <p className="text-[14px] text-[var(--adaptive-green900)]">ready.</p>
                                    </section>

                                    <section className="flex flex-col items-center gap-[4px] flex-1">
                                        <p className="text-[12px] text-[var(--adaptive-grey500)] text-left">status</p>

                                        <p className="text-[14px] text-[var(--adaptive-greyOpacity600)] whitespace-break-spaces">{helperText}ea</p>
                                    </section>
                                </section>

                                <section className="flex items-center justify-end gap-[12px] px-[16px]">
                                    <section className="flex items-center gap-[8px]">
                                        <button
                                            type="button"
                                            onClick={toggleReportMode}
                                            className={`flex items-center gap-[4px]`}
                                        >
                                            {/* <div className="w-[6px] h-[6px] bg-[var(--adaptive-red500)] rounded-full" /> */}
                                            <p className="text-[14px] font-bold text-[var(--adaptive-grey700)]">{mode === "report" ? "Stop" : "Record"}</p>
                                            <ShortcutHint
                                                binding={REPORT_SHORTCUTS.toggleReportMode}
                                                visible={visibleShortcutKeys}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={toggleViewMode}
                                            className="flex items-center gap-[4px]"
                                            // className={`flex items-center gap-[4px] ${
                                            //     showListSection
                                            //         ? "border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                                            //         : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                            // }`}
                                        >
                                            {/* <SearchIcon className="w-[18px]" /> */}
                                            <p className="text-[14px] font-bold text-[var(--adaptive-grey700)]">{showListSection ? "off" : "list"}</p>

                                            <ShortcutHint
                                                binding={REPORT_SHORTCUTS.toggleViewMode}
                                                visible={visibleShortcutKeys}
                                            />
                                        </button>
                                    </section>

                                    <div className="h-[12px] w-[1px] bg-[var(--adaptive-grey400)]" />

                                    <button
                                        type="button"
                                        onClick={toggleTargetPreview}
                                        disabled={mode !== "idle"}
                                        aria-label={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                        title={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                        className="flex items-center gap-[4px]"
                                        // className={`${
                                        //     showTargetPreview
                                        //         ? "border-sky-300 bg-sky-50 text-sky-700 shadow-sm hover:bg-sky-100 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                                        //         : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                        // } flex items-center gap-[4px] rounded-[12px] p-[12px] shadow-[var(--shadow-popup)]`}
                                    >
                                        <p className="text-[14px] font-bold text-[var(--adaptive-grey700)]">X-Ray</p>
                                        {/* <p className="text-[14px]">{showTargetPreview ? <EyeOpenIcon className="h-3.5 w-3.5" /> : <EyeClosedIcon className="h-3.5 w-3.5" />}</p> */}

                                        <ShortcutHint
                                            binding={REPORT_SHORTCUTS.toggleTargetPreview}
                                            visible={visibleShortcutKeys}
                                        />
                                    </button>
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

                {/* <div className="bg-[var(--adaptive-blue200)] absolute right-[-50%] bottom-[-50%] h-[150%] w-[150%] blur-[98px] z-[-1]" /> */}
            </motion.div>
        </>
    );
}
