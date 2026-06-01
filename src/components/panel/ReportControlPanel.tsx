import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import {
    btnHint,
    btnIcon,
    btnPrimary,
    btnPrimaryDanger,
    btnSecondary,
    btnSecondaryAccent,
    collapseTabLeft,
    collapseTabRight,
    errorText,
    flex1,
    icon,
    panelBody,
    panelHeader,
    panelSection,
    panelSurface,
    panelSurfaceCollapsed,
    row,
    stackSm,
    textBody,
    textMuted,
} from "../report/classes.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void }) {
    const hideIcon = anchorSide === "right" ? <ChevronRightIcon className={icon} /> : <ChevronLeftIcon className={icon} />;
    const expandIcon = anchorSide === "right" ? <ChevronLeftIcon className={icon} /> : <ChevronRightIcon className={icon} />;

    return (
        <button
            type="button"
            onClick={onClick}
            className={anchorSide === "right" ? collapseTabRight : collapseTabLeft}
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
        <div ref={panelRef} className={panelCollapsed ? panelSurfaceCollapsed : panelSurface} style={panelStyle}>
            {anchorSide === "left" ? <PanelCollapseTab collapsed={panelCollapsed} anchorSide={anchorSide} onClick={() => setPanelCollapsed((current) => !current)} /> : null}

            {!panelCollapsed ? (
                <section className={flex1}>
                    <section className={`${panelHeader} ${stackSm}`} onPointerDown={handleDragHandlePointerDown} aria-label="패널 위치 변경" title="드래그해서 위치 변경" style={isDragging ? { opacity: 0.8 } : undefined}>
                        <p className={textMuted}>피드백을 수집 중...</p>
                        <p className={textBody}>{helperText}</p>
                    </section>

                    <section className={panelBody}>
                        <div className={row}>
                            <button type="button" onClick={toggleReportMode} className={`${flex1} ${mode === "report" ? btnPrimaryDanger : btnPrimary}`}>
                                <span className={btnHint}>
                                    {mode === "report" ? "중단" : "기록"}
                                    <ShortcutHint binding={REPORT_SHORTCUTS.toggleReportMode} visible={visibleShortcutKeys} />
                                </span>
                            </button>

                            <button type="button" onClick={toggleViewMode} className={`${flex1} ${showListSection ? btnSecondaryAccent : btnSecondary}`}>
                                <span className={btnHint}>
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
                                className={showTargetPreview ? btnSecondaryAccent : btnIcon}
                            >
                                <span className={btnHint}>
                                    {showTargetPreview ? <EyeOpenIcon className={icon} /> : <EyeClosedIcon className={icon} />}
                                    <ShortcutHint binding={REPORT_SHORTCUTS.toggleTargetPreview} visible={visibleShortcutKeys} />
                                </span>
                            </button>
                        </div>

                        {errorMessage ? <p className={errorText}>{errorMessage}</p> : null}

                        {showListSection ? (
                            <div className={panelSection}>
                                <ReportFeedbackList />
                            </div>
                        ) : null}
                    </section>
                </section>
            ) : null}

            {anchorSide === "right" ? <PanelCollapseTab collapsed={panelCollapsed} anchorSide={anchorSide} onClick={() => setPanelCollapsed((current) => !current)} /> : null}
        </div>
    );
}
