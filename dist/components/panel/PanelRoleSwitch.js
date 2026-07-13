import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { PANEL_ROLE_VALUES } from "../../constants/panelRole.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronDownIcon } from "../../components/icons/Icons.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
export function PanelRoleSwitch() {
    const { panelRole, setPanelRole, messages } = useReport();
    const [open, setOpen] = useState(false);
    const roleLabels = messages.panel.roles;
    const handleSelect = (role) => {
        setPanelRole(role);
        setOpen(false);
    };
    return (_jsx(PanelDropdownMenu, { open: open, onClose: () => setOpen(false), trigger: _jsx(HoverTooltip, { label: messages.panel.roleSwitchAriaLabel, className: "h-full", children: _jsxs("button", { type: "button", "aria-haspopup": "menu", "aria-expanded": open, "aria-label": messages.panel.roleSwitchAriaLabel, onPointerDown: (event) => {
                    event.stopPropagation();
                    setOpen((current) => !current);
                }, className: `flex h-full shrink-0 items-center gap-[2px] px-[8px] text-[12px] font-semibold ${open ? "hover:bg-[#bc3110] bg-[#f6562f]" : "hover:bg-[var(--adaptive-black50)]"}`, children: [_jsx("span", { className: `${open ? "text-[var(--adaptive-black50)]" : "text-[var(--adaptive-black900)]"} max-w-[72px] truncate`, children: roleLabels[panelRole] }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 transition-transform ${open ? "rotate-180" : ""}` })] }) }), children: PANEL_ROLE_VALUES.map((role) => (_jsx(PanelDropdownMenuItem, { active: role === panelRole, onClick: () => handleSelect(role), children: roleLabels[role] }, role))) }));
}
//# sourceMappingURL=PanelRoleSwitch.js.map