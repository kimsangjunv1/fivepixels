import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { CheckIcon } from "../../components/icons/Icons.js";
import { ThemePreviewSkeleton } from "./ThemePreviewSkeleton.js";
export function AppearanceThemePicker({ options, value, onChange, disabled = false, ariaLabel }) {
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
    return (_jsx("div", { role: "radiogroup", "aria-label": ariaLabel, className: "grid grid-cols-3 gap-[6px]", children: options.map((option, index) => {
            const active = option.value === value;
            return (_jsxs("button", { type: "button", role: "radio", "aria-checked": active, disabled: disabled, onClick: () => onChange(option.value), onKeyDown: (event) => handleKeyDown(event, index), className: `group relative flex flex-col items-center gap-[5px] rounded-[8px] p-[4px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active
                    ? "ring-2 ring-[var(--adaptive-blue500)] ring-offset-1 ring-offset-[var(--adaptive-black50)]"
                    : "ring-1 ring-[var(--adaptive-black200)] hover:ring-[var(--adaptive-black300)]"}`, children: [_jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden rounded-[5px] bg-[var(--adaptive-black100)]", children: [_jsx(ThemePreviewSkeleton, { variant: option.value }), active ? (_jsx("span", { className: "absolute right-[3px] bottom-[3px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-white shadow-[0_1px_2px_rgba(15,23,42,0.2)]", children: _jsx(CheckIcon, { className: "h-[9px] w-[9px]" }) })) : null] }), _jsx("span", { className: `w-full truncate text-center text-[10px] leading-[1.2] ${active ? "font-semibold text-[var(--adaptive-blue500)]" : "font-medium text-[var(--adaptive-black600)] group-hover:text-[var(--adaptive-black800)]"}`, children: option.label })] }, option.value));
        }) }));
}
//# sourceMappingURL=AppearanceThemePicker.js.map