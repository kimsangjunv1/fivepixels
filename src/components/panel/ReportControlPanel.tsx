import { useState } from "react";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { LogoIcon } from "./../icons/LogoIcon.js";
import { motion } from "../motion/index.js";
import { formatStatCount } from "../../utils/formatStatCount.js";
import { panelNumericClassName, PANEL_FONT_FAMILY } from "../../utils/panelTypography.js";
import type { ReportPanelTab } from "../../types/report-ui.js";

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
            className={
                active
                    ? "flex flex-1 items-center justify-center gap-[6px] rounded-[10px] bg-white px-[10px] py-[8px] text-[13px] font-bold text-[var(--adaptive-grey900)]"
                    : "flex flex-1 items-center justify-center gap-[6px] rounded-[10px] bg-[var(--adaptive-grey200)] px-[10px] py-[8px] text-[13px] font-bold text-[var(--adaptive-grey600)]"
            }
        >
            <span>{label}</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${active ? "rotate-180" : ""}`} />
        </button>
    );
}

function EnvironmentBadge({ environment }: { environment?: string }) {
    if (!environment) {
        return null;
    }

    return (
        <span className="inline-flex items-center gap-[6px] rounded-full border border-[var(--adaptive-grey300)] bg-white px-[8px] py-[2px] text-[11px] font-semibold text-[var(--adaptive-grey700)]">
            <span>{environment}</span>
            <span
                className="inline-flex h-[6px] w-[6px] rounded-full bg-[var(--adaptive-green500)]"
                aria-hidden
            />
        </span>
    );
}

export function ReportControlPanel() {
    const {
        mode,
        targetStats,
        statusText,
        errorMessage,
        environment,
        showFeedbackList,
        showTargetPreview,
        isMobileViewport,
        panelTab,
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        openPanelTab,
    } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const isRecording = mode === "report";
    const isIssueMode = mode === "view";
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}-${panelTab ?? "none"}-${isIssueMode}`,
    });
    const anchorSide = panelAnchorSide(placementCorner);

    const handlePanelTabClick = (tab: ReportPanelTab) => {
        if (tab === "feedback-list" && isIssueMode) {
            toggleIssueMode();
        }

        openPanelTab(tab);
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
                className={
                    isRecording
                        ? "pointer-events-auto fixed z-[1000000] flex min-h-[40px] rounded-[24px] p-[4px] bg-[var(--adaptive-grey50)] shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]"
                        : "pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] rounded-[16px] p-[4px] bg-[var(--adaptive-grey50)] gap-[4px] max-w-[375px] shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]"
                }
                style={{ ...panelStyle, fontFamily: PANEL_FONT_FAMILY, fontSize: "14px" }}
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
                            <section className="flex min-w-0 flex-1 flex-col gap-[4px]">
                                <section className="flex items-center justify-between gap-[8px] px-[8px] pt-[6px]">
                                    <section className="flex min-w-0 items-center gap-[6px]">
                                        <LogoIcon className="w-[18px] shrink-0" />
                                        <p className="shrink-0 text-[var(--adaptive-grey900)] font-[900]">Radar°</p>
                                        <EnvironmentBadge environment={environment} />
                                    </section>

                                    <section className="flex shrink-0 items-center gap-[8px]">
                                        <button
                                            type="button"
                                            onClick={toggleReportMode}
                                            className="rounded-full bg-white px-[10px] py-[4px]"
                                        >
                                            <p className="text-[11px] font-bold tracking-wide text-[var(--adaptive-grey700)]">RECORD</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={toggleIssueMode}
                                            className={isIssueMode ? "rounded-full bg-[var(--adaptive-grey300)] px-[10px] py-[4px]" : "rounded-full bg-white px-[10px] py-[4px]"}
                                            aria-pressed={isIssueMode}
                                        >
                                            <p className="text-[11px] font-bold tracking-wide text-[var(--adaptive-grey700)]">ISSUE</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={toggleTargetPreview}
                                            disabled={mode !== "idle"}
                                            aria-label={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                            title={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                            className={showTargetPreview ? "rounded-full bg-[var(--adaptive-grey300)] px-[10px] py-[4px]" : "rounded-full bg-white px-[10px] py-[4px]"}
                                            aria-pressed={showTargetPreview}
                                        >
                                            <p className="text-[11px] font-bold tracking-wide text-[var(--adaptive-grey700)]">{showTargetPreview ? "X-RAY" : "X-RAY"}</p>
                                        </button>
                                    </section>
                                </section>

                                <section
                                    className="flex cursor-move flex-col gap-[12px] bg-[var(--adaptive-grey50)] px-[8px]"
                                    onPointerDown={handleDragHandlePointerDown}
                                    aria-label="패널 위치 변경"
                                    title="드래그해서 위치 변경"
                                    style={isDragging ? { opacity: 0.8 } : undefined}
                                >
                                    <section className="flex w-full items-center justify-between">
                                        <section className="flex flex-col items-start gap-[4px] flex-1">
                                            <p className="text-[12px] text-[var(--adaptive-grey500)]">Found</p>
                                            <p className={`text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.found)}</p>
                                        </section>

                                        <section className="flex flex-col items-start gap-[4px] flex-1">
                                            <p className="text-[12px] text-[var(--adaptive-grey500)]">Group</p>
                                            <p className={`text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.group)}</p>
                                        </section>

                                        <section className="flex flex-col items-start gap-[4px] flex-1">
                                            <p className="text-[12px] text-[var(--adaptive-grey500)]">Item</p>
                                            <p className={`text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`}>{formatStatCount(targetStats.item)}</p>
                                        </section>
                                    </section>
                                </section>

                                <section className="grid grid-cols-2 gap-[4px] border-t border-[var(--adaptive-grey200)] px-[4px] pb-[4px] pt-[4px]">
                                    <PanelTabButton
                                        label="Route Details"
                                        active={panelTab === "route-details"}
                                        onClick={() => handlePanelTabClick("route-details")}
                                    />
                                    {showFeedbackList ? (
                                        <PanelTabButton
                                            label="Feedback List"
                                            active={panelTab === "feedback-list"}
                                            onClick={() => handlePanelTabClick("feedback-list")}
                                        />
                                    ) : (
                                        <div />
                                    )}
                                </section>

                                {panelTab === "route-details" ? (
                                    <div className="px-[4px] pb-[4px]">
                                        <ReportRouteDetails />
                                    </div>
                                ) : null}

                                {panelTab === "feedback-list" && showFeedbackList ? (
                                    <section className="flex min-h-0 flex-1 flex-col gap-[8px] overflow-hidden px-[4px] pb-[4px]">
                                        {errorMessage ? (
                                            <p className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                                                {errorMessage}
                                            </p>
                                        ) : null}

                                        <ReportFeedbackList />
                                    </section>
                                ) : null}
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
