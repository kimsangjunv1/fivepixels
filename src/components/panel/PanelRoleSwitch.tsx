import { useState } from "react";
import { PANEL_ROLE_VALUES, type PanelRole } from "@/constants/panelRole.js";
import { useReport } from "@/providers/reportContext.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";

export function PanelRoleSwitch() {
    const { panelRole, setPanelRole, messages } = useReport();
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
                <HoverTooltip label={messages.panel.roleSwitchAriaLabel}>
                    <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={open}
                        aria-label={messages.panel.roleSwitchAriaLabel}
                        onPointerDown={(event) => {
                            event.stopPropagation();
                            setOpen((current) => !current);
                        }}
                        className={`flex h-[24px] shrink-0 items-center gap-[2px] rounded-[8px] px-[8px] text-[12px] font-semibold text-[var(--adaptive-black900)] ${open ? "bg-[var(--adaptive-black100)]" : "bg-[var(--adaptive-black300)]"}`}
                    >
                        <span className="max-w-[72px] truncate">{roleLabels[panelRole]}</span>
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
