import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OptionSwitch } from "../../shared/components/ui/OptionSwitch.js";
import { useReportPreferences } from "../../shared/providers/reportContext.js";
import { MOBILE_PREVIEW_SIDE_PANEL_WIDTH } from "../../surfaces/preview/mobilePreviewSidePanels.js";
export function CapturePanel({ captureState, captureImageEnabled, captureStatusBarEnabled, captureCornerStyle, onCaptureImageEnabledChange, onCaptureStatusBarEnabledChange, onCaptureCornerStyleChange, onCapture, width = MOBILE_PREVIEW_SIDE_PANEL_WIDTH, className = "", }) {
    const { messages } = useReportPreferences();
    const captureLabel = captureState === "capturing"
        ? messages.settings.devicePreviewCaptureCapturingLabel
        : captureState === "saved"
            ? messages.settings.devicePreviewCaptureSavedLabel
            : captureState === "failed"
                ? messages.settings.devicePreviewCaptureFailedLabel
                : messages.settings.devicePreviewCaptureLabel;
    return (_jsxs("div", { "data-fivepixels-interactive": "", "data-chrome": "mobile-preview-capture-panel", className: `pointer-events-auto flex flex-col gap-[10px] rounded-[12px] bg-[var(--adaptive-fillOpacity700)] px-[12px] py-[12px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px] ${className}`.trim(), style: { width }, role: "toolbar", "aria-label": messages.settings.devicePreviewFloatingAriaLabel, children: [_jsx("div", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.settings.devicePreviewFloatingAriaLabel }), _jsxs("div", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewImageLabel }), _jsx(OptionSwitch, { options: [
                            { value: "off", label: messages.settings.devicePreviewImageOff },
                            { value: "on", label: messages.settings.devicePreviewImageOn },
                        ], value: captureImageEnabled ? "on" : "off", onChange: (value) => onCaptureImageEnabledChange(value === "on"), ariaLabel: messages.settings.devicePreviewImageAriaLabel })] }), !captureImageEnabled ? (_jsxs("div", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.mobilePreviewCornerStyleLabel }), _jsx(OptionSwitch, { options: [
                            { value: "sharp", label: messages.settings.mobilePreviewCornerStyleSharp },
                            { value: "rounded", label: messages.settings.mobilePreviewCornerStyleRounded },
                        ], value: captureCornerStyle, onChange: (value) => onCaptureCornerStyleChange(value), ariaLabel: messages.settings.mobilePreviewCornerStyleAriaLabel })] })) : null, _jsxs("div", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewStatusBarLabel }), _jsx(OptionSwitch, { options: [
                            { value: "off", label: messages.settings.devicePreviewStatusBarOff },
                            { value: "on", label: messages.settings.devicePreviewStatusBarOn },
                        ], value: captureStatusBarEnabled ? "on" : "off", onChange: (value) => onCaptureStatusBarEnabledChange(value === "on"), ariaLabel: messages.settings.devicePreviewStatusBarAriaLabel })] }), _jsx("button", { type: "button", onClick: onCapture, disabled: captureState === "capturing", "aria-label": messages.settings.devicePreviewCaptureAriaLabel, className: "h-[28px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[10px] font-semibold text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)] disabled:opacity-60", children: captureLabel })] }));
}
//# sourceMappingURL=CapturePanel.js.map