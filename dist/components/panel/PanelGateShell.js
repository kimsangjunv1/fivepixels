import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PANEL_GATE_SECTION_CLASS = "flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px] rounded-[0_0_12px_12px]";
export const PANEL_GATE_TITLE_CLASS = "text-[14px] font-bold text-[var(--adaptive-black900)]";
export const PANEL_GATE_DESCRIPTION_CLASS = "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]";
export const PANEL_GATE_PRIMARY_BUTTON_CLASS = "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50";
export const PANEL_GATE_SECONDARY_BUTTON_CLASS = "rounded-[8px] bg-[var(--adaptive-grey300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]";
export const PANEL_GATE_BACK_BUTTON_CLASS = "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]";
export function PanelGateShell({ title, description, children, footer }) {
    return (_jsxs("section", { className: PANEL_GATE_SECTION_CLASS, children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: title }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: description })] }), children, footer] }));
}
export function PanelGateButton({ variant = "primary", className = "", ...props }) {
    const variantClass = variant === "secondary" ? PANEL_GATE_SECONDARY_BUTTON_CLASS : variant === "back" ? PANEL_GATE_BACK_BUTTON_CLASS : PANEL_GATE_PRIMARY_BUTTON_CLASS;
    return (_jsx("button", { type: "button", className: `${variantClass} ${className}`.trim(), ...props }));
}
//# sourceMappingURL=PanelGateShell.js.map