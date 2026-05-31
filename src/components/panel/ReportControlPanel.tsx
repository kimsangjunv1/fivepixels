import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchablePartProps } from "../report/parts.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";

export function ReportControlPanel() {
    const {
        appearance,
        mode,
        helperText,
        errorMessage,
        showFeedbackList,
        showTargetPreview,
        visibleShortcutKeys,
        isMobileViewport,
        toggleReportMode,
        toggleTargetPreview,
        toggleViewMode,
    } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const { panelRef, panelStyle, isDragging, activeEdge, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: panelCollapsed,
    });
    const showListSection = mode === "view" && showFeedbackList;

    if (panelCollapsed) {
        return (
            <>
                <PanelDockGuides visible={isDragging} activeEdge={activeEdge} />
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
            <PanelDockGuides visible={isDragging} activeEdge={activeEdge} />
            <div ref={panelRef} {...stitchablePartProps("floating-panel")} style={panelStyle}>
                <div
                    {...stitchablePartProps("panel-header", {
                        modifier: isDragging ? "dragging" : undefined,
                    })}
                >
                    <div
                        {...stitchablePartProps("panel-drag-handle")}
                        onPointerDown={handleDragHandlePointerDown}
                        aria-label="패널 위치 변경"
                        title="드래그해서 위치 변경"
                    />
                    <strong {...stitchablePartProps("panel-title")}>stitchable</strong>
                    <span {...stitchablePartProps("badge")}>{appearance}</span>
                </div>

                <div {...stitchablePartProps("panel-body")}>
                    <p {...stitchablePartProps("helper-text")}>{helperText}</p>

                    <div
                        {...stitchablePartProps("button-row")}
                        style={{ display: "flex", flexDirection: "column" }}
                    >
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

                        <button
                            type="button"
                            onClick={toggleTargetPreview}
                            disabled={mode !== "idle"}
                            {...stitchablePartProps("secondary-button", {
                                modifier: showTargetPreview ? "accent" : undefined,
                            })}
                        >
                            <span {...stitchablePartProps("button-with-hint")}>
                                {showTargetPreview ? "X-Ray OFF" : "X-Ray ON"}
                                <ShortcutHint
                                    binding={REPORT_SHORTCUTS.toggleTargetPreview}
                                    visible={visibleShortcutKeys}
                                />
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPanelCollapsed(true)}
                            {...stitchablePartProps("secondary-button")}
                            aria-expanded={true}
                        >
                            숨기기
                        </button>
                    </div>

                    {errorMessage ? <p {...stitchablePartProps("error-text")}>{errorMessage}</p> : null}

                    {showListSection ? (
                        <div {...stitchablePartProps("panel-feedback-section")}>
                            <ReportFeedbackList />
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}
