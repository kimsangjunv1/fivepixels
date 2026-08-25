import { type ReactNode } from "react";
/** Shared glass surface with marker pick-target hover tooltips. */
export declare const POINTER_TOOLTIP_SURFACE_CLASS = "pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[16px] border border-solid border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] px-[14px] py-[7px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
type PointerFollowTooltipProps = {
    open: boolean;
    pointer: {
        clientX: number;
        clientY: number;
    } | null;
    children: ReactNode;
    className?: string;
};
export declare function PointerFollowTooltip({ open, pointer, children, className }: PointerFollowTooltipProps): import("react").ReactPortal | null;
export {};
//# sourceMappingURL=PointerFollowTooltip.d.ts.map