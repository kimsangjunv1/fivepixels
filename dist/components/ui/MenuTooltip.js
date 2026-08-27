import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { STYLE_TOOLTIP_SURFACE_CLASS } from "../../components/ui/PointerFollowTooltip.js";
import { MOTION } from "../../constants/motionClasses.js";
/** Shared icon size for menu-tooltip rows (matches pick-target context menu). */
export const MENU_TOOLTIP_ICON_CLASS = "h-[16px] w-[16px] shrink-0";
const MENU_TOOLTIP_SURFACE_BASE = `${STYLE_TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipIn}`;
const MENU_TOOLTIP_ITEM_CLASS = "flex w-full items-center gap-[8px] rounded-[8px] px-[4px] py-[4px] text-left text-[14px] font-medium leading-[1.45] text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50";
const MENU_TOOLTIP_ITEM_ACTIVE_CLASS = "bg-[var(--adaptive-black100)]";
const MENU_TOOLTIP_ITEM_DANGER_CLASS = "text-[var(--adaptive-accent-red)] hover:bg-[color-mix(in_srgb,var(--adaptive-accent-red)_10%,transparent)]";
const MENU_TOOLTIP_DIVIDER_CLASS = "my-[4px] h-px bg-[var(--adaptive-border-subtle)]";
/**
 * Shared menu-tooltip shell used by the pick-target right-click menu and panel dropdowns.
 */
export const MenuTooltipSurface = forwardRef(function MenuTooltipSurface({ children, className = "", style, positioning = "absolute", ...rest }, ref) {
    const positionClass = positioning === "fixed" ? "pointer-events-auto fixed z-[1000004]" : "absolute z-[20]";
    return (_jsx("div", { ref: ref, "data-fivepixels-interactive": "", style: style, className: `${positionClass} min-w-[160px] ${MENU_TOOLTIP_SURFACE_BASE} ${className}`, ...rest, children: children }));
});
export function MenuTooltipItem({ children, onClick, active = false, disabled = false, danger = false, icon, className = "", onPointerDown, "aria-pressed": ariaPressed }) {
    return (_jsxs("button", { type: "button", role: "menuitem", "data-fivepixels-interactive": "", disabled: disabled, "aria-pressed": ariaPressed ?? active, onPointerDown: onPointerDown, onClick: onClick, className: `${MENU_TOOLTIP_ITEM_CLASS} ${active ? MENU_TOOLTIP_ITEM_ACTIVE_CLASS : ""} ${danger ? MENU_TOOLTIP_ITEM_DANGER_CLASS : ""} ${className}`, children: [icon, children] }));
}
export function MenuTooltipDivider() {
    return (_jsx("div", { role: "separator", "aria-hidden": "true", className: MENU_TOOLTIP_DIVIDER_CLASS }));
}
//# sourceMappingURL=MenuTooltip.js.map