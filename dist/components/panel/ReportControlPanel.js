import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchablePartProps } from "../report/parts.js";
export function ReportControlPanel() {
    const { appearance, mode, helperText, errorMessage, showTargetPreview, visibleShortcutKeys, toggleReportMode, toggleTargetPreview, toggleViewMode, } = useReport();
    return (_jsxs("div", { ...stitchablePartProps("floating-panel"), children: [_jsxs("div", { ...stitchablePartProps("panel-header"), children: [_jsx("strong", { ...stitchablePartProps("panel-title"), children: "stitchable" }), _jsx("span", { ...stitchablePartProps("badge"), children: appearance })] }), _jsx("p", { ...stitchablePartProps("helper-text"), children: helperText }), _jsxs("div", { ...stitchablePartProps("button-row"), children: [_jsx("button", { type: "button", onClick: toggleReportMode, ...stitchablePartProps("primary-button", {
                            modifier: mode === "report" ? "danger" : undefined,
                        }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [mode === "report" ? "선택 중단" : "피드백 남기기", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", ...stitchablePartProps("secondary-button", {
                            modifier: showTargetPreview ? "accent" : undefined,
                        }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showTargetPreview ? "요소 표시 끄기" : "현재 선택 가능한 element 노출하기", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, ...stitchablePartProps("secondary-button"), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [mode === "view" ? "목록 닫기" : "피드백 보기", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) })] }), errorMessage ? _jsx("p", { ...stitchablePartProps("error-text"), children: errorMessage }) : null] }));
}
//# sourceMappingURL=ReportControlPanel.js.map