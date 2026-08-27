import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircleIcon } from "../../components/icons/Icons.js";
import { StyleInspectTooltip, StyleInspectTooltipRow } from "../../components/ui/StyleInspectTooltip.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { ACCENT_COLOR } from "../../constants/accentColors.js";
const TAGGED_REPORT_ID_COLOR = ACCENT_COLOR.green;
function ReportIdStatusIcon({ tagged }) {
    if (tagged) {
        return (_jsx(CheckCircleIcon, { className: "h-[16px] w-[16px] shrink-0", fill: TAGGED_REPORT_ID_COLOR }));
    }
    return (_jsx("span", { "aria-hidden": "true", className: "inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#ef44441f] text-[11px] font-bold text-[#dc2626]", children: "\u2715" }));
}
export function PickTargetHoverTooltip({ target }) {
    const { messages } = useReportPreferences();
    const { hoverPointer } = useReportSession();
    if (!hoverPointer) {
        return null;
    }
    const tagName = target.tagName ?? "—";
    const sizeLabel = `${Math.round(target.rect.width)} × ${Math.round(target.rect.height)}`;
    const reportIdValue = target.reportIdAttribute ?? messages.pickTarget.tooltipNoReportId;
    return (_jsxs(StyleInspectTooltip, { open: true, pointer: hoverPointer, children: [_jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipTag, value: `<${tagName}>` }), _jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipSize, value: sizeLabel }), target.boxStyle ? (_jsxs(_Fragment, { children: [_jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipDisplay, value: target.boxStyle.display }), _jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipPadding, value: target.boxStyle.padding }), _jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipMargin, value: target.boxStyle.margin })] })) : null, target.fontStyle ? (_jsxs(_Fragment, { children: [_jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipFontFamily, value: target.fontStyle.fontFamily }), _jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipFontSize, value: target.fontStyle.fontSize }), _jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipFontWeight, value: target.fontStyle.fontWeight }), _jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipLineHeight, value: target.fontStyle.lineHeight })] })) : null, _jsxs("div", { className: "mt-[2px] flex flex-col gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[6px]", children: [target.fpOpenAttribute ? (_jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipFpOpen, value: target.fpOpenAttribute })) : null, target.fpViewAttribute ? (_jsx(StyleInspectTooltipRow, { label: messages.pickTarget.tooltipFpView, value: target.fpViewAttribute })) : null, _jsxs("div", { className: "flex items-start justify-between gap-[8px] text-[14px] leading-[1.45]", children: [_jsx("span", { className: "shrink-0 text-[var(--adaptive-black500)]", children: messages.pickTarget.tooltipReportId }), _jsxs("div", { className: "flex min-w-0 items-start justify-end gap-[6px]", children: [_jsx(ReportIdStatusIcon, { tagged: target.isTagged }), _jsx("span", { className: "min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black900)]", children: reportIdValue })] })] })] })] }));
}
//# sourceMappingURL=PickTargetHoverTooltip.js.map