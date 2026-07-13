import { jsx as _jsx } from "react/jsx-runtime";
import { HoverTooltip } from "./HoverTooltip.js";
const ICON_BUTTON_BASE_CLASS = "flex items-center justify-center text-[var(--adaptive-black900)] disabled:cursor-not-allowed disabled:opacity-50 px-[6px]";
export function IconTooltipButton({ label, active = false, disabled = false, onClick, children, className = "" }) {
    return (_jsx(HoverTooltip, { label: label, disabled: disabled, className: "h-[inherit]", children: _jsx("button", { type: "button", "aria-label": label, "aria-pressed": active, disabled: disabled, onPointerDown: (e) => {
                e.stopPropagation();
                onClick();
            }, className: `${ICON_BUTTON_BASE_CLASS} shrink-0 ${active ? "hover:bg-[#bc3110] bg-[#f6562f]" : "hover:bg-[var(--adaptive-black50)]"} ${className}`, children: children }) }));
}
//# sourceMappingURL=IconTooltipButton.js.map