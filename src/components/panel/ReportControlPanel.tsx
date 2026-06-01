import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void }) {
    const hideIcon = anchorSide === "right" ? <ChevronRightIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" /> : <ChevronLeftIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" />;
    const expandIcon =
        anchorSide === "right" ? <ChevronLeftIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" /> : <ChevronRightIcon className="h-3 w-3 text-slate-500 dark:text-slate-300" />;

    return (
        <button
            type="button"
            onClick={onClick}
            className={
                anchorSide === "right"
                    ? "pointer-events-auto absolute right-0 top-4 z-20 flex h-6 w-4 translate-x-full items-center justify-center rounded-r-md border border-l-0 border-slate-300 bg-slate-100 text-xs text-slate-500 shadow-sm hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    : "pointer-events-auto absolute left-0 top-4 z-20 flex h-6 w-4 -translate-x-full items-center justify-center rounded-l-md border border-r-0 border-slate-300 bg-slate-100 text-xs text-slate-500 shadow-sm hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }
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
    const { panelRef, panelStyle, placementCorner, isDragging, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: panelCollapsed,
    });
    const showListSection = mode === "view" && showFeedbackList;
    const anchorSide = panelAnchorSide(placementCorner);

    return (
        <div
            ref={panelRef}
            className={
                panelCollapsed
                    ? "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-slate-50/90 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90"
                    : "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[160px] w-[360px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900"
            }
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
                <section className="flex flex-1 flex-col">
                    <section
                        className="flex cursor-move flex-col gap-0.5 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/80"
                        onPointerDown={handleDragHandlePointerDown}
                        aria-label="패널 위치 변경"
                        title="드래그해서 위치 변경"
                        style={isDragging ? { opacity: 0.8 } : undefined}
                    >
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">피드백을 수집 중...</p>
                        <p className="text-[14px] leading-[1.5]">{helperText}</p>
                        {/* <p className="text-xs text-slate-800 dark:text-slate-100">{helperText}</p> */}
                    </section>

                    <section className="flex flex-1 flex-col gap-2 bg-slate-50/60 px-3 py-2 text-xs dark:bg-slate-950/40">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleReportMode}
                                className={`inline-flex flex-1 items-center justify-center rounded-md px-3 py-1 text-xs font-medium shadow-sm ${
                                    mode === "report"
                                        ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                                        : "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                                }`}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {mode === "report" ? "중단" : "기록"}
                                    <ShortcutHint
                                        binding={REPORT_SHORTCUTS.toggleReportMode}
                                        visible={visibleShortcutKeys}
                                    />
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={toggleViewMode}
                                className={`inline-flex flex-1 items-center justify-center rounded-md px-3 py-1 text-xs font-medium shadow-sm ${
                                    showListSection
                                        ? "border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                }`}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {showListSection ? "목록 닫기" : "목록"}
                                    <ShortcutHint
                                        binding={REPORT_SHORTCUTS.toggleViewMode}
                                        visible={visibleShortcutKeys}
                                    />
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={toggleTargetPreview}
                                disabled={mode !== "idle"}
                                aria-label={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                title={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                className={
                                    showTargetPreview
                                        ? "inline-flex h-7 w-8 items-center justify-center rounded-md border border-sky-300 bg-sky-50 text-sky-700 shadow-sm hover:bg-sky-100 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                                        : "inline-flex h-7 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                }
                            >
                                <span className="inline-flex items-center gap-1">
                                    {showTargetPreview ? <EyeOpenIcon className="h-3.5 w-3.5" /> : <EyeClosedIcon className="h-3.5 w-3.5" />}
                                    <ShortcutHint
                                        binding={REPORT_SHORTCUTS.toggleTargetPreview}
                                        visible={visibleShortcutKeys}
                                    />
                                </span>
                            </button>
                        </div>

                        {errorMessage ? (
                            <p className="mt-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                                {errorMessage}
                            </p>
                        ) : null}

                        {showListSection ? (
                            <div className="mt-2 flex-1 overflow-hidden">
                                <ReportFeedbackList />
                            </div>
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
        </div>
    );
}
