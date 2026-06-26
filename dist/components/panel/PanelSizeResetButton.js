import { jsx as _jsx } from "react/jsx-runtime";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
export function PanelSizeResetButton({ collapsed, disabled = false, label, onClick }) {
    if (collapsed) {
        return null;
    }
    return (_jsx(HoverTooltip, { label: label, children: _jsx("button", { type: "button", onClick: onClick, disabled: disabled, "aria-label": label, className: "flex items-center justify-center px-[4px] py-[6px] text-[var(--adaptive-text-muted)] disabled:opacity-40", children: _jsx("span", { className: "inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[var(--adaptive-border-subtle)] text-[10px] font-bold leading-none", children: "\u21BA" }) }) }));
}
//# sourceMappingURL=PanelSizeResetButton.js.map