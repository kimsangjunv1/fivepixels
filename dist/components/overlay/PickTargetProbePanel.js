import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "../../components/icons/Icons.js";
import { useReport } from "../../providers/reportContext.js";
import { isSteppableCssValue, stepCssBoxSides, stepCssPixel } from "../../utils/cssStepper.js";
import { copyTextToClipboard } from "../../utils/feedbackDataTransfer.js";
import { getPickProbePanelLayout } from "../../utils/pickProbeLayout.js";
import { getProbeColorPreview, isValidProbeHexColor, probeHexToColorInputValue, sanitizeProbeHexInput } from "../../utils/probeColor.js";
import { PickTargetCompareSegment } from "./PickTargetCompareSegment.js";
import { ProbeLayoutControls } from "./ProbeLayoutControls.js";
const PANEL_SURFACE_CLASS = "pointer-events-auto fixed z-[1000002] w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const STEPPER_STEP_PX = 1;
function ProbeTextField({ label, value, onChange }) {
    return (_jsxs("label", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: label }), _jsx("input", { type: "text", "data-fivepixels-interactive": "", value: value, onChange: (event) => onChange(event.target.value), className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" })] }));
}
function ProbeColorField({ label, value, onChange }) {
    const { messages } = useReport();
    const colorInputRef = useRef(null);
    const copyTimeoutRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const preview = getProbeColorPreview(value);
    const canCopy = isValidProbeHexColor(value);
    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);
    const handleCopy = () => {
        if (!preview) {
            return;
        }
        void copyTextToClipboard(preview)
            .then(() => {
            setCopied(true);
            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
            }
            copyTimeoutRef.current = window.setTimeout(() => {
                setCopied(false);
                copyTimeoutRef.current = null;
            }, 1000);
        })
            .catch(() => {
            setCopied(false);
        });
    };
    return (_jsxs("label", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: label }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => colorInputRef.current?.click(), className: "relative h-[30px] w-[30px] shrink-0 overflow-hidden rounded-[8px] border border-[var(--adaptive-border-subtle)]", "aria-label": label, children: [_jsx("span", { className: "absolute inset-0", style: { backgroundColor: preview ?? "transparent" }, "aria-hidden": true }), _jsx("input", { ref: colorInputRef, type: "color", "data-fivepixels-interactive": "", value: probeHexToColorInputValue(value), onChange: (event) => onChange(event.target.value), className: "absolute inset-0 h-full w-full cursor-pointer opacity-0", tabIndex: -1 })] }), _jsx("input", { type: "text", "data-fivepixels-interactive": "", value: value, onChange: (event) => onChange(sanitizeProbeHexInput(event.target.value)), placeholder: "#ededed", className: "min-w-0 flex-1 rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleCopy, disabled: !canCopy, "aria-label": copied ? messages.common.copied : messages.common.copy, className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black700)] disabled:opacity-40", children: copied ? (_jsx(CheckIcon, { className: "h-[14px] w-[14px] text-[var(--adaptive-green500)]" })) : (_jsx(CopyIcon, { className: "h-[14px] w-[14px]" })) })] })] }));
}
function ProbeStepperField({ label, value, onChange }) {
    const steppable = isSteppableCssValue(value);
    const isSinglePixel = /^\d/.test(value.trim()) && !value.trim().includes(" ");
    const handleStep = (delta) => {
        if (!steppable) {
            return;
        }
        onChange(isSinglePixel ? stepCssPixel(value, delta * STEPPER_STEP_PX) : stepCssBoxSides(value, delta * STEPPER_STEP_PX));
    };
    return (_jsxs("div", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: label }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: !steppable, onClick: () => handleStep(-1), className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)] disabled:opacity-40", "aria-label": `Decrease ${label}`, children: "\u2212" }), _jsx("div", { className: "min-w-0 flex-1 rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] text-center font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)]", children: value }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: !steppable, onClick: () => handleStep(1), className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)] disabled:opacity-40", "aria-label": `Increase ${label}`, children: "+" })] })] }));
}
export function PickTargetProbePanel() {
    const { messages, selectedTarget, pickProbeOpen, pickProbeValues, pickProbeSupportsTextFields, pickProbeLayoutMode, pickProbeCompareMode, pickProbeHasEdits, setPickProbeCompareMode, updatePickProbeValue, resetPickProbeValues, commitPickProbeEdits, } = useReport();
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
    return (_jsx("div", { ref: panelRef, "data-fivepixels-interactive": "", onClick: (event) => event.stopPropagation(), onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
        }, className: PANEL_SURFACE_CLASS, style: {
            top: layout?.top ?? selectedTarget.rect.bottom + 8,
            left: layout?.left ?? selectedTarget.rect.left,
            opacity: layout ? 1 : 0,
        }, children: _jsxs("div", { className: "flex max-h-[min(70vh,560px)] flex-col gap-[10px] overflow-y-auto px-[12px] py-[10px]", children: [_jsxs("div", { className: "flex items-center justify-between gap-[8px]", children: [_jsx("p", { className: "text-[12px] font-semibold text-[var(--adaptive-black900)]", children: messages.pickTarget.probeTitle }), pickProbeHasEdits ? (_jsx(PickTargetCompareSegment, { mode: pickProbeCompareMode, onChange: setPickProbeCompareMode, beforeLabel: messages.pickTarget.probeBefore, afterLabel: messages.pickTarget.probeAfter })) : null] }), pickProbeSupportsTextFields ? (_jsxs(_Fragment, { children: [_jsx(ProbeTextField, { label: messages.pickTarget.probeText, value: values.textContent, onChange: handleChange("textContent") }), _jsx(ProbeStepperField, { label: messages.pickTarget.probeFontSize, value: values.fontSize, onChange: handleChange("fontSize") }), _jsx(ProbeTextField, { label: messages.pickTarget.probeLineHeight, value: values.lineHeight, onChange: handleChange("lineHeight") })] })) : null, _jsx(ProbeStepperField, { label: messages.pickTarget.probePadding, value: values.padding, onChange: handleChange("padding") }), _jsx(ProbeStepperField, { label: messages.pickTarget.probeMargin, value: values.margin, onChange: handleChange("margin") }), _jsx(ProbeColorField, { label: messages.pickTarget.probeTextColor, value: values.textColor, onChange: handleChange("textColor") }), _jsx(ProbeColorField, { label: messages.pickTarget.probeBackgroundColor, value: values.backgroundColor, onChange: handleChange("backgroundColor") }), _jsx(ProbeColorField, { label: messages.pickTarget.probeBorderColor, value: values.borderColor, onChange: handleChange("borderColor") }), _jsx(ProbeLayoutControls, { layoutMode: pickProbeLayoutMode, values: values, messages: messages, onChange: (key, value) => handleChange(key)(value) }), _jsxs("div", { className: "flex flex-wrap items-center justify-end gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[8px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: resetPickProbeValues, className: "rounded-[8px] border border-[var(--adaptive-border-subtle)] px-[10px] py-[5px] text-[11px] font-medium text-[var(--adaptive-black700)]", children: messages.pickTarget.probeReset }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: !pickProbeHasEdits, onClick: () => commitPickProbeEdits(), className: "rounded-[8px] bg-[var(--adaptive-blue500)] px-[10px] py-[5px] text-[11px] font-semibold text-white disabled:opacity-50", children: messages.pickTarget.probeApply })] })] }) }));
}
//# sourceMappingURL=PickTargetProbePanel.js.map