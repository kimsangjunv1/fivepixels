import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReport } from "../../providers/reportContext.js";
import { getHoverTooltipLayout } from "../../utils/hoverTooltipLayout.js";
const TOOLTIP_SURFACE_CLASS = "pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] px-[12px] py-[10px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
function InspectRow({ label, value, valueClassName = "" }) {
    return (_jsxs("div", { className: "flex items-start justify-between gap-[12px] text-[11px] leading-[1.45]", children: [_jsx("span", { className: "shrink-0 text-[var(--adaptive-black500)]", children: label }), _jsx("span", { className: `min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black900)] ${valueClassName}`.trim(), children: value })] }));
}
function ReportIdStatusIcon({ tagged }) {
    if (tagged) {
        return (_jsx("span", { "aria-hidden": "true", className: "inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#22c55e1f] text-[11px] font-bold text-[#16a34a]", children: "\u2713" }));
    }
    return (_jsx("span", { "aria-hidden": "true", className: "inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#ef44441f] text-[11px] font-bold text-[#dc2626]", children: "\u2715" }));
}
export function PickTargetHoverTooltip({ target }) {
    const { messages } = useReport();
    const tooltipRef = useRef(null);
    const [layout, setLayout] = useState(null);
    const updateLayout = useCallback(() => {
        const tooltip = tooltipRef.current;
        if (!tooltip) {
            return;
        }
        setLayout(getHoverTooltipLayout(target.rect, tooltip.getBoundingClientRect()));
    }, [target.rect]);
    useLayoutEffect(() => {
        updateLayout();
        const frameId = window.requestAnimationFrame(updateLayout);
        window.addEventListener("resize", updateLayout);
        window.addEventListener("scroll", updateLayout, true);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("scroll", updateLayout, true);
        };
    }, [target, updateLayout]);
    const tagName = target.tagName ?? "—";
    const sizeLabel = `${Math.round(target.rect.width)} × ${Math.round(target.rect.height)}`;
    const reportIdValue = target.reportIdAttribute ?? messages.pickTarget.tooltipNoReportId;
    return (_jsx("div", { ref: tooltipRef, className: TOOLTIP_SURFACE_CLASS, style: {
            top: layout?.top ?? target.rect.top,
            left: layout?.left ?? target.rect.left,
            opacity: layout ? 1 : 0,
        }, children: _jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsx(InspectRow, { label: messages.pickTarget.tooltipTag, value: `<${tagName}>` }), _jsx(InspectRow, { label: messages.pickTarget.tooltipSize, value: sizeLabel }), target.fontStyle ? (_jsxs(_Fragment, { children: [_jsx(InspectRow, { label: messages.pickTarget.tooltipFontSize, value: target.fontStyle.fontSize }), _jsx(InspectRow, { label: messages.pickTarget.tooltipFontWeight, value: target.fontStyle.fontWeight }), _jsx(InspectRow, { label: messages.pickTarget.tooltipLineHeight, value: target.fontStyle.lineHeight })] })) : null, _jsx("div", { className: "mt-[2px] border-t border-[var(--adaptive-border-subtle)] pt-[6px]", children: _jsxs("div", { className: "flex items-start justify-between gap-[8px] text-[11px] leading-[1.45]", children: [_jsx("span", { className: "shrink-0 text-[var(--adaptive-black500)]", children: messages.pickTarget.tooltipReportId }), _jsxs("div", { className: "flex min-w-0 items-start justify-end gap-[6px]", children: [_jsx(ReportIdStatusIcon, { tagged: target.isTagged }), _jsx("span", { className: "min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black900)]", children: reportIdValue })] })] }) })] }) }));
}
//# sourceMappingURL=PickTargetHoverTooltip.js.map