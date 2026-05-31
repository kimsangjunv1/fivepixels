import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelHeaderAlignModifier, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchableClass, stitchablePartProps } from "../report/parts.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";

export function ReportControlPanel() {
    const { appearance, mode, helperText, errorMessage, showFeedbackList, showTargetPreview, visibleShortcutKeys, isMobileViewport, toggleReportMode, toggleTargetPreview, toggleViewMode } =
        useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: panelCollapsed,
    });
    const showListSection = mode === "view" && showFeedbackList;

    if (panelCollapsed) {
        return (
            <>
                <PanelDockGuides
                    visible={isDragging}
                    activeCorner={activeCorner}
                />
                <div
                    ref={panelRef}
                    {...stitchablePartProps("floating-panel", { modifier: "collapsed" })}
                    style={panelStyle}
                >
                    <button
                        type="button"
                        onClick={() => setPanelCollapsed(false)}
                        {...stitchablePartProps("secondary-button")}
                        aria-expanded={false}
                    >
                        펼치기
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <PanelDockGuides
                visible={isDragging}
                activeCorner={activeCorner}
            />

            <div
                ref={panelRef}
                {...stitchablePartProps("floating-panel")}
                style={panelStyle}
            >
                <section>
                    {/* 정보 */}
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
                            {/* <strong {...stitchablePartProps("panel-title")}>stitchable</strong> */}
                            <p
                                {...stitchablePartProps("helper-text")}
                                style={{ fontSize: "16px", color: "var(--adaptive-blue700)", fontWeight: "700" }}
                            >
                                리포트 도구
                            </p>

                            <p
                                {...stitchablePartProps("helper-text")}
                                style={{ color: "var(--adaptive-greyOpacity500)" }}
                            >
                                {helperText}
                            </p>
                            {/* <p {...stitchablePartProps("helper-text")}>{helperText}</p> */}
                        </section>
                    </section>
                    {/* 정보 END */}

                    {/* 액션 */}
                    <section {...stitchablePartProps("panel-body")}>
                        {/* <p {...stitchablePartProps("helper-text")}>{helperText}</p> */}

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
                    {/* 액션 END */}
                </section>
                <button
                    type="button"
                    onClick={() => setPanelCollapsed(true)}
                    {...stitchablePartProps("secondary-button")}
                    aria-expanded={true}
                >
                    숨기기
                </button>
            </div>
        </>
    );
}
