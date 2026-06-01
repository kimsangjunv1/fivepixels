import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { btnPrimary, btnPrimaryDanger, btnSecondary, btnSecondaryAccent, panelSurface } from "../report/classes.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-4 w-4" }) : _jsx(ChevronLeftIcon, { className: "h-4 w-4" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-4 w-4" }) : _jsx(ChevronRightIcon, { className: "h-4 w-4" });
    return (_jsx("button", { type: "button", onClick: onClick, className: `pointer-events-auto absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${anchorSide === "right" ? "-right-4" : "-left-4"}`, "aria-expanded": !collapsed, "aria-label": collapsed ? "패널 펼치기" : "패널 숨기기", title: collapsed ? "패널 펼치기" : "패널 숨기기", children: collapsed ? expandIcon : hideIcon }));
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
    const panelWidthClass = isMobileViewport ? "w-[calc(100vw-32px)]" : "w-80";
    return (_jsxs("div", { ref: panelRef, className: `${panelSurface} ${panelWidthClass} ${panelCollapsed ? "w-12 overflow-hidden" : ""}`, style: panelStyle, children: [anchorSide === "left" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null, !panelCollapsed ? (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col", children: [_jsxs("section", { className: `cursor-grab border-b border-slate-200 px-4 py-3 active:cursor-grabbing dark:border-slate-700 ${isDragging ? "opacity-80" : ""}`, onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", children: [_jsx("p", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400", children: "\uD53C\uB4DC\uBC31\uC744 \uC218\uC9D1 \uC911..." }), _jsx("p", { className: "mt-1 text-sm text-slate-700 dark:text-slate-200", children: helperText })] }), _jsxs("section", { className: "flex min-h-0 flex-1 flex-col gap-3 p-4", children: [_jsx("div", { className: "flex flex-col gap-2", children: _jsxs("div", { className: "flex w-full gap-2", children: [_jsx("button", { type: "button", onClick: toggleReportMode, className: `flex-1 ${mode === "report" ? btnPrimaryDanger : btnPrimary}`, children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [mode === "report" ? "중단" : "기록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, className: `flex-1 ${showListSection ? btnSecondaryAccent : btnSecondary}`, children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [showListSection ? "목록 닫기" : "목록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", "aria-label": showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", title: showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", className: `shrink-0 px-2.5 ${showTargetPreview ? btnSecondaryAccent : btnSecondary}`, children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [showTargetPreview ? _jsx(EyeOpenIcon, { className: "h-4 w-4" }) : _jsx(EyeClosedIcon, { className: "h-4 w-4" }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) })] }) }), errorMessage ? _jsx("p", { className: "text-sm text-red-500", children: errorMessage }) : null, showListSection ? (_jsx("div", { className: "min-h-0 flex-1 overflow-hidden", children: _jsx(ReportFeedbackList, {}) })) : null] })] })) : null, anchorSide === "right" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null] }));
}
//# sourceMappingURL=ReportControlPanel.js.map