import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchablePartProps } from "../report/parts.js";
export function ReportControlPanel() {
    const { appearance, mode, helperText, errorMessage, showTargetPreview, visibleShortcutKeys, toggleReportMode, toggleTargetPreview, toggleViewMode } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    if (panelCollapsed) {
        return (_jsx("div", { ...stitchablePartProps("floating-panel", { modifier: "collapsed" }), children: _jsx("button", { type: "button", onClick: () => setPanelCollapsed(false), ...stitchablePartProps("secondary-button"), "aria-expanded": false, children: "\uD3BC\uCE58\uAE30" }) }));
    }
    return (_jsxs("div", { ...stitchablePartProps("floating-panel"), children: [_jsxs("div", { ...stitchablePartProps("panel-header"), children: [_jsx("strong", { ...stitchablePartProps("panel-title"), children: "stitchable" }), _jsx("span", { ...stitchablePartProps("badge"), children: appearance })] }), _jsx("p", { ...stitchablePartProps("helper-text"), children: helperText }), _jsxs("div", { ...stitchablePartProps("button-row"), style: { display: "flex", flexDirection: "column" }, children: [_jsxs("section", { style: { display: "flex", width: "100%", gap: "4px" }, children: [_jsx("button", { type: "button", onClick: toggleReportMode, ...stitchablePartProps("primary-button", {
                                    modifier: mode === "report" ? "danger" : undefined,
                                }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [mode === "report" ? "중단" : "기록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, ...stitchablePartProps("secondary-button"), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [mode === "view" ? "목록 닫기" : "목록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) })] }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", ...stitchablePartProps("secondary-button", {
                            modifier: showTargetPreview ? "accent" : undefined,
                        }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showTargetPreview ? "X-Ray OFF" : "X-Ray ON", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: () => setPanelCollapsed(true), ...stitchablePartProps("secondary-button"), "aria-expanded": true, children: "\uC228\uAE30\uAE30" })] }), errorMessage ? _jsx("p", { ...stitchablePartProps("error-text"), children: errorMessage }) : null] }));
}
//# sourceMappingURL=ReportControlPanel.js.map