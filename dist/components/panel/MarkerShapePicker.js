import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MARKER_SHAPE_VALUES } from "../../constants/markerAppearance.js";
import { CheckIcon } from "../../components/icons/Icons.js";
function ShapePreview({ shape }) {
    if (shape === "square") {
        return _jsx("span", { className: "block h-[14px] w-[14px] rounded-[3px] bg-[var(--adaptive-blue500)]" });
    }
    if (shape === "pill") {
        return _jsx("span", { className: "block h-[10px] w-[18px] rounded-full bg-[var(--adaptive-blue500)]" });
    }
    if (shape === "pin") {
        return (_jsx("span", { className: "block h-[16px] w-[12px] bg-[var(--adaptive-blue500)]", style: { clipPath: "polygon(50% 100%, 6% 42%, 6% 8%, 94% 8%, 94% 42%)" } }));
    }
    return _jsx("span", { className: "block h-[14px] w-[14px] rounded-full bg-[var(--adaptive-blue500)]" });
}
export function MarkerShapePicker({ value, onChange, labels, ariaLabel }) {
    return (_jsx("div", { role: "radiogroup", "aria-label": ariaLabel, className: "grid grid-cols-4 gap-[6px]", children: MARKER_SHAPE_VALUES.map((shape) => {
            const active = shape === value;
            return (_jsxs("button", { type: "button", role: "radio", "aria-checked": active, onClick: () => onChange(shape), className: `group relative flex flex-col items-center gap-[5px] rounded-[8px] p-[4px] transition-colors ${active
                    ? "ring-2 ring-[var(--adaptive-blue500)] ring-offset-1 ring-offset-[var(--adaptive-black50)]"
                    : "ring-1 ring-[var(--adaptive-black200)] hover:ring-[var(--adaptive-black300)]"}`, children: [_jsxs("div", { className: "relative flex h-[28px] w-full items-center justify-center rounded-[5px] bg-[var(--adaptive-black100)]", children: [_jsx(ShapePreview, { shape: shape }), active ? (_jsx("span", { className: "absolute right-[2px] bottom-[2px] flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-white", children: _jsx(CheckIcon, { className: "h-[7px] w-[7px]" }) })) : null] }), _jsx("span", { className: `w-full truncate text-center text-[9px] leading-[1.2] ${active
                            ? "font-semibold text-[var(--adaptive-blue500)]"
                            : "font-medium text-[var(--adaptive-black600)] group-hover:text-[var(--adaptive-black800)]"}`, children: labels[shape] })] }, shape));
        }) }));
}
//# sourceMappingURL=MarkerShapePicker.js.map