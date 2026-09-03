import type { ReactNode } from "react";
import { PointerFollowTooltip } from "./PointerFollowTooltip.js";

type StyleInspectTooltipRowProps = {
    label: string;
    value: string;
    valueClassName?: string;
};

/** Label/value row used by feedback pick-target style tooltips. */
export function StyleInspectTooltipRow({ label, value, valueClassName = "" }: StyleInspectTooltipRowProps) {
    return (
        <div className="flex items-start justify-between gap-[12px] text-[14px]">
            <span className="shrink-0 text-[var(--adaptive-black500)]">{label}</span>
            <span className={`min-w-0 break-all text-right font-medium font-[var(--coding-font)] text-[var(--adaptive-black700)] ${valueClassName}`.trim()}>{value}</span>
        </div>
    );
}

type StyleInspectTooltipProps = {
    open: boolean;
    pointer: { clientX: number; clientY: number } | null;
    children: ReactNode;
    className?: string;
};

/** Feedback pick-target style tooltip shell (surface, padding, row gap). */
export function StyleInspectTooltip({ open, pointer, children, className = "" }: StyleInspectTooltipProps) {
    return (
        <PointerFollowTooltip
            open={open}
            pointer={pointer}
            className={className}
        >
            <div className="flex flex-col gap-[2px] text-left">{children}</div>
        </PointerFollowTooltip>
    );
}
