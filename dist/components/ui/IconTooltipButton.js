import { jsx as _jsx } from "react/jsx-runtime";
import { HoverTooltip } from "./HoverTooltip.js";
const ICON_BUTTON_BASE_CLASS = "flex h-[24px] w-[24px] items-center justify-center rounded-[8px] text-[var(--adaptive-black900)] disabled:cursor-not-allowed disabled:opacity-50";
export function IconTooltipButton({ label, active = false, disabled = false, onClick, children, className = "" }) {
    return (_jsx(HoverTooltip, { label: label, disabled: disabled, children: _jsx("button", { type: "button", "aria-label": label, "aria-pressed": active, disabled: disabled, onClick: onClick, className: `${ICON_BUTTON_BASE_CLASS} shrink-0 ${active ? "bg-[var(--adaptive-black100)]" : "bg-[var(--adaptive-black300)]"} ${className}`, children: children }) }));
}
//# sourceMappingURL=IconTooltipButton.js.map