import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CloseIcon, ChevronDownIcon } from "../../components/icons/Icons.js";
import { FloatingWindow } from "../../components/ui/FloatingWindow.js";
import { PIN_RAIL_EXPANDED_WIDTH } from "../../constants/overlayChrome.js";
import { MOTION } from "../../constants/motionClasses.js";
import { useReportData, useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { formatFeedbackCaseId } from "../../utils/feedback/feedbackCaseId.js";
import { getPinnedFeedbackCaseProgress } from "../../utils/pinned/pinnedFeedback.js";
function CircularProgress({ progress, size = 30, showPercentLabel = false }) {
    const { messages } = useReportPreferences();
    const strokeWidth = showPercentLabel ? 1.5 : 1.3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress.percentage / 100) * circumference;
    const labelSize = Math.max(9, Math.round(size * 0.28));
    return (_jsxs("span", { className: "relative inline-flex shrink-0 items-center justify-center", style: { width: size, height: size }, role: "img", "aria-label": messages.pins.progressAriaLabel(progress.resolved, progress.total, progress.percentage), children: [_jsxs("svg", { viewBox: `0 0 ${size} ${size}`, className: "h-full w-full -rotate-90", "aria-hidden": true, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "var(--adaptive-black500)", strokeWidth: strokeWidth }), _jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "var(--adaptive-blue500)", strokeWidth: strokeWidth, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, className: "transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" })] }), showPercentLabel ? (_jsxs("span", { className: "absolute inset-0 flex items-center justify-center font-bold tabular-nums text-[var(--adaptive-blue500)]", style: { fontSize: `${labelSize}px` }, "aria-hidden": true, children: [progress.percentage, "%"] })) : null] }));
}
function PinRailCard({ item, index, onOpen, onRemove }) {
    const { messages } = useReportPreferences();
    const [pulsing, setPulsing] = useState(false);
    const handleOpen = () => {
        setPulsing(true);
        window.setTimeout(() => setPulsing(false), 180);
        onOpen(item);
    };
    return (_jsxs("div", { className: `${MOTION.pinCardEnter} group relative flex overflow-hidden rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] ${pulsing ? MOTION.pinCardPulse : ""}`, style: { animationDelay: `${index * 35}ms` }, children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleOpen, "aria-label": messages.pins.openPinAriaLabel, className: "flex min-w-0 flex-1 text-left transition-colors hover:bg-[var(--adaptive-black100)]", children: [_jsx("span", { className: "flex min-w-[72px] shrink-0 items-center justify-center border-r border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[8px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black900)]", children: item.fcNumber ? formatFeedbackCaseId(item.fcNumber) : "#FC-—" }), _jsx("span", { className: "min-w-0 flex-1 truncate px-[12px] py-[8px] pr-[28px] text-[11px] leading-[1.35] text-[var(--adaptive-black500)]", children: item.summary })] }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onRemove(item.reportId), "aria-label": messages.pins.removePinAriaLabel, className: "absolute right-[6px] top-1/2 z-[1] flex h-[20px] w-[20px] -translate-y-1/2 items-center justify-center rounded-[4px] text-[var(--adaptive-black400)] opacity-0 transition-opacity hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)] group-hover:opacity-100", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })] }));
}
function PinnedRouteAccordion({ group, collapsed, onToggle, onOpen, onRemove, }) {
    const { messages } = useReportPreferences();
    const expanded = !collapsed;
    return (_jsxs("section", { className: "flex flex-col gap-[6px]", children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: onToggle, "aria-expanded": expanded, "aria-label": messages.pins.routeToggleAriaLabel(group.pathname), className: "flex w-full items-center justify-between gap-[8px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[10px] py-[8px] text-left transition-colors hover:bg-[var(--adaptive-black200)]", children: [_jsxs("span", { className: "flex min-w-0 items-center gap-[7px]", children: [_jsx(CircularProgress, { progress: group.progress, size: 22 }), _jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block truncate text-[11px] font-semibold text-[var(--adaptive-black900)]", children: group.pathname }), _jsx("span", { className: "block text-[10px] tabular-nums text-[var(--adaptive-black500)]", children: messages.pins.completedCasesLabel(group.progress.resolved, group.progress.total) })] })] }), _jsx(ChevronDownIcon, { className: `h-[13px] w-[13px] shrink-0 text-[var(--adaptive-black500)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${expanded ? "rotate-180" : ""}` })] }), _jsx("div", { className: MOTION.pinRailBody, "data-expanded": expanded ? "true" : "false", children: _jsx("div", { className: MOTION.pinRailBodyInner, children: _jsx("div", { className: "flex flex-col gap-[6px]", children: group.items.map((item, index) => (_jsx(PinRailCard, { item: item, index: index, onOpen: onOpen, onRemove: onRemove }, item.reportId))) }) }) })] }));
}
export function FloatingPinRail() {
    const { messages, pinnedFeedbackItems, pinRailCollapsed, pinRailPlacement, setPinRailCollapsed, setPinRailPlacement, unpinFeedback, syncPinnedFeedbackReports, isMobileViewport, } = useReportPreferences();
    const { openPinnedFeedback } = useReportSession();
    const { reports, allPageReports } = useReportData();
    const [entered, setEntered] = useState(false);
    const [collapsedRoutes, setCollapsedRoutes] = useState(() => new Set());
    const hasPins = pinnedFeedbackItems.length > 0;
    const [mode, setMode] = useState(() => (pinRailCollapsed ? "minimized" : "normal"));
    useEffect(() => {
        setMode((current) => {
            if (pinRailCollapsed) {
                return "minimized";
            }
            return current === "minimized" ? "normal" : current;
        });
    }, [pinRailCollapsed]);
    const handleModeChange = useCallback((next) => {
        setMode(next);
        setPinRailCollapsed(next === "minimized");
    }, [setPinRailCollapsed]);
    const enrichedItems = useMemo(() => {
        const reportById = new Map([...allPageReports, ...reports].map((report) => [report.id, report]));
        return [...pinnedFeedbackItems].reverse().map((item) => {
            const report = reportById.get(item.reportId);
            if (!report) {
                return item;
            }
            return {
                ...item,
                fcNumber: report.fc_number ?? item.fcNumber ?? null,
                pathname: report.pathname,
                cases: report.cases.map((caseItem) => ({
                    id: caseItem.id,
                    status: caseItem.status,
                })),
            };
        });
    }, [allPageReports, pinnedFeedbackItems, reports]);
    const routeGroups = useMemo(() => {
        const groups = new Map();
        for (const item of enrichedItems) {
            const current = groups.get(item.pathname);
            if (current) {
                current.push(item);
            }
            else {
                groups.set(item.pathname, [item]);
            }
        }
        return [...groups].map(([pathname, items]) => ({
            pathname,
            items,
            progress: getPinnedFeedbackCaseProgress(items),
        }));
    }, [enrichedItems]);
    const overallProgress = useMemo(() => getPinnedFeedbackCaseProgress(enrichedItems), [enrichedItems]);
    useEffect(() => {
        syncPinnedFeedbackReports([...allPageReports, ...reports]);
    }, [allPageReports, reports, syncPinnedFeedbackReports]);
    useEffect(() => {
        if (!hasPins) {
            setEntered(false);
            return;
        }
        const frame = window.requestAnimationFrame(() => setEntered(true));
        return () => window.cancelAnimationFrame(frame);
    }, [hasPins]);
    const handleOpen = (item) => {
        void openPinnedFeedback(item.reportId, {
            caseId: item.caseId,
            pathname: item.pathname,
        });
    };
    const handlePositionChange = useCallback((next) => {
        setPinRailPlacement(next);
    }, [setPinRailPlacement]);
    if (!hasPins || isMobileViewport) {
        return null;
    }
    return (_jsx(FloatingWindow, { dataChrome: "pin", className: entered ? MOTION.pinRailEnter : "", width: PIN_RAIL_EXPANDED_WIDTH, minWidth: 240, minHeight: 160, position: pinRailPlacement, onPositionChange: handlePositionChange, mode: mode, onModeChange: handleModeChange, resizable: true, resizeAriaLabel: messages.marker.resizeAriaLabel, contentClassName: "px-[12px] pb-[12px]", ariaLabel: messages.pins.railTitle, controls: {
            onClose: () => handleModeChange("minimized"),
            closeAriaLabel: messages.pins.railCollapseAriaLabel,
            minimizeAriaLabel: messages.pins.railCollapseAriaLabel,
            maximizeAriaLabel: messages.marker.windowMaximizeAriaLabel,
            restoreAriaLabel: messages.marker.windowRestoreAriaLabel,
        }, title: _jsxs("span", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: [messages.pins.railTitle, " ", messages.pins.railCountLabel(pinnedFeedbackItems.length), " (", overallProgress.percentage, "%)"] }), headerRight: _jsxs("span", { className: "flex items-center gap-[6px]", children: [_jsx(CircularProgress, { progress: overallProgress, size: 18, showPercentLabel: true }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: () => handleModeChange(mode === "minimized" ? "normal" : "minimized"), "aria-expanded": mode !== "minimized", "aria-label": mode === "minimized" ? messages.pins.railExpandAriaLabel : messages.pins.railCollapseAriaLabel, title: messages.pins.repositionTitle, className: "flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-[var(--adaptive-black500)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${mode === "minimized" ? "" : "rotate-180"}` }) })] }), children: _jsx("div", { className: `flex flex-col gap-[10px] ${mode === "maximized" ? "h-full overflow-y-auto" : "max-h-[min(60vh,520px)] overflow-y-auto"}`, children: routeGroups.map((group) => (_jsx(PinnedRouteAccordion, { group: group, collapsed: collapsedRoutes.has(group.pathname), onToggle: () => {
                    setCollapsedRoutes((current) => {
                        const next = new Set(current);
                        if (next.has(group.pathname)) {
                            next.delete(group.pathname);
                        }
                        else {
                            next.add(group.pathname);
                        }
                        return next;
                    });
                }, onOpen: handleOpen, onRemove: unpinFeedback }, group.pathname))) }) }));
}
//# sourceMappingURL=FloatingPinRail.js.map