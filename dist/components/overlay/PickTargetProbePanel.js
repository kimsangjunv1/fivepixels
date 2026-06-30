import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReport } from "../../providers/reportContext.js";
import { getPickProbePanelLayout } from "../../utils/pickProbeLayout.js";
import { PickTargetCompareSegment } from "./PickTargetCompareSegment.js";
const PANEL_SURFACE_CLASS = "pointer-events-auto fixed z-[1000002] w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
function ProbeField({ label, value, onChange }) {
    return (_jsxs("label", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: label }), _jsx("input", { type: "text", "data-fivepixels-interactive": "", value: value, onChange: (event) => onChange(event.target.value), className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" })] }));
}
export function PickTargetProbePanel() {
    const { messages, selectedTarget, pickProbeOpen, pickProbeValues, pickProbeCompareMode, pickProbeHasEdits, setPickProbeCompareMode, updatePickProbeValue, resetPickProbeValues, insertPickProbeSummaryToDraft, } = useReport();
    const panelRef = useRef(null);
    const [layout, setLayout] = useState(null);
    const updateLayout = useCallback(() => {
        const panel = panelRef.current;
        if (!panel || !selectedTarget) {
            return;
        }
        const rect = panel.getBoundingClientRect();
        setLayout(getPickProbePanelLayout(selectedTarget.rect, rect.width, rect.height));
    }, [selectedTarget]);
    useLayoutEffect(() => {
        if (!pickProbeOpen || !selectedTarget) {
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
    }, [pickProbeOpen, selectedTarget, pickProbeValues, updateLayout]);
    if (!pickProbeOpen || !selectedTarget || !pickProbeValues) {
        return null;
    }
    const handleChange = (key) => (value) => {
        updatePickProbeValue(key, value);
    };
    const values = pickProbeValues;
    return (_jsx("div", { ref: panelRef, "data-fivepixels-interactive": "", onClick: (event) => event.stopPropagation(), className: PANEL_SURFACE_CLASS, style: {
            top: layout?.top ?? selectedTarget.rect.bottom + 8,
            left: layout?.left ?? selectedTarget.rect.left,
            opacity: layout ? 1 : 0,
        }, children: _jsxs("div", { className: "flex flex-col gap-[10px] px-[12px] py-[10px]", children: [_jsxs("div", { className: "flex items-center justify-between gap-[8px]", children: [_jsx("p", { className: "text-[12px] font-semibold text-[var(--adaptive-black900)]", children: messages.pickTarget.probeTitle }), pickProbeHasEdits ? (_jsx(PickTargetCompareSegment, { mode: pickProbeCompareMode, onChange: setPickProbeCompareMode, beforeLabel: messages.pickTarget.probeBefore, afterLabel: messages.pickTarget.probeAfter })) : null] }), _jsx(ProbeField, { label: messages.pickTarget.probeText, value: values.textContent, onChange: handleChange("textContent") }), _jsx(ProbeField, { label: messages.pickTarget.probeFontSize, value: values.fontSize, onChange: handleChange("fontSize") }), _jsx(ProbeField, { label: messages.pickTarget.probePadding, value: values.padding, onChange: handleChange("padding") }), _jsx(ProbeField, { label: messages.pickTarget.probeMargin, value: values.margin, onChange: handleChange("margin") }), _jsx(ProbeField, { label: messages.pickTarget.probeLineHeight, value: values.lineHeight, onChange: handleChange("lineHeight") }), _jsxs("div", { className: "flex flex-wrap items-center justify-end gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[8px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: resetPickProbeValues, className: "rounded-[8px] border border-[var(--adaptive-border-subtle)] px-[10px] py-[5px] text-[11px] font-medium text-[var(--adaptive-black700)]", children: messages.pickTarget.probeReset }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: !pickProbeHasEdits, onClick: () => insertPickProbeSummaryToDraft(), className: "rounded-[8px] bg-[var(--adaptive-blue500)] px-[10px] py-[5px] text-[11px] font-semibold text-white disabled:opacity-50", children: messages.pickTarget.probeInsertSummary })] })] }) }));
}
//# sourceMappingURL=PickTargetProbePanel.js.map