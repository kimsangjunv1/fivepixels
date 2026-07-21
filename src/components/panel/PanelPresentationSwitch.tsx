import { useState } from "react";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { formatPresentationViewerLabel } from "@/utils/report/reportTeam.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";

export function PanelPresentationSwitch() {
    const { isPresentationMode, presentationViewers, messages } = useReportPreferences();
    const { presentationViewerId, setPresentationViewerId } = useReportSession();
    const [open, setOpen] = useState(false);

    if (!isPresentationMode || presentationViewers.length === 0) {
        return null;
    }

    const activeViewer =
        presentationViewers.find((viewer) => viewer.id === presentationViewerId) ?? presentationViewers[0];
    const activeLabel = activeViewer
        ? activeViewer.isCreator
            ? `${formatPresentationViewerLabel(activeViewer)} (${messages.author.creatorLabel})`
            : formatPresentationViewerLabel(activeViewer)
        : "";

    const handleSelect = (viewerId: string) => {
        void setPresentationViewerId(viewerId);
        setOpen(false);
    };

    return (
        <PanelDropdownMenu
            open={open}
            onClose={() => setOpen(false)}
            trigger={
                <HoverTooltip label={messages.panel.presentationSwitchAriaLabel}>
                    <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={open}
                        aria-label={messages.panel.presentationSwitchAriaLabel}
                        onPointerDown={(event) => {
                            event.stopPropagation();
                            setOpen((current) => !current);
                        }}
                        className={`flex h-[24px] shrink-0 items-center gap-[2px] rounded-[8px] px-[8px] text-[12px] font-semibold text-[var(--adaptive-black900)] ${open ? "bg-[var(--adaptive-black100)]" : "bg-[var(--adaptive-black300)]"}`}
                    >
                        <span className="max-w-[96px] truncate">{activeLabel}</span>
                        <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                </HoverTooltip>
            }
        >
            {presentationViewers.map((viewer) => {
                const label = viewer.isCreator
                    ? `${formatPresentationViewerLabel(viewer)} (${messages.author.creatorLabel})`
                    : formatPresentationViewerLabel(viewer);
                const disabled = !viewer.privateKey;

                return (
                    <PanelDropdownMenuItem
                        key={viewer.id}
                        active={viewer.id === activeViewer?.id}
                        disabled={disabled}
                        onClick={() => {
                            if (disabled) {
                                return;
                            }

                            handleSelect(viewer.id);
                        }}
                    >
                        {label}
                    </PanelDropdownMenuItem>
                );
            })}
        </PanelDropdownMenu>
    );
}
