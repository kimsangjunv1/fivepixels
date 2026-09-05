"use client";

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MOTION } from "@/shared/constants/motionClasses.js";
import { useReportOverlayRoot } from "@/shared/providers/ReportOverlayRootContext.js";
import { getReportTooltipRoot } from "@/shared/utils/shared/dom.js";
import { HOVER_TOOLTIP_MARGIN } from "@/shared/utils/marker/hoverTooltipLayout.js";

const POINTER_OFFSET = 12;

/** Shared glass surface (style inspect tooltip + context menu). */
export const STYLE_TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] bg-[var(--adaptive-fillOpacity700)] px-[12px] py-[8px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";

/** Pointer-follow portal shell built on the shared style tooltip surface. */
export const POINTER_TOOLTIP_SURFACE_CLASS = `pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] ${STYLE_TOOLTIP_SURFACE_CLASS}`;

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
    const overlayRoot = useReportOverlayRoot();
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

    const viewportTop = layout?.top ?? pointer.clientY + POINTER_OFFSET;
    const viewportLeft = layout?.left ?? pointer.clientX + POINTER_OFFSET;
    const rootRect = overlayRoot?.getBoundingClientRect();
    const scaleX = overlayRoot && rootRect ? rootRect.width / Math.max(1, overlayRoot.offsetWidth) : 1;
    const scaleY = overlayRoot && rootRect ? rootRect.height / Math.max(1, overlayRoot.offsetHeight) : 1;
    const style: CSSProperties = overlayRoot
        ? {
              position: "absolute",
              top: (viewportTop - (rootRect?.top ?? 0)) / scaleY,
              left: (viewportLeft - (rootRect?.left ?? 0)) / scaleX,
              visibility: layout ? "visible" : "hidden",
          }
        : {
              top: viewportTop,
              left: viewportLeft,
              visibility: layout ? "visible" : "hidden",
          };

    return createPortal(
        <div
            ref={tooltipRef}
            role="tooltip"
            className={`${overlayRoot ? POINTER_TOOLTIP_SURFACE_CLASS.replace("fixed ", "absolute ") : POINTER_TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipIn} ${className}`.trim()}
            style={style}
        >
            {children}
        </div>,
        overlayRoot ?? getReportTooltipRoot(),
    );
}
