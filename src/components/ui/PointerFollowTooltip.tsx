import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MOTION } from "@/constants/motionClasses.js";
import { getReportTooltipRoot } from "@/utils/shared/dom.js";
import { HOVER_TOOLTIP_MARGIN } from "@/utils/marker/hoverTooltipLayout.js";

const POINTER_OFFSET = 12;

export const POINTER_TOOLTIP_SURFACE_CLASS =
    "pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity800)] px-[12px] py-[10px] text-[14px] text-[var(--adaptive-black900)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-[2px]";

type PointerFollowTooltipProps = {
    open: boolean;
    pointer: { clientX: number; clientY: number } | null;
    children: ReactNode;
    className?: string;
};

function getPointerTooltipLayout(clientX: number, clientY: number, tooltipRect: DOMRect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = clientX + POINTER_OFFSET;
    let top = clientY + POINTER_OFFSET;

    if (left + tooltipRect.width > viewportWidth - HOVER_TOOLTIP_MARGIN) {
        left = clientX - POINTER_OFFSET - tooltipRect.width;
    }

    if (top + tooltipRect.height > viewportHeight - HOVER_TOOLTIP_MARGIN) {
        top = clientY - POINTER_OFFSET - tooltipRect.height;
    }

    left = Math.min(Math.max(left, HOVER_TOOLTIP_MARGIN), Math.max(HOVER_TOOLTIP_MARGIN, viewportWidth - HOVER_TOOLTIP_MARGIN - tooltipRect.width));
    top = Math.min(Math.max(top, HOVER_TOOLTIP_MARGIN), Math.max(HOVER_TOOLTIP_MARGIN, viewportHeight - HOVER_TOOLTIP_MARGIN - tooltipRect.height));

    return { top, left };
}

export function PointerFollowTooltip({ open, pointer, children, className = "" }: PointerFollowTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [layout, setLayout] = useState<{ top: number; left: number } | null>(null);

    const updateLayout = useCallback(() => {
        const tooltip = tooltipRef.current;

        if (!tooltip || !pointer) {
            return;
        }

        setLayout(getPointerTooltipLayout(pointer.clientX, pointer.clientY, tooltip.getBoundingClientRect()));
    }, [pointer]);

    useLayoutEffect(() => {
        if (!open || !pointer) {
            setLayout(null);
            return;
        }

        updateLayout();
        const frameId = window.requestAnimationFrame(updateLayout);

        window.addEventListener("resize", updateLayout);
        window.addEventListener("scroll", updateLayout, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("scroll", updateLayout, true);
        };
    }, [open, pointer, updateLayout]);

    if (!open || !pointer) {
        return null;
    }

    const style: CSSProperties = {
        top: layout?.top ?? pointer.clientY + POINTER_OFFSET,
        left: layout?.left ?? pointer.clientX + POINTER_OFFSET,
        visibility: layout ? "visible" : "hidden",
    };

    return createPortal(
        <div
            ref={tooltipRef}
            role="tooltip"
            className={`${POINTER_TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipIn} ${className}`.trim()}
            style={style}
        >
            {children}
        </div>,
        getReportTooltipRoot(),
    );
}
