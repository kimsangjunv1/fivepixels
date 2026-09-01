import { type ReactNode } from "react";
/** Shared glass surface (style inspect tooltip + context menu). */
export declare const STYLE_TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] bg-[var(--adaptive-neutralTintOpacity1000)] px-[8px] py-[2px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
/** Pointer-follow portal shell built on the shared style tooltip surface. */
export declare const POINTER_TOOLTIP_SURFACE_CLASS = "pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] bg-[var(--adaptive-neutralTintOpacity1000)] px-[8px] py-[2px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
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