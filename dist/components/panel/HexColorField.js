import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { displayToHex, getHexColorPreview, hexToColorInputValue, hexToDisplay, sanitizeHexDisplayInput } from "../../utils/hexColor.js";
export function HexColorField({ label, value, onChange, placeholder = "ededed" }) {
    const colorInputRef = useRef(null);
    const [displayValue, setDisplayValue] = useState(() => hexToDisplay(value));
    const preview = getHexColorPreview(value);
    useEffect(() => {
        setDisplayValue(hexToDisplay(value));
    }, [value]);
    const commitDisplayValue = (raw) => {
        const sanitized = sanitizeHexDisplayInput(raw);
        setDisplayValue(sanitized);
        if (sanitized.length === 6) {
            const hex = displayToHex(sanitized);
            if (hex) {
                onChange(hex);
            }
        }
    };
    return (_jsxs("label", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: label }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsxs("button", { type: "button", onClick: () => colorInputRef.current?.click(), className: "relative h-[30px] w-[30px] shrink-0 overflow-hidden rounded-[8px] border border-[var(--adaptive-border-subtle)]", "aria-label": label, children: [_jsx("span", { className: "absolute inset-0", style: { backgroundColor: preview ?? "transparent" }, "aria-hidden": true }), _jsx("input", { ref: colorInputRef, type: "color", value: hexToColorInputValue(value), onChange: (event) => onChange(event.target.value), className: "absolute inset-0 h-full w-full cursor-pointer opacity-0", tabIndex: -1 })] }), _jsx("input", { type: "text", value: displayValue, onChange: (event) => commitDisplayValue(event.target.value), placeholder: placeholder, className: "min-w-0 flex-1 rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] font-[var(--coding-font)] text-[12px] uppercase text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" })] })] }));
}
//# sourceMappingURL=HexColorField.js.map