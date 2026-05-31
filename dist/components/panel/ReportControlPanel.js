import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { stitchablePartProps } from "../report/parts.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
export function ReportControlPanel() {
    const { appearance, mode, helperText, errorMessage, showFeedbackList, showTargetPreview, visibleShortcutKeys, isMobileViewport, toggleReportMode, toggleTargetPreview, toggleViewMode, } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const { panelRef, panelStyle, isDragging, activeEdge, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: panelCollapsed,
    });
    const showListSection = mode === "view" && showFeedbackList;
    if (panelCollapsed) {
        return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeEdge: activeEdge }), _jsx("div", { ref: panelRef, ...stitchablePartProps("floating-panel", { modifier: "collapsed" }), style: panelStyle, children: _jsx("button", { type: "button", onClick: () => setPanelCollapsed(false), ...stitchablePartProps("secondary-button"), "aria-expanded": false, children: "\uD3BC\uCE58\uAE30" }) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeEdge: activeEdge }), _jsxs("div", { ref: panelRef, ...stitchablePartProps("floating-panel"), style: panelStyle, children: [_jsxs("div", { ...stitchablePartProps("panel-header", {
                            modifier: isDragging ? "dragging" : undefined,
                        }), children: [_jsx("div", { ...stitchablePartProps("panel-drag-handle"), onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD" }), _jsx("strong", { ...stitchablePartProps("panel-title"), children: "stitchable" }), _jsx("span", { ...stitchablePartProps("badge"), children: appearance })] }), _jsxs("div", { ...stitchablePartProps("panel-body"), children: [_jsx("p", { ...stitchablePartProps("helper-text"), children: helperText }), _jsxs("div", { ...stitchablePartProps("button-row"), style: { display: "flex", flexDirection: "column" }, children: [_jsxs("section", { style: { display: "flex", width: "100%", gap: "4px" }, children: [_jsx("button", { type: "button", onClick: toggleReportMode, ...stitchablePartProps("primary-button", {
                                                    modifier: mode === "report" ? "danger" : undefined,
                                                }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [mode === "report" ? "중단" : "기록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, ...stitchablePartProps("secondary-button", {
                                                    modifier: showListSection ? "accent" : undefined,
                                                }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showListSection ? "목록 닫기" : "목록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) })] }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", ...stitchablePartProps("secondary-button", {
                                            modifier: showTargetPreview ? "accent" : undefined,
                                        }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showTargetPreview ? "X-Ray OFF" : "X-Ray ON", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: () => setPanelCollapsed(true), ...stitchablePartProps("secondary-button"), "aria-expanded": true, children: "\uC228\uAE30\uAE30" })] }), errorMessage ? _jsx("p", { ...stitchablePartProps("error-text"), children: errorMessage }) : null, showListSection ? (_jsx("div", { ...stitchablePartProps("panel-feedback-section"), children: _jsx(ReportFeedbackList, {}) })) : null] })] })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map