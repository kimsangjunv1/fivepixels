import { jsx as _jsx } from "react/jsx-runtime";
export function PickTargetCompareSegment({ mode, onChange, beforeLabel, afterLabel, className = "", }) {
    return (_jsx("div", { className: `inline-flex overflow-hidden rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] p-[2px] shadow-[var(--adaptive-popup-shadow)] ${className}`.trim(), "data-fivepixels-interactive": "", onClick: (event) => event.stopPropagation(), children: ["before", "after"].map((option) => {
            const active = mode === option;
            return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onChange(option), className: `rounded-[6px] px-[8px] py-[3px] text-[11px] font-semibold transition-colors ${active
                    ? "bg-[var(--adaptive-blue500)] text-white"
                    : "text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black100)]"}`, children: option === "before" ? beforeLabel : afterLabel }, option));
        }) }));
}
//# sourceMappingURL=PickTargetCompareSegment.js.map