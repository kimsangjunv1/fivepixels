import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { EyeClosedIcon, EyeOpenIcon } from "../icons/EyeIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    return (_jsx("button", { type: "button", onClick: onClick, className: anchorSide === "right"
            ? "pointer-events-auto absolute right-0 top-4 z-20 flex h-6 w-4 translate-x-full items-center justify-center rounded-r-md border border-l-0 border-slate-300 bg-slate-100 text-xs text-slate-500 shadow-sm hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            : "pointer-events-auto absolute left-0 top-4 z-20 flex h-6 w-4 -translate-x-full items-center justify-center rounded-l-md border border-r-0 border-slate-300 bg-slate-100 text-xs text-slate-500 shadow-sm hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", "aria-expanded": !collapsed, "aria-label": collapsed ? "패널 펼치기" : "패널 숨기기", title: collapsed ? "패널 펼치기" : "패널 숨기기", children: collapsed ? expandIcon : hideIcon }));
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
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), _jsxs("div", { ref: panelRef, className: "pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-[var(--adaptive-grey50)] shadow-lg", 
                // className={
                //     panelCollapsed
                //         ? "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-slate-50/90 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90"
                //         : "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[160px] w-[360px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900"
                // }
                style: panelStyle, children: [anchorSide === "left" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null, !panelCollapsed ? (_jsxs("section", { className: "flex flex-1 flex-col", children: [_jsxs("section", { className: "flex cursor-move flex-col", 
                                // className="flex cursor-move flex-col gap-0.5 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/80"
                                onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", style: isDragging ? { opacity: 0.8 } : undefined, children: [_jsx("p", { className: "text-[11px] text-[var(--adaptive-grey300)]", children: "\uD53C\uB4DC\uBC31\uC744 \uC218\uC9D1 \uC911..." }), _jsx("p", { className: "text-[14px] leading-[1.5]", children: helperText })] }), _jsxs("section", { className: "flex flex-1 flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: toggleReportMode, className: `inline-flex flex-1 items-center justify-center rounded-md px-3 py-1 text-xs font-medium shadow-sm ${mode === "report"
                                                    ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                                                    : "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"}`, children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [mode === "report" ? "중단" : "기록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleViewMode, className: `inline-flex flex-1 items-center justify-center rounded-md px-3 py-1 text-xs font-medium shadow-sm ${showListSection
                                                    ? "border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                                                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"}`, children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [showListSection ? "목록 닫기" : "목록", _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] }) }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", "aria-label": showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", title: showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", className: showTargetPreview
                                                    ? "inline-flex h-7 w-8 items-center justify-center rounded-md border border-sky-300 bg-sky-50 text-sky-700 shadow-sm hover:bg-sky-100 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                                                    : "inline-flex h-7 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [showTargetPreview ? _jsx(EyeOpenIcon, { className: "h-3.5 w-3.5" }) : _jsx(EyeClosedIcon, { className: "h-3.5 w-3.5" }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] }) })] }), errorMessage ? (_jsx("p", { className: "mt-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200", children: errorMessage })) : null, showListSection ? (_jsx("div", { className: "mt-2 flex-1 overflow-hidden", children: _jsx(ReportFeedbackList, {}) })) : null] })] })) : null, anchorSide === "right" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null] })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map