import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNativeHover } from "@/hooks/useNativeHover.js";
import { MOTION } from "@/constants/motionClasses.js";
import { getReportTooltipRoot, ensureReportTooltipLayer } from "@/utils/shared/dom.js";
import { getHoverTooltipLayout, type HoverTooltipLayout } from "@/utils/marker/hoverTooltipLayout.js";

type HoverTooltipProps = {
    label?: string;
    content?: ReactNode;
    multiline?: boolean;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
};

const SINGLE_LINE_TOOLTIP_CLASS_NAME =
    "pointer-events-none fixed whitespace-nowrap rounded-[100px] bg-[var(--adaptive-overlay-surface)] px-[10px] py-[4px] text-[14px] text-[var(--adaptive-overlay-text)]";
const MULTILINE_TOOLTIP_CLASS_NAME =
    "pointer-events-none fixed max-w-[min(280px,calc(100vw-16px))] whitespace-pre-wrap rounded-[8px] bg-[var(--adaptive-overlay-surface)] px-[10px] py-[6px] text-[12px] leading-[1.4] text-[var(--adaptive-overlay-text)]";

function isSameLayout(current: HoverTooltipLayout | null, next: HoverTooltipLayout | null) {
    if (current === next) {
        return true;
    }

    if (!current || !next) {
        return false;
    }

    return current.top === next.top && current.left === next.left;
}

export function HoverTooltip({ label, content, multiline = false, disabled = false, children, className = "" }: HoverTooltipProps) {
    const [hovered, setHovered] = useState(false);
    const [layout, setLayout] = useState<HoverTooltipLayout | null>(null);
    const anchorRef = useRef<HTMLSpanElement | null>(null);
    const tooltipRef = useRef<HTMLSpanElement | null>(null);

    const hoverRef = useNativeHover<HTMLSpanElement>({
        onEnter: () => {
            if (!disabled) {
                setHovered(true);
            }
        },
        onLeave: () => setHovered(false),
    });

    const setAnchorRef = useCallback(
        (node: HTMLSpanElement | null) => {
            anchorRef.current = node;
            hoverRef(node);
        },
        [hoverRef],
    );

    const updateLayout = useCallback(() => {
        const anchor = anchorRef.current;
        const tooltip = tooltipRef.current;

        if (!anchor || !tooltip) {
            return;
        }

        const nextLayout = getHoverTooltipLayout(anchor.getBoundingClientRect(), tooltip.getBoundingClientRect());

        setLayout((current) => (isSameLayout(current, nextLayout) ? current : nextLayout));
    }, []);

    useLayoutEffect(() => {
        if (disabled) {
            setHovered(false);
        }
    }, [disabled]);

    useLayoutEffect(() => {
        if (!hovered || disabled) {
            setLayout((current) => (current === null ? current : null));
            return;
        }

        updateLayout();
        ensureReportTooltipLayer();
        const frameId = window.requestAnimationFrame(updateLayout);

        window.addEventListener("resize", updateLayout);
        window.addEventListener("scroll", updateLayout, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("scroll", updateLayout, true);
        };
    }, [disabled, hovered, label, updateLayout]);

    const showTooltip = hovered && !disabled;
    const tooltipClassName = `${multiline ? MULTILINE_TOOLTIP_CLASS_NAME : SINGLE_LINE_TOOLTIP_CLASS_NAME} ${MOTION.tooltipIn}`;

    return (
        <>
            <span
                ref={setAnchorRef}
                className={`inline-flex ${className}`.trim()}
            >
                {children}
            </span>

            {showTooltip
                ? createPortal(
                      <span
                          ref={tooltipRef}
                          role="tooltip"
                          className={tooltipClassName}
                          style={{
                              top: layout?.top ?? 0,
                              left: layout?.left ?? 0,
                              visibility: layout ? "visible" : "hidden",
                          }}
                      >
                          {content ?? label}
                      </span>,
                      getReportTooltipRoot(),
                  )
                : null}
        </>
    );
}
