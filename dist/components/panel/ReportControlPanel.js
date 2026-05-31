import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchablePartProps } from "../report/parts.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
export function ReportControlPanel() {
    const { appearance, mode, helperText, errorMessage, showFeedbackList, showTargetPreview, visibleShortcutKeys, isMobileViewport, toggleReportMode, toggleTargetPreview, toggleViewMode } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const { panelRef, panelStyle, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: panelCollapsed,
    });
    const showListSection = mode === "view" && showFeedbackList;
    if (panelCollapsed) {
        return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), _jsx("div", { ref: panelRef, ...stitchablePartProps("floating-panel", { modifier: "collapsed" }), style: panelStyle, children: _jsx("button", { type: "button", onClick: () => setPanelCollapsed(false), ...stitchablePartProps("secondary-button"), "aria-expanded": false, children: "\uD3BC\uCE58\uAE30" }) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), _jsxs("div", { ref: panelRef, ...stitchablePartProps("floating-panel"), style: panelStyle, children: [_jsxs("section", { style: { display: "flex" }, children: [_jsx("div", { ...stitchablePartProps("panel-header", {
                                    modifier: isDragging ? "dragging" : undefined,
                                }), style: {
                                    display: "flex",
                                    // flexDirection: "column",
                                    justifyContent: "flex-start",
                                    alignItems: "flex-start",
                                    gap: "4px",
                                    cursor: "grab",
                                }, onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", children: _jsxs("section", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [_jsx("p", { ...stitchablePartProps("helper-text"), style: { fontSize: "16px", color: "var(--adaptive-blue700)", fontWeight: "700" }, children: "\uB9AC\uD3EC\uD2B8 \uB3C4\uAD6C" }), _jsx("p", { ...stitchablePartProps("helper-text"), style: { color: "var(--adaptive-greyOpacity500)" }, children: helperText })] }) }), _jsx("button", { type: "button", onClick: () => setPanelCollapsed(true), ...stitchablePartProps("secondary-button"), "aria-expanded": true, children: "\uC228\uAE30\uAE30" })] }), _jsxs("div", { ...stitchablePartProps("panel-body"), children: [_jsx("div", { ...stitchablePartProps("button-row"), style: { display: "flex", flexDirection: "column" }, children: _jsxs("section", { style: { display: "flex", width: "100%", gap: "8px" }, children: [_jsxs("section", { style: { display: "flex", width: "100%", gap: "4px" }, children: [_jsx("button", { type: "button", onClick: toggleReportMode, ...stitchablePartProps("primary-button", {
                                                        modifier: mode === "report" ? "danger" : undefined,
                                                    }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [mode === "report" ? "중단" : "기록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, ...stitchablePartProps("secondary-button", {
                                                        modifier: showListSection ? "accent" : undefined,
                                                    }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showListSection ? "목록 닫기" : "목록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) })] }), _jsx("div", { style: { height: "24px", width: "1px", background: "var(--adaptive-grey300)", margin: "auto 0" } }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", "aria-label": showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", title: showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", ...stitchablePartProps("secondary-button", {
                                                modifier: showTargetPreview ? "accent" : undefined,
                                            }), style: { flex: "0 0 auto", alignSelf: "flex-end", padding: "8px 10px" }, children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showTargetPreview ? _jsx(EyeOpenIcon, {}) : _jsx(EyeClosedIcon, {}), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) })] }) }), errorMessage ? _jsx("p", { ...stitchablePartProps("error-text"), children: errorMessage }) : null, showListSection ? (_jsx("div", { ...stitchablePartProps("panel-feedback-section"), children: _jsx(ReportFeedbackList, {}) })) : null] })] })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map