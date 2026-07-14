import { type ReactNode } from "react";
export declare const POINTER_TOOLTIP_SURFACE_CLASS = "pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity800)] px-[12px] py-[10px] text-[14px] text-[var(--adaptive-black900)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-[2px]";
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