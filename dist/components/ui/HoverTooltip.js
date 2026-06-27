import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { getReportTooltipRoot, ensureReportTooltipLayer } from "../../utils/dom.js";
import { getHoverTooltipLayout } from "../../utils/hoverTooltipLayout.js";
const TOOLTIP_STYLE = {
    position: "fixed",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    borderRadius: "100px",
    backgroundColor: "#00000090",
    padding: "4px 10px",
    fontSize: "14px",
    color: "#ffffff",
};
export function HoverTooltip({ label, disabled = false, children, className = "" }) {
    const [hovered, setHovered] = useState(false);
    const [layout, setLayout] = useState(null);
    const anchorRef = useRef(null);
    const tooltipRef = useRef(null);
    const hoverRef = useNativeHover({
        onEnter: () => setHovered(true),
        onLeave: () => setHovered(false),
    });
    const setAnchorRef = useCallback((node) => {
        anchorRef.current = node;
        hoverRef(node);
    }, [hoverRef]);
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
    return (_jsxs(_Fragment, { children: [_jsx("span", { ref: setAnchorRef, className: `inline-flex ${className}`.trim(), children: children }), showTooltip
                ? createPortal(_jsx("span", { ref: tooltipRef, role: "tooltip", style: {
                        ...TOOLTIP_STYLE,
                        top: layout?.top ?? 0,
                        left: layout?.left ?? 0,
                        opacity: layout ? 1 : 0,
                    }, children: label }), getReportTooltipRoot())
                : null] }));
}
//# sourceMappingURL=HoverTooltip.js.map