import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "../../../components/panel/PanelDropdownMenu.js";
export function AskAiCopyDropdown({ items, trigger, align = "left", menuClassName }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const handleSelect = (item) => {
        if (item.disabled) {
            return;
        }
        void Promise.resolve(item.onSelect())
            .then(() => {
            setCopied(true);
            setMenuOpen(false);
            window.setTimeout(() => setCopied(false), 1500);
        })
            .catch(() => {
            setCopied(false);
        });
    };
    return (_jsx(PanelDropdownMenu, { open: menuOpen, onClose: () => setMenuOpen(false), align: align, menuClassName: menuClassName, trigger: trigger({
            open: menuOpen,
            copied,
            toggle: () => setMenuOpen((current) => !current),
        }), children: items.map((item) => (_jsx(PanelDropdownMenuItem, { disabled: item.disabled, onClick: () => handleSelect(item), children: item.label }, item.id))) }));
}
//# sourceMappingURL=AskAiCopyDropdown.js.map