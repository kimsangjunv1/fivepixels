import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { btnHint, btnIcon, btnPrimary, btnPrimaryDanger, btnSecondary, btnSecondaryAccent, collapseTabLeft, collapseTabRight, errorText, flex1, icon, panelBody, panelHeader, panelSection, panelSurface, panelSurfaceCollapsed, row, stackSm, textBody, textMuted, } from "../report/classes.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: icon }) : _jsx(ChevronLeftIcon, { className: icon });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: icon }) : _jsx(ChevronRightIcon, { className: icon });
    return (_jsx("button", { type: "button", onClick: onClick, className: anchorSide === "right" ? collapseTabRight : collapseTabLeft, "aria-expanded": !collapsed, "aria-label": collapsed ? "패널 펼치기" : "패널 숨기기", title: collapsed ? "패널 펼치기" : "패널 숨기기", children: collapsed ? expandIcon : hideIcon }));
}
export function ReportControlPanel() {
    const { mode, helperText, errorMessage, showFeedbackList, showTargetPreview, visibleShortcutKeys, isMobileViewport, toggleReportMode, toggleTargetPreview, toggleViewMode } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const { panelRef, panelStyle, placementCorner, isDragging, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: panelCollapsed,
    });
    const showListSection = mode === "view" && showFeedbackList;
    const anchorSide = panelAnchorSide(placementCorner);
    return (_jsxs("div", { ref: panelRef, className: panelCollapsed ? panelSurfaceCollapsed : panelSurface, style: panelStyle, children: [anchorSide === "left" ? _jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) }) : null, !panelCollapsed ? (_jsxs("section", { className: flex1, children: [_jsxs("section", { className: `${panelHeader} ${stackSm}`, onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", style: isDragging ? { opacity: 0.8 } : undefined, children: [_jsx("p", { className: textMuted, children: "\uD53C\uB4DC\uBC31\uC744 \uC218\uC9D1 \uC911..." }), _jsx("p", { className: textBody, children: helperText })] }), _jsxs("section", { className: panelBody, children: [_jsxs("div", { className: row, children: [_jsx("button", { type: "button", onClick: toggleReportMode, className: `${flex1} ${mode === "report" ? btnPrimaryDanger : btnPrimary}`, children: _jsxs("span", { className: btnHint, children: [mode === "report" ? "중단" : "기록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, className: `${flex1} ${showListSection ? btnSecondaryAccent : btnSecondary}`, children: _jsxs("span", { className: btnHint, children: [showListSection ? "목록 닫기" : "목록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", "aria-label": showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", title: showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", className: showTargetPreview ? btnSecondaryAccent : btnIcon, children: _jsxs("span", { className: btnHint, children: [showTargetPreview ? _jsx(EyeOpenIcon, { className: icon }) : _jsx(EyeClosedIcon, { className: icon }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) })] }), errorMessage ? _jsx("p", { className: errorText, children: errorMessage }) : null, showListSection ? (_jsx("div", { className: panelSection, children: _jsx(ReportFeedbackList, {}) })) : null] })] })) : null, anchorSide === "right" ? _jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) }) : null] }));
}
//# sourceMappingURL=ReportControlPanel.js.map