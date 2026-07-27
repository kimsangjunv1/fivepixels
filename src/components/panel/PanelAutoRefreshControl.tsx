import { useState } from "react";
import { PANEL_AUTO_REFRESH_INTERVAL_MINUTES, type PanelAutoRefreshIntervalMinutes } from "@/constants/panelAutoRefresh.js";
import { usePanelAutoRefresh } from "@/hooks/usePanelAutoRefresh.js";
import { ChevronDownIcon, RefreshIcon, StopIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { useReport } from "@/providers/reportContext.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";

function formatIntervalLabel(minutes: PanelAutoRefreshIntervalMinutes, messages: ReturnType<typeof useReport>["messages"]) {
    if (minutes === 0) {
        return messages.panel.autoRefreshOff;
    }

    if (minutes === 1) {
        return messages.panel.autoRefreshEveryMinute;
    }

    return messages.panel.autoRefreshEveryMinutes(minutes);
}

export function PanelAutoRefreshControl() {
    const { messages, refetch, isFetching } = useReport();
    const { intervalMinutes, setIntervalMinutes, isAutoRefreshEnabled, progress, remainingLabel, stopAutoRefresh, refreshNow } = usePanelAutoRefresh({
        refetch,
        isFetching,
    });
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSelect = (minutes: PanelAutoRefreshIntervalMinutes) => {
        setIntervalMinutes(minutes);
        setMenuOpen(false);
    };

    const actionLabel = isAutoRefreshEnabled ? messages.panel.stopAutoRefresh : messages.panel.refresh;

    return (
        <div className="flex h-full shrink-0 items-center px-[4px]">
            <div
                className={`relative flex h-[24px] items-stretch rounded-[8px] ${
                    isAutoRefreshEnabled ? "bg-[var(--adaptive-black300)] text-[var(--adaptive-black50)]" : "bg-[var(--adaptive-black300)] text-[var(--adaptive-black900)]"
                }`}
            >
                <HoverTooltip
                    label={actionLabel}
                    className="h-full"
                >
                    <button
                        type="button"
                        aria-label={actionLabel}
                        disabled={!isAutoRefreshEnabled && isFetching}
                        onPointerDown={(event) => {
                            event.stopPropagation();

                            if (isAutoRefreshEnabled) {
                                stopAutoRefresh();
                                return;
                            }

                            refreshNow();
                        }}
                        className={`flex h-full shrink-0 items-center justify-center rounded-l-[8px] disabled:cursor-not-allowed disabled:opacity-50 ${
                            isAutoRefreshEnabled ? "px-[6px] hover:bg-[var(--adaptive-black600)]" : "px-[6px] hover:bg-[var(--adaptive-black400)]"
                        }`}
                    >
                        {isAutoRefreshEnabled ? <StopIcon className="h-[14px] w-[14px]" /> : <RefreshIcon className={`h-[14px] w-[14px] ${isFetching ? "animate-spin" : ""}`} />}
                    </button>
                </HoverTooltip>

                {isAutoRefreshEnabled ? (
                    <span
                        className="flex h-full items-center pr-[2px] font-mono text-[11px] font-semibold tabular-nums leading-none tracking-tight"
                        aria-live="polite"
                    >
                        {remainingLabel}
                    </span>
                ) : null}

                <PanelDropdownMenu
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    trigger={
                        <HoverTooltip
                            label={messages.panel.autoRefreshIntervalAriaLabel}
                            className="h-full"
                        >
                            <button
                                type="button"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                aria-label={messages.panel.autoRefreshIntervalAriaLabel}
                                onPointerDown={(event) => {
                                    event.stopPropagation();
                                    setMenuOpen((current) => !current);
                                }}
                                className={`flex h-full shrink-0 items-center rounded-r-[8px] px-[4px] ${
                                    isAutoRefreshEnabled ? "hover:bg-[var(--adaptive-black600)]" : "hover:bg-[var(--adaptive-black400)]"
                                }`}
                            >
                                <ChevronDownIcon className={`h-[12px] w-[12px] shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                            </button>
                        </HoverTooltip>
                    }
                >
                    {PANEL_AUTO_REFRESH_INTERVAL_MINUTES.map((minutes) => (
                        <PanelDropdownMenuItem
                            key={minutes}
                            active={minutes === intervalMinutes}
                            onClick={() => handleSelect(minutes)}
                        >
                            {formatIntervalLabel(minutes, messages)}
                        </PanelDropdownMenuItem>
                    ))}
                </PanelDropdownMenu>

                {isAutoRefreshEnabled ? (
                    <div
                        className="pointer-events-none absolute left-[33%] transform w-[40%] bottom-[2px] h-[2px] overflow-hidden rounded-b-[8px] bg-[var(--adaptive-black600)]"
                        aria-hidden="true"
                    >
                        <div
                            className="h-full bg-[#f6562f]"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
