import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { PANEL_AUTO_REFRESH_INTERVAL_MINUTES } from "../constants/panelAutoRefresh.js";
import { usePanelAutoRefresh } from "../hooks/usePanelAutoRefresh.js";
import { ChevronDownIcon, RefreshIcon, StopIcon } from "../components/icons/Icons.js";
import { HoverTooltip } from "../tooltip/HoverTooltip.js";
import { useReportData, useReportPreferences } from "../providers/reportContext.js";
import { DropdownMenu, DropdownMenuItem } from "../components/ui/DropdownMenu.js";
function formatIntervalLabel(minutes, messages) {
    if (minutes === 0) {
        return messages.panel.autoRefreshOff;
    }
    if (minutes === 1) {
        return messages.panel.autoRefreshEveryMinute;
    }
    return messages.panel.autoRefreshEveryMinutes(minutes);
}
export function PanelAutoRefreshControl() {
    const { messages } = useReportPreferences();
    const { refetch, isFetching } = useReportData();
    const { intervalMinutes, setIntervalMinutes, isAutoRefreshEnabled, progress, remainingLabel, stopAutoRefresh, refreshNow } = usePanelAutoRefresh({
        refetch,
        isFetching,
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const handleSelect = (minutes) => {
        setIntervalMinutes(minutes);
        setMenuOpen(false);
    };
    const actionLabel = isAutoRefreshEnabled ? messages.panel.stopAutoRefresh : messages.panel.refresh;
    return (_jsx("div", { className: "flex h-full shrink-0 items-center px-[4px]", children: _jsxs("div", { className: `relative flex h-[24px] items-stretch rounded-[8px] border border-[var(--adaptive-border-subtle)] ${isAutoRefreshEnabled ? " text-[var(--adaptive-black50)]" : "text-[var(--adaptive-black900)]"}`, children: [_jsx(HoverTooltip, { label: actionLabel, className: "h-full", children: _jsx("button", { type: "button", "aria-label": actionLabel, disabled: !isAutoRefreshEnabled && isFetching, onPointerDown: (event) => {
                            event.stopPropagation();
                            if (isAutoRefreshEnabled) {
                                stopAutoRefresh();
                                return;
                            }
                            refreshNow();
                        }, className: `flex h-full shrink-0 items-center justify-center rounded-l-[8px] disabled:cursor-not-allowed disabled:opacity-50 ${isAutoRefreshEnabled ? "px-[6px] hover:bg-[var(--adaptive-black600)]" : "px-[6px] hover:bg-[var(--adaptive-black400)]"}`, children: isAutoRefreshEnabled ? _jsx(StopIcon, { className: "h-[14px] w-[14px]" }) : _jsx(RefreshIcon, { className: `h-[14px] w-[14px] ${isFetching ? "animate-spin" : ""}` }) }) }), isAutoRefreshEnabled ? (_jsx("span", { className: "flex h-full items-center pr-[2px] font-mono text-[11px] font-semibold tabular-nums leading-none tracking-tight", "aria-live": "polite", children: remainingLabel })) : null, _jsx(DropdownMenu, { open: menuOpen, onClose: () => setMenuOpen(false), trigger: _jsx(HoverTooltip, { label: messages.panel.autoRefreshIntervalAriaLabel, className: "h-full", children: _jsx("button", { type: "button", "aria-haspopup": "menu", "aria-expanded": menuOpen, "aria-label": messages.panel.autoRefreshIntervalAriaLabel, onPointerDown: (event) => {
                                event.stopPropagation();
                                setMenuOpen((current) => !current);
                            }, className: `flex h-full shrink-0 items-center rounded-r-[8px] px-[4px] ${isAutoRefreshEnabled ? "hover:bg-[var(--adaptive-black600)]" : "hover:bg-[var(--adaptive-black400)]"}`, children: _jsx(ChevronDownIcon, { className: `h-[12px] w-[12px] shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}` }) }) }), children: PANEL_AUTO_REFRESH_INTERVAL_MINUTES.map((minutes) => (_jsx(DropdownMenuItem, { active: minutes === intervalMinutes, onClick: () => handleSelect(minutes), children: formatIntervalLabel(minutes, messages) }, minutes))) }), isAutoRefreshEnabled ? (_jsx("div", { className: "pointer-events-none absolute left-[33%] transform w-[40%] bottom-[2px] h-[2px] overflow-hidden rounded-b-[8px] bg-[var(--adaptive-black600)]", "aria-hidden": "true", children: _jsx("div", { className: "h-full bg-[var(--adaptive-accent-coral)]", style: { width: `${Math.round(progress * 100)}%` } }) })) : null] }) }));
}
//# sourceMappingURL=PanelAutoRefreshControl.js.map