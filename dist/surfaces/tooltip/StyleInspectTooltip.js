import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PointerFollowTooltip } from "./PointerFollowTooltip.js";
/** Label/value row used by feedback pick-target style tooltips. */
export function StyleInspectTooltipRow({ label, value, valueClassName = "" }) {
    return (_jsxs("div", { className: "flex items-start justify-between gap-[12px] text-[14px]", children: [_jsx("span", { className: "shrink-0 text-[var(--adaptive-black500)]", children: label }), _jsx("span", { className: `min-w-0 break-all text-right font-medium font-[var(--coding-font)] text-[var(--adaptive-black700)] ${valueClassName}`.trim(), children: value })] }));
}
/** Feedback pick-target style tooltip shell (surface, padding, row gap). */
export function StyleInspectTooltip({ open, pointer, children, className = "" }) {
    return (_jsx(PointerFollowTooltip, { open: open, pointer: pointer, className: className, children: _jsx("div", { className: "flex flex-col gap-[2px] text-left", children: children }) }));
}
//# sourceMappingURL=StyleInspectTooltip.js.map