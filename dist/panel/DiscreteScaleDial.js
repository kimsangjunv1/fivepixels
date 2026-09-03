import { jsx as _jsx } from "react/jsx-runtime";
export function DiscreteScaleDial({ values, value, onChange, labels, ariaLabel }) {
    return (_jsx("div", { role: "radiogroup", "aria-label": ariaLabel, className: "grid gap-[4px]", style: { gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }, children: values.map((scale) => {
            const active = scale === value;
            return (_jsx("button", { type: "button", role: "radio", "aria-checked": active, onClick: () => onChange(scale), className: `rounded-[6px] px-[2px] py-[6px] text-center text-[10px] leading-[1.2] transition-colors ${active
                    ? "bg-[var(--adaptive-blue500)] font-semibold text-white"
                    : "bg-[var(--adaptive-black100)] font-medium text-[var(--adaptive-black600)] ring-1 ring-[var(--adaptive-black200)] hover:bg-[var(--adaptive-black200)] hover:text-[var(--adaptive-black800)]"}`, children: labels[scale] }, scale));
        }) }));
}
//# sourceMappingURL=DiscreteScaleDial.js.map