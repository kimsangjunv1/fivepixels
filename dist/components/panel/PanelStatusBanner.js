import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
function BannerDivider() {
    return _jsx("span", { className: "shrink-0 text-[11px] text-white/50", children: "|" });
}
/**
 * Shared panel notice bar: message on the left, action controls on the right.
 */
export function PanelStatusBanner({ message, actions, leading, trailing, roundedTop = false }) {
    return (_jsxs("section", { className: `flex shrink-0 items-center gap-[8px] bg-[var(--adaptive-black900)] px-[10px] py-[6px] text-[var(--adaptive-black50)] ${roundedTop ? "rounded-t-[12px]" : ""}`, "data-fivepixels-interactive": "", children: [leading, _jsx("p", { className: "min-w-0 flex-1 truncate text-[11px] font-semibold leading-[1.3] text-[var(--adaptive-black50)]", children: message }), actions.length > 0 ? (_jsxs(_Fragment, { children: [_jsx(BannerDivider, {}), _jsx("div", { className: "flex shrink-0 items-center gap-[6px]", children: actions.map((action, index) => (_jsxs("div", { className: "flex items-center gap-[6px]", children: [index > 0 ? _jsx(BannerDivider, {}) : null, _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": action.ariaLabel ?? action.label, title: action.title ?? action.label, disabled: action.disabled, "aria-pressed": action.active, onClick: action.onClick, className: `inline-flex shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black50)] text-[11px] font-semibold transition-opacity enabled:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35 ${action.children ? "p-[2px]" : "px-[4px] py-[1px]"} ${action.active ? "bg-white/20 underline underline-offset-2" : "underline-offset-2 hover:underline"}`, children: action.children ?? action.label })] }, action.id))) })] })) : null, trailing] }));
}
//# sourceMappingURL=PanelStatusBanner.js.map