import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SettingsIcon } from "../icons/SettingsIcon.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
export function PanelMoreMenu({ open, disabled = false, onToggle, onClose, onExport, onImport, onCommand }) {
    return (_jsxs(PanelDropdownMenu, { open: open, onClose: onClose, trigger: _jsx("button", { type: "button", disabled: disabled, onClick: onToggle, "aria-expanded": open, "aria-haspopup": "menu", className: `flex h-full items-center justify-center gap-[4px] px-[12px] py-[4px] disabled:cursor-not-allowed disabled:opacity-50 ${open ? "bg-[var(--adaptive-grey200)]" : "bg-transparent"}`, children: _jsx(SettingsIcon, { className: `${open ? "rotate-45" : ""} w-[18px] transition-transform` }) }), children: [_jsx(PanelDropdownMenuItem, { onClick: onImport, children: "import" }), _jsx(PanelDropdownMenuItem, { onClick: onExport, children: "export" }), _jsx("div", { className: "w-full h-[1px] bg-[var(--adaptive-black300)]" }), _jsx(PanelDropdownMenuItem, { onClick: onCommand, children: "command" })] }));
}
//# sourceMappingURL=PanelMoreMenu.js.map