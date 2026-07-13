import type { ReactNode } from "react";
import { HoverTooltip } from "./HoverTooltip.js";

type IconTooltipButtonProps = {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
    className?: string;
};

const ICON_BUTTON_BASE_CLASS = "flex items-center justify-center text-[var(--adaptive-black900)] disabled:cursor-not-allowed disabled:opacity-50 px-[6px]";

export function IconTooltipButton({ label, active = false, disabled = false, onClick, children, className = "" }: IconTooltipButtonProps) {
    return (
        <HoverTooltip
            label={label}
            disabled={disabled}
            className="h-[inherit]"
        >
            <button
                type="button"
                aria-label={label}
                aria-pressed={active}
                disabled={disabled}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className={`${ICON_BUTTON_BASE_CLASS} shrink-0 ${active ? "hover:bg-[#bc3110] bg-[#f6562f]" : "hover:bg-[var(--adaptive-black50)]"} ${className}`}
            >
                {children}
            </button>
        </HoverTooltip>
    );
}
