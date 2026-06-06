import { jsx as _jsx } from "react/jsx-runtime";
export function PanelOptionSwitch({ options, value, onChange, disabled = false, ariaLabel, }) {
    return (_jsx("div", { role: "group", "aria-label": ariaLabel, className: "flex w-full overflow-hidden rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black100)] p-[2px]", children: options.map((option) => {
            const active = option.value === value;
            return (_jsx("button", { type: "button", role: "radio", "aria-checked": active, disabled: disabled, onClick: () => onChange(option.value), className: `min-w-0 flex-1 rounded-[6px] px-[6px] py-[4px] text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active
                    ? "bg-[var(--adaptive-grey200)] text-[var(--adaptive-black900)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                    : "text-[var(--adaptive-black600)] hover:text-[var(--adaptive-black800)]"}`, children: option.label }, option.value));
        }) }));
}
//# sourceMappingURL=PanelOptionSwitch.js.map