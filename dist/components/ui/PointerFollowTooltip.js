import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MOTION } from "../../constants/motionClasses.js";
import { getReportTooltipRoot } from "../../utils/shared/dom.js";
import { HOVER_TOOLTIP_MARGIN } from "../../utils/marker/hoverTooltipLayout.js";
const POINTER_OFFSET = 12;
/** Shared glass surface (style inspect tooltip + context menu). */
export const STYLE_TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[16px] border border-solid border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] px-[14px] py-[7px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
/** Pointer-follow portal shell built on the shared style tooltip surface. */
export const POINTER_TOOLTIP_SURFACE_CLASS = `pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] ${STYLE_TOOLTIP_SURFACE_CLASS}`;
function getPointerTooltipLayout(clientX, clientY, tooltipRect) {
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
export function PointerFollowTooltip({ open, pointer, children, className = "" }) {
    const tooltipRef = useRef(null);
    const [layout, setLayout] = useState(null);
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
    const style = {
        top: layout?.top ?? pointer.clientY + POINTER_OFFSET,
        left: layout?.left ?? pointer.clientX + POINTER_OFFSET,
        visibility: layout ? "visible" : "hidden",
    };
    return createPortal(_jsx("div", { ref: tooltipRef, role: "tooltip", className: `${POINTER_TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipIn} ${className}`.trim(), style: style, children: children }), getReportTooltipRoot());
}
//# sourceMappingURL=PointerFollowTooltip.js.map