import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchablePartProps } from "../report/parts.js";

export function ReportControlPanel() {
    const {
        appearance,
        mode,
        helperText,
        errorMessage,
        showTargetPreview,
        visibleShortcutKeys,
        toggleReportMode,
        toggleTargetPreview,
        toggleViewMode,
    } = useReport();

    return (
        <div {...stitchablePartProps("floating-panel")}>
            <div {...stitchablePartProps("panel-header")}>
                <strong {...stitchablePartProps("panel-title")}>stitchable</strong>
                <span {...stitchablePartProps("badge")}>{appearance}</span>
            </div>

            <p {...stitchablePartProps("helper-text")}>{helperText}</p>

            <div {...stitchablePartProps("button-row")}>
                <button
                    type="button"
                    onClick={toggleReportMode}
                    {...stitchablePartProps("primary-button", {
                        modifier: mode === "report" ? "danger" : undefined,
                    })}
                >
                    <span {...stitchablePartProps("button-with-hint")}>
                        {mode === "report" ? "선택 중단" : "피드백 남기기"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.toggleReportMode} visible={visibleShortcutKeys} />
                    </span>
                </button>
                <button
                    type="button"
                    onClick={toggleTargetPreview}
                    disabled={mode !== "idle"}
                    {...stitchablePartProps("secondary-button", {
                        modifier: showTargetPreview ? "accent" : undefined,
                    })}
                >
                    <span {...stitchablePartProps("button-with-hint")}>
                        {showTargetPreview ? "요소 표시 끄기" : "현재 선택 가능한 element 노출하기"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.toggleTargetPreview} visible={visibleShortcutKeys} />
                    </span>
                </button>
                <button
                    type="button"
                    onClick={toggleViewMode}
                    {...stitchablePartProps("secondary-button")}
                >
                    <span {...stitchablePartProps("button-with-hint")}>
                        {mode === "view" ? "목록 닫기" : "피드백 보기"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.toggleViewMode} visible={visibleShortcutKeys} />
                    </span>
                </button>
            </div>

            {errorMessage ? <p {...stitchablePartProps("error-text")}>{errorMessage}</p> : null}
        </div>
    );
}
