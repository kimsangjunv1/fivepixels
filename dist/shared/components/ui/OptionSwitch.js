import { jsx as _jsx } from "react/jsx-runtime";
export function OptionSwitch({ options, value, onChange, disabled = false, ariaLabel }) {
    return (_jsx("div", { role: "group", "aria-label": ariaLabel, className: "flex w-full overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] p-[2px]", children: options.map((option) => {
            const active = option.value === value;
            return (_jsx("button", { type: "button", role: "radio", "aria-checked": active, disabled: disabled, onClick: () => onChange(option.value), className: `min-w-0 flex-1 rounded-[8px] p-[4px] text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)]" : "text-[var(--adaptive-black300)] hover:text-[var(--adaptive-black800)]"}`, children: option.label }, option.value));
        }) }));
}
//# sourceMappingURL=OptionSwitch.js.map