import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { ThemePreviewSkeleton } from "./ThemePreviewSkeleton.js";
export function AppearanceThemePicker({ options, value, onChange, disabled = false, ariaLabel, previewKind = "panel" }) {
    const handleKeyDown = useCallback((event, index) => {
        if (disabled) {
            return;
        }
        let nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            nextIndex = (index + 1) % options.length;
        }
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            nextIndex = (index - 1 + options.length) % options.length;
        }
        if (nextIndex === null) {
            return;
        }
        event.preventDefault();
        onChange(options[nextIndex].value);
    }, [disabled, onChange, options]);
    return (_jsx("div", { role: "radiogroup", "aria-label": ariaLabel, className: "grid grid-cols-3 gap-[8px]", children: options.map((option, index) => {
            const active = option.value === value;
            return (_jsxs("button", { type: "button", role: "radio", "aria-checked": active, disabled: disabled, onClick: () => onChange(option.value), onKeyDown: (event) => handleKeyDown(event, index), className: "group flex flex-col items-center gap-[6px] disabled:cursor-not-allowed disabled:opacity-50", children: [_jsx("div", { className: `aspect-[5/4] w-full overflow-hidden rounded-[12px] transition-[box-shadow] ${active ? "shadow-[0_0_0_1.5px_#111113]" : "shadow-[0_0_0_1px_transparent] group-hover:shadow-[0_0_0_1px_var(--adaptive-black300)]"}`, children: _jsx(ThemePreviewSkeleton, { variant: option.value, kind: previewKind }) }), _jsx("span", { className: `w-full truncate text-center text-[12px] leading-[1.5] ${active ? "font-semibold text-[var(--adaptive-black900)]" : "font-medium text-[var(--adaptive-black600)] group-hover:text-[var(--adaptive-black800)]"}`, children: option.label })] }, option.value));
        }) }));
}
//# sourceMappingURL=AppearanceThemePicker.js.map