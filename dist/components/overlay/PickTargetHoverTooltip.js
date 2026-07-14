import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { HOVER_TOOLTIP_MARGIN } from "../../utils/marker/hoverTooltipLayout.js";
const TOOLTIP_SURFACE_CLASS = "pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] px-[12px] py-[10px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const POINTER_OFFSET = 12;
function InspectRow({ label, value, valueClassName = "" }) {
    return (_jsxs("div", { className: "flex items-start justify-between gap-[12px] text-[11px] leading-[1.45]", children: [_jsx("span", { className: "shrink-0 text-[var(--adaptive-black500)]", children: label }), _jsx("span", { className: `min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black900)] ${valueClassName}`.trim(), children: value })] }));
}
function ReportIdStatusIcon({ tagged }) {
    if (tagged) {
        return (_jsx("span", { "aria-hidden": "true", className: "inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#22c55e1f] text-[11px] font-bold text-[#16a34a]", children: "\u2713" }));
    }
    return (_jsx("span", { "aria-hidden": "true", className: "inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#ef44441f] text-[11px] font-bold text-[#dc2626]", children: "\u2715" }));
}
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
export function PickTargetHoverTooltip({ target }) {
    const { messages } = useReportPreferences();
    const { hoverPointer } = useReportSession();
    const tooltipRef = useRef(null);
    const [layout, setLayout] = useState(null);
    const updateLayout = useCallback(() => {
        const tooltip = tooltipRef.current;
        if (!tooltip || !hoverPointer) {
            return;
        }
        setLayout(getPointerTooltipLayout(hoverPointer.clientX, hoverPointer.clientY, tooltip.getBoundingClientRect()));
    }, [hoverPointer]);
    useLayoutEffect(() => {
        if (!hoverPointer) {
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
    }, [hoverPointer, target, updateLayout]);
    if (!hoverPointer) {
        return null;
    }
    const tagName = target.tagName ?? "—";
    const sizeLabel = `${Math.round(target.rect.width)} × ${Math.round(target.rect.height)}`;
    const reportIdValue = target.reportIdAttribute ?? messages.pickTarget.tooltipNoReportId;
    return (_jsx("div", { ref: tooltipRef, className: TOOLTIP_SURFACE_CLASS, style: {
            top: layout?.top ?? hoverPointer.clientY + POINTER_OFFSET,
            left: layout?.left ?? hoverPointer.clientX + POINTER_OFFSET,
            opacity: layout ? 1 : 0,
        }, children: _jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsx(InspectRow, { label: messages.pickTarget.tooltipTag, value: `<${tagName}>` }), _jsx(InspectRow, { label: messages.pickTarget.tooltipSize, value: sizeLabel }), target.boxStyle ? (_jsxs(_Fragment, { children: [_jsx(InspectRow, { label: messages.pickTarget.tooltipDisplay, value: target.boxStyle.display }), _jsx(InspectRow, { label: messages.pickTarget.tooltipPadding, value: target.boxStyle.padding }), _jsx(InspectRow, { label: messages.pickTarget.tooltipMargin, value: target.boxStyle.margin })] })) : null, target.fontStyle ? (_jsxs(_Fragment, { children: [_jsx(InspectRow, { label: messages.pickTarget.tooltipFontFamily, value: target.fontStyle.fontFamily }), _jsx(InspectRow, { label: messages.pickTarget.tooltipFontSize, value: target.fontStyle.fontSize }), _jsx(InspectRow, { label: messages.pickTarget.tooltipFontWeight, value: target.fontStyle.fontWeight }), _jsx(InspectRow, { label: messages.pickTarget.tooltipLineHeight, value: target.fontStyle.lineHeight })] })) : null, _jsx("div", { className: "mt-[2px] border-t border-[var(--adaptive-border-subtle)] pt-[6px]", children: _jsxs("div", { className: "flex items-start justify-between gap-[8px] text-[11px] leading-[1.45]", children: [_jsx("span", { className: "shrink-0 text-[var(--adaptive-black500)]", children: messages.pickTarget.tooltipReportId }), _jsxs("div", { className: "flex min-w-0 items-start justify-end gap-[6px]", children: [_jsx(ReportIdStatusIcon, { tagged: target.isTagged }), _jsx("span", { className: "min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black900)]", children: reportIdValue })] })] }) })] }) }));
}
//# sourceMappingURL=PickTargetHoverTooltip.js.map