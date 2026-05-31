import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, panelHeaderAlignModifier, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchableClass, stitchablePartProps } from "../report/parts.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";

function PanelCollapseTab({ collapsed, anchorSide, onClick }: { collapsed: boolean; anchorSide: "left" | "right"; onClick: () => void }) {
    const hideIcon = anchorSide === "right" ? <ChevronRightIcon /> : <ChevronLeftIcon />;
    const expandIcon = anchorSide === "right" ? <ChevronLeftIcon /> : <ChevronRightIcon />;

    return (
        <button
            type="button"
            onClick={onClick}
            {...stitchablePartProps("panel-collapse-tab", {
                modifier: collapsed ? "peek" : undefined,
                className: stitchableClass("panel-collapse-tab", `anchor-${anchorSide}`),
            })}
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
    const floatingPanelClassName = [panelCollapsed ? stitchableClass("floating-panel", "collapsed") : undefined, stitchableClass("floating-panel", `anchor-${anchorSide}`)].filter(Boolean).join(" ");

    return (
        <>
            <PanelDockGuides
                visible={isDragging}
                activeCorner={activeCorner}
            />

            <div
                ref={panelRef}
                {...stitchablePartProps("floating-panel", { className: floatingPanelClassName })}
                style={panelStyle}
            >
                {anchorSide === "left" ? (
                    <PanelCollapseTab
                        collapsed={panelCollapsed}
                        anchorSide={anchorSide}
                        onClick={() => setPanelCollapsed((current) => !current)}
                    />
                ) : null}

                <section {...stitchablePartProps("panel-content")}>
                    <section
                        {...stitchablePartProps("panel-header", {
                            modifier: isDragging ? "dragging" : undefined,
                            className: stitchableClass("panel-header", panelHeaderAlignModifier(placementCorner)),
                        })}
                        onPointerDown={handleDragHandlePointerDown}
                        aria-label="패널 위치 변경"
                        title="드래그해서 위치 변경"
                    >
                        <section style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <p
                                {...stitchablePartProps("helper-text")}
                                style={{ fontSize: "16px", color: "var(--adaptive-blue700)", fontWeight: "700" }}
                            >
                                피드백을 수집 중...
                            </p>

                            <p
                                {...stitchablePartProps("helper-text")}
                                style={{ color: "var(--adaptive-greyOpacity500)" }}
                            >
                                {helperText}
                            </p>
                        </section>
                    </section>

                    <section {...stitchablePartProps("panel-body")}>
                        <div
                            {...stitchablePartProps("button-row")}
                            style={{ display: "flex", flexDirection: "column" }}
                        >
                            <section style={{ display: "flex", width: "100%", gap: "8px" }}>
                                <section style={{ display: "flex", width: "100%", gap: "4px" }}>
                                    <button
                                        type="button"
                                        onClick={toggleReportMode}
                                        {...stitchablePartProps("primary-button", {
                                            modifier: mode === "report" ? "danger" : undefined,
                                        })}
                                    >
                                        <span {...stitchablePartProps("button-with-hint")}>
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
                                        {...stitchablePartProps("secondary-button", {
                                            modifier: showListSection ? "accent" : undefined,
                                        })}
                                    >
                                        <span {...stitchablePartProps("button-with-hint")}>
                                            {showListSection ? "목록 닫기" : "목록"}
                                            <ShortcutHint
                                                binding={REPORT_SHORTCUTS.toggleViewMode}
                                                visible={visibleShortcutKeys}
                                            />
                                        </span>
                                    </button>
                                </section>

                                <div style={{ height: "24px", width: "1px", background: "var(--adaptive-grey300)", margin: "auto 0" }} />

                                <button
                                    type="button"
                                    onClick={toggleTargetPreview}
                                    disabled={mode !== "idle"}
                                    aria-label={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                    title={showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기"}
                                    {...stitchablePartProps("secondary-button", {
                                        modifier: showTargetPreview ? "accent" : undefined,
                                    })}
                                    style={{ flex: "0 0 auto", alignSelf: "flex-end", padding: "8px 10px" }}
                                >
                                    <span {...stitchablePartProps("button-with-hint")}>
                                        {showTargetPreview ? <EyeOpenIcon /> : <EyeClosedIcon />}
                                        <ShortcutHint
                                            binding={REPORT_SHORTCUTS.toggleTargetPreview}
                                            visible={visibleShortcutKeys}
                                        />
                                    </span>
                                </button>
                            </section>
                        </div>

                        {errorMessage ? <p {...stitchablePartProps("error-text")}>{errorMessage}</p> : null}

                        {showListSection ? (
                            <div {...stitchablePartProps("panel-feedback-section")}>
                                <ReportFeedbackList />
                            </div>
                        ) : null}
                    </section>
                </section>

                {anchorSide === "right" ? (
                    <PanelCollapseTab
                        collapsed={panelCollapsed}
                        anchorSide={anchorSide}
                        onClick={() => setPanelCollapsed((current) => !current)}
                    />
                ) : null}
            </div>
        </>
    );
}
