import { useState } from "react";
import { PANEL_ROLE_VALUES, type PanelRole } from "@/constants/panelRole.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";

export function PanelRoleSwitch() {
    const { panelRole, setPanelRole, messages } = useReportPreferences();
    const [open, setOpen] = useState(false);
    const roleLabels = messages.panel.roles;

    const handleSelect = (role: PanelRole) => {
        setPanelRole(role);
        setOpen(false);
    };

    return (
        <PanelDropdownMenu
            open={open}
            onClose={() => setOpen(false)}
            trigger={
                <HoverTooltip
                    label={messages.panel.roleSwitchAriaLabel}
                    className="h-full"
                >
                    <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={open}
                        aria-label={messages.panel.roleSwitchAriaLabel}
                        onPointerDown={(event) => {
                            event.stopPropagation();
                            setOpen((current) => !current);
                        }}
                        className={`flex h-full shrink-0 items-center gap-[2px] px-[8px] text-[12px] font-semibold ${open ? "hover:bg-[#bc3110] bg-[#f6562f]" : "hover:bg-[var(--adaptive-black50)]"}`}
                    >
                        <span className={`${open ? "text-[var(--adaptive-black50)]" : "text-[var(--adaptive-black900)]"} max-w-[72px] truncate`}>{roleLabels[panelRole]}</span>
                        <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                </HoverTooltip>
            }
        >
            {PANEL_ROLE_VALUES.map((role) => (
                <PanelDropdownMenuItem
                    key={role}
                    active={role === panelRole}
                    onClick={() => handleSelect(role)}
                >
                    {roleLabels[role]}
                </PanelDropdownMenuItem>
            ))}
        </PanelDropdownMenu>
    );
}
