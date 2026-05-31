import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
function PanelCollapseTab({ collapsed, anchorSide, onClick }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, {}) : _jsx(ChevronLeftIcon, {});
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, {}) : _jsx(ChevronRightIcon, {});
    return (_jsx("button", { type: "button", onClick: onClick, ...stitchablePartProps("panel-collapse-tab", {
            modifier: collapsed ? "peek" : undefined,
            className: stitchableClass("panel-collapse-tab", `anchor-${anchorSide}`),
        }), "aria-expanded": !collapsed, "aria-label": collapsed ? "패널 펼치기" : "패널 숨기기", title: collapsed ? "패널 펼치기" : "패널 숨기기", children: collapsed ? expandIcon : hideIcon }));
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
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), _jsxs("div", { ref: panelRef, ...stitchablePartProps("floating-panel", { className: floatingPanelClassName }), style: panelStyle, children: [anchorSide === "left" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null, _jsxs("section", { ...stitchablePartProps("panel-content"), children: [_jsx("section", { ...stitchablePartProps("panel-header", {
                                    modifier: isDragging ? "dragging" : undefined,
                                    className: stitchableClass("panel-header", panelHeaderAlignModifier(placementCorner)),
                                }), onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", children: _jsxs("section", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [_jsx("p", { ...stitchablePartProps("helper-text"), style: { fontSize: "16px", color: "var(--adaptive-blue700)", fontWeight: "700" }, children: "\uD53C\uB4DC\uBC31\uC744 \uC218\uC9D1 \uC911..." }), _jsx("p", { ...stitchablePartProps("helper-text"), style: { color: "var(--adaptive-greyOpacity500)" }, children: helperText })] }) }), _jsxs("section", { ...stitchablePartProps("panel-body"), children: [_jsx("div", { ...stitchablePartProps("button-row"), style: { display: "flex", flexDirection: "column" }, children: _jsxs("section", { style: { display: "flex", width: "100%", gap: "8px" }, children: [_jsxs("section", { style: { display: "flex", width: "100%", gap: "4px" }, children: [_jsx("button", { type: "button", onClick: toggleReportMode, ...stitchablePartProps("primary-button", {
                                                                modifier: mode === "report" ? "danger" : undefined,
                                                            }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [mode === "report" ? "중단" : "기록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, ...stitchablePartProps("secondary-button", {
                                                                modifier: showListSection ? "accent" : undefined,
                                                            }), children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showListSection ? "목록 닫기" : "목록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) })] }), _jsx("div", { style: { height: "24px", width: "1px", background: "var(--adaptive-grey300)", margin: "auto 0" } }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", "aria-label": showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", title: showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", ...stitchablePartProps("secondary-button", {
                                                        modifier: showTargetPreview ? "accent" : undefined,
                                                    }), style: { flex: "0 0 auto", alignSelf: "flex-end", padding: "8px 10px" }, children: _jsxs("span", { ...stitchablePartProps("button-with-hint"), children: [showTargetPreview ? _jsx(EyeOpenIcon, {}) : _jsx(EyeClosedIcon, {}), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) })] }) }), errorMessage ? _jsx("p", { ...stitchablePartProps("error-text"), children: errorMessage }) : null, showListSection ? (_jsx("div", { ...stitchablePartProps("panel-feedback-section"), children: _jsx(ReportFeedbackList, {}) })) : null] })] }), anchorSide === "right" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null] })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map