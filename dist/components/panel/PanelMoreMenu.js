import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { SettingsIcon } from "../../components/icons/SettingsIcon.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
const LOCALE_OPTIONS = ["en", "ko"];
export function PanelMoreMenu({ open, transferDisabled = false, appearance, onAppearanceChange, onToggle, onClose, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, }) {
    const { locale, setLocale, messages } = useReport();
    const appearanceOptions = ["system", "light", "dark"].map((value) => ({
        value,
        label: messages.appearance[value],
    }));
    const localeOptions = LOCALE_OPTIONS.map((value) => ({
        value,
        label: messages.localeOption[value],
    }));
    return (_jsxs(PanelDropdownMenu, { open: open, onClose: onClose, trigger: _jsx("button", { type: "button", onClick: onToggle, "aria-expanded": open, "aria-haspopup": "menu", className: `flex h-full items-center justify-center gap-[4px] px-[12px_16px] py-[0px] text-[var(--adaptive-black700)] hover:text-[var(--adaptive-black900)] disabled:cursor-not-allowed disabled:opacity-50 ${open ? "bg-[var(--adaptive-grey200)]" : "bg-transparent"}`, children: _jsx(SettingsIcon, { className: `${open ? "rotate-45" : ""} w-[16px] transition-transform` }) }), children: [_jsx(PanelDropdownMenuItem, { disabled: transferDisabled, onClick: onImport, children: messages.moreMenu.import }), _jsx(PanelDropdownMenuItem, { disabled: transferDisabled, onClick: onExport, children: messages.moreMenu.export }), _jsx(PanelDropdownMenuItem, { disabled: !hasPersonalKey, onClick: onPublicKeyCopy, children: messages.moreMenu.publicKeyCopy }), _jsx(PanelDropdownMenuItem, { disabled: !hasPersonalKey, onClick: onKeyCopy, children: messages.moreMenu.keyCopy }), _jsx(PanelDropdownMenuItem, { onClick: onKeyInsert, children: messages.moreMenu.keyInsert }), _jsx(PanelDropdownMenuItem, { disabled: !hasPersonalKey, onClick: onKeyRotate, children: messages.moreMenu.keyRotate }), _jsx("div", { className: "w-full h-[1px] bg-[var(--adaptive-black300)]" }), _jsxs("div", { className: "px-[12px] py-[8px]", children: [_jsx("p", { className: "mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: messages.moreMenu.theme }), _jsx(PanelOptionSwitch, { options: appearanceOptions, value: appearance, onChange: onAppearanceChange, ariaLabel: messages.moreMenu.themeAriaLabel })] }), _jsxs("div", { className: "px-[12px] py-[8px]", children: [_jsx("p", { className: "mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: messages.moreMenu.language }), _jsx(PanelOptionSwitch, { options: localeOptions, value: locale, onChange: setLocale, ariaLabel: messages.moreMenu.languageAriaLabel })] }), _jsx("div", { className: "w-full h-[1px] bg-[var(--adaptive-black300)]" }), _jsx(PanelDropdownMenuItem, { disabled: transferDisabled, onClick: onCommand, children: messages.moreMenu.command })] }));
}
//# sourceMappingURL=PanelMoreMenu.js.map