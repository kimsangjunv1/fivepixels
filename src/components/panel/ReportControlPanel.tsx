import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchablePartProps } from "../report/parts.js";

export function ReportControlPanel() {
    const { appearance, mode, helperText, errorMessage, showTargetPreview, visibleShortcutKeys, toggleReportMode, toggleTargetPreview, toggleViewMode } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);

    if (panelCollapsed) {
        return (
            <div {...stitchablePartProps("floating-panel", { modifier: "collapsed" })}>
                <button
                    type="button"
                    onClick={() => setPanelCollapsed(false)}
                    {...stitchablePartProps("secondary-button")}
                    aria-expanded={false}
                >
                    펼치기
                </button>
            </div>
        );
    }

    return (
        <div {...stitchablePartProps("floating-panel")}>
            <div {...stitchablePartProps("panel-header")}>
                <strong {...stitchablePartProps("panel-title")}>stitchable</strong>
                <span {...stitchablePartProps("badge")}>{appearance}</span>
            </div>

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
                        {...stitchablePartProps("secondary-button")}
                    >
                        <span {...stitchablePartProps("button-with-hint")}>
                            {mode === "view" ? "목록 닫기" : "목록"}
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
        </div>
    );
}
