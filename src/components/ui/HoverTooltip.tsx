import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNativeHover } from "@/hooks/useNativeHover.js";
import { getReportTooltipRoot, ensureReportTooltipLayer } from "@/utils/dom.js";
import { getHoverTooltipLayout, type HoverTooltipLayout } from "@/utils/hoverTooltipLayout.js";

type HoverTooltipProps = {
    label: string;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
};

const TOOLTIP_STYLE: CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    borderRadius: "100px",
    backgroundColor: "#00000090",
    padding: "4px 10px",
    fontSize: "14px",
    color: "#ffffff",
};

export function HoverTooltip({ label, disabled = false, children, className = "" }: HoverTooltipProps) {
    const [hovered, setHovered] = useState(false);
    const [layout, setLayout] = useState<HoverTooltipLayout | null>(null);
    const anchorRef = useRef<HTMLSpanElement | null>(null);
    const tooltipRef = useRef<HTMLSpanElement | null>(null);

    const hoverRef = useNativeHover<HTMLSpanElement>({
        onEnter: () => setHovered(true),
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

        setLayout(getHoverTooltipLayout(anchor.getBoundingClientRect(), tooltip.getBoundingClientRect()));
    }, []);

    useLayoutEffect(() => {
        if (!hovered || disabled) {
            setLayout(null);
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
                          style={{
                              ...TOOLTIP_STYLE,
                              top: layout?.top ?? 0,
                              left: layout?.left ?? 0,
                              opacity: layout ? 1 : 0,
                          }}
                      >
                          {label}
                      </span>,
                      getReportTooltipRoot(),
                  )
                : null}
        </>
    );
}
