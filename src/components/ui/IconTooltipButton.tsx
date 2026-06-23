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

const ICON_BUTTON_BASE_CLASS =
    "flex h-[24px] w-[24px] items-center justify-center rounded-[8px] text-[var(--adaptive-black900)] disabled:cursor-not-allowed disabled:opacity-50";

export function IconTooltipButton({ label, active = false, disabled = false, onClick, children, className = "" }: IconTooltipButtonProps) {
    return (
        <HoverTooltip
            label={label}
            disabled={disabled}
        >
            <button
                type="button"
                aria-label={label}
                aria-pressed={active}
                disabled={disabled}
                onClick={onClick}
                className={`${ICON_BUTTON_BASE_CLASS} shrink-0 ${active ? "bg-[var(--adaptive-black100)]" : "bg-[var(--adaptive-black300)]"} ${className}`}
            >
                {children}
            </button>
        </HoverTooltip>
    );
}
