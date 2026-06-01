import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { btnPrimary, btnPrimaryDanger, btnSecondary, btnSecondaryAccent, panelSurface } from "../report/classes.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void }) {
    const hideIcon = anchorSide === "right" ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />;
    const expandIcon = anchorSide === "right" ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`pointer-events-auto absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${anchorSide === "right" ? "-right-4" : "-left-4"}`}
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
    const panelWidthClass = isMobileViewport ? "w-[calc(100vw-32px)]" : "w-80";

    return (
        <div
            ref={panelRef}
            className={`${panelSurface} ${panelWidthClass} ${panelCollapsed ? "w-12 overflow-hidden" : ""}`}
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
                <section className="flex min-h-0 flex-1 flex-col">
                    <section
                        className={`cursor-grab border-b border-slate-200 px-4 py-3 active:cursor-grabbing dark:border-slate-700 ${isDragging ? "opacity-80" : ""}`}
                        onPointerDown={handleDragHandlePointerDown}
                        aria-label="패널 위치 변경"
                        title="드래그해서 위치 변경"
                    >
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">피드백을 수집 중...</p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{helperText}</p>
                    </section>

                    <section className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex w-full gap-2">
                                <button
                                    type="button"
                                    onClick={toggleReportMode}
                                    className={`flex-1 ${mode === "report" ? btnPrimaryDanger : btnPrimary}`}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {mode === "report" ? "중단" : "기록"}
                                        <ShortcutHint binding={REPORT_SHORTCUTS.toggleReportMode} visible={visibleShortcutKeys} />
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={toggleViewMode}
                                    className={`flex-1 ${showListSection ? btnSecondaryAccent : btnSecondary}`}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {showListSection ? "목록 닫기" : "목록"}
                                        <ShortcutHint binding={REPORT_SHORTCUTS.toggleViewMode} visible={visibleShortcutKeys} />
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={toggleTargetPreview}
                                    disabled={mode !== "idle"}
                                    aria-label={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                    title={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                    className={`shrink-0 px-2.5 ${showTargetPreview ? btnSecondaryAccent : btnSecondary}`}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {showTargetPreview ? <EyeOpenIcon className="h-4 w-4" /> : <EyeClosedIcon className="h-4 w-4" />}
                                        <ShortcutHint binding={REPORT_SHORTCUTS.toggleTargetPreview} visible={visibleShortcutKeys} />
                                    </span>
                                </button>
                            </div>
                        </div>

                        {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

                        {showListSection ? (
                            <div className="min-h-0 flex-1 overflow-hidden">
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
