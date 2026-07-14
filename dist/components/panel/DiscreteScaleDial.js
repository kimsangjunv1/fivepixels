import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DiscreteScaleDial({ values, value, onChange, labels, ariaLabel }) {
    const index = Math.max(0, values.indexOf(value));
    return (_jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsx("input", { type: "range", min: 0, max: values.length - 1, step: 1, value: index, "aria-label": ariaLabel, onChange: (event) => {
                    const next = values[Number(event.target.value)];
                    if (next) {
                        onChange(next);
                    }
                }, className: "h-[4px] w-full cursor-pointer appearance-none rounded-full bg-[var(--adaptive-black200)] accent-[var(--adaptive-blue500)]" }), _jsx("div", { className: "grid gap-[4px]", style: { gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }, children: values.map((scale) => {
                    const active = scale === value;
                    return (_jsx("span", { className: `text-center text-[10px] leading-[1.2] ${active ? "font-semibold text-[var(--adaptive-blue500)]" : "font-medium text-[var(--adaptive-black500)]"}`, children: labels[scale] }, scale));
                }) })] }));
}
//# sourceMappingURL=DiscreteScaleDial.js.map