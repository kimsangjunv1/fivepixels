import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { LogoIcon } from "./../icons/LogoIcon.js";
import { motion } from "../motion/index.js";
function PanelCollapseTab({ collapsed, anchorSide, onClick }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    return (_jsx("button", { type: "button", onClick: onClick, className: "", "aria-expanded": !collapsed, "aria-label": collapsed ? "패널 펼치기" : "패널 숨기기", title: collapsed ? "패널 펼치기" : "패널 숨기기", children: collapsed ? expandIcon : hideIcon }));
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
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), _jsxs(motion.div, { ref: panelRef, layout: true, layoutId: "asdwsww", className: "pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] rounded-[16px] p-[4px] bg-[var(--adaptive-whiteOpacity100)] backdrop-blur-[30px] gap-[4px] shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]", 
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] rounded-[16px] p-[4px] bg-[var(--adaptive-greyOpacity100)] backdrop-blur-[30px] flex-col shadow-[0_0_120px_0_var(--adaptive-greyOpacity500)]"
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] w-[320px] flex-col"
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg shadow-lg"
                // className="pointer-events-auto fixed z-[1000000] flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-[var(--adaptive-grey50)] shadow-lg"
                // className={
                //     panelCollapsed
                //         ? "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[40px] w-[320px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-slate-50/90 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90"
                //         : "pointer-events-auto fixed z-30 flex max-h-[80vh] min-h-[160px] w-[360px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900"
                // }
                style: panelStyle, children: [anchorSide === "left" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null, !panelCollapsed ? (_jsxs("section", { className: "flex flex-1 flex-col gap-[4px]", children: [_jsxs("section", { className: "flex items-center gap-[4px] justify-center", children: [_jsx(LogoIcon, { className: "w-[18px]" }), _jsx("p", { className: "text-[#E26909] font-[900]", children: "Radar\u00B0" })] }), _jsxs("section", { className: "flex flex-col gap-[16px]", children: [_jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsxs("section", { className: "flex items-center cursor-move gap-[8px] bg-[var(--adaptive-grey50)] shadow-[var(--shadow-normal)] rounded-[12px] p-[8px_12px]", 
                                                // className="flex cursor-move flex-col gap-0.5 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/80"
                                                onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", style: isDragging ? { opacity: 0.8 } : undefined, children: [_jsxs("section", { className: "flex flex-col items-center gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-grey500)] text-left", children: "status" }), _jsx("p", { className: "text-[14px] text-[var(--adaptive-green900)]", children: "ready." })] }), _jsxs("section", { className: "flex flex-col items-center gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-grey500)] text-left", children: "status" }), _jsxs("p", { className: "text-[14px] text-[var(--adaptive-greyOpacity600)] whitespace-break-spaces", children: [helperText, "ea"] })] })] }), _jsxs("section", { className: "flex items-center justify-end gap-[12px] px-[16px]", children: [_jsxs("section", { className: "flex items-center gap-[8px]", children: [_jsxs("button", { type: "button", onClick: toggleReportMode, className: `flex items-center gap-[4px]`, children: [_jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-grey700)]", children: mode === "report" ? "Stop" : "Record" }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleReportMode, visible: visibleShortcutKeys })] }), _jsxs("button", { type: "button", onClick: toggleViewMode, className: "flex items-center gap-[4px]", children: [_jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-grey700)]", children: showListSection ? "off" : "list" }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleViewMode, visible: visibleShortcutKeys })] })] }), _jsx("div", { className: "h-[12px] w-[1px] bg-[var(--adaptive-grey400)]" }), _jsxs("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", "aria-label": showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", title: showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", className: "flex items-center gap-[4px]", children: [_jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-grey700)]", children: "X-Ray" }), _jsx(ShortcutHint, { binding: REPORT_SHORTCUTS.toggleTargetPreview, visible: visibleShortcutKeys })] })] })] }), showListSection ? (_jsxs("section", { className: "flex flex-1 flex-col gap-[16px]", children: [errorMessage ? (_jsx("p", { className: "mt-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200", children: errorMessage })) : null, _jsx(ReportFeedbackList, {})] })) : null] })] })) : null, anchorSide === "right" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null] })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map