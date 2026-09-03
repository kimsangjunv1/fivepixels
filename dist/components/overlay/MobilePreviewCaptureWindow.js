import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { DEVICE_PREVIEW_SCALE_OPTIONS, formatDevicePreviewScale, } from "../../constants/devicePreview.js";
import { PanelOptionSwitch } from "../../components/panel/PanelOptionSwitch.js";
import { OverlayShell } from "../../components/ui/OverlayShell.js";
import { useReportPreferences } from "../../providers/reportContext.js";
const MOBILE_PREVIEW_CAPTURE_BAR_STORAGE_KEY = "fivepixels:mobile-preview-capture-bar-position:v1";
function readMobilePreviewCaptureBarPosition() {
    const fallback = getDefaultMobilePreviewCaptureBarPosition();
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const raw = window.localStorage.getItem(MOBILE_PREVIEW_CAPTURE_BAR_STORAGE_KEY);
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw);
        if (typeof parsed.left === "number" && Number.isFinite(parsed.left) && typeof parsed.top === "number" && Number.isFinite(parsed.top)) {
            return { left: parsed.left, top: parsed.top };
        }
    }
    catch {
        // Ignore storage failures.
    }
    return fallback;
}
function getDefaultMobilePreviewCaptureBarPosition() {
    if (typeof window === "undefined") {
        return { left: 80, top: 640 };
    }
    return {
        left: Math.max(16, window.innerWidth - 260),
        top: Math.max(16, window.innerHeight - 420),
    };
}
function persistMobilePreviewCaptureBarPosition(position) {
    try {
        window.localStorage.setItem(MOBILE_PREVIEW_CAPTURE_BAR_STORAGE_KEY, JSON.stringify(position));
    }
    catch {
        // Ignore storage failures.
    }
}
export function MobilePreviewCaptureWindow({ captureState, captureScale, captureImageEnabled, captureStatusBarEnabled, onCaptureScaleChange, onCaptureImageEnabledChange, onCaptureStatusBarEnabledChange, onCapture, onClose, }) {
    const { messages } = useReportPreferences();
    const [position, setPosition] = useState(() => readMobilePreviewCaptureBarPosition());
    const [mode, setMode] = useState("normal");
    const captureLabel = captureState === "capturing"
        ? messages.settings.devicePreviewCaptureCapturingLabel
        : captureState === "saved"
            ? messages.settings.devicePreviewCaptureSavedLabel
            : captureState === "failed"
                ? messages.settings.devicePreviewCaptureFailedLabel
                : messages.settings.devicePreviewCaptureLabel;
    const selectClassName = "h-[30px] w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[11px] font-semibold text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]";
    const handlePositionChange = useCallback((next) => {
        setPosition(next);
        persistMobilePreviewCaptureBarPosition(next);
    }, []);
    return (_jsx(OverlayShell, { windowId: "mobile-preview-capture-toolbar", minimizePolicy: "dock", dataChrome: "mobile-preview-capture-toolbar", role: "toolbar", ariaLabel: messages.settings.devicePreviewFloatingAriaLabel, position: position, onPositionChange: handlePositionChange, mode: mode, onModeChange: setMode, width: 220, minWidth: 200, minHeight: 160, resizable: true, resizeAriaLabel: messages.marker.resizeAriaLabel, contentClassName: "px-[12px] pb-[12px]", minimizedDockSubtitle: messages.settings.devicePreviewFloatingAriaLabel, controls: {
            onClose,
            closeAriaLabel: messages.marker.windowCloseAriaLabel,
            minimizeAriaLabel: messages.marker.windowMinimizeAriaLabel,
            maximizeAriaLabel: messages.marker.windowMaximizeAriaLabel,
            restoreAriaLabel: messages.marker.windowRestoreAriaLabel,
            moreAriaLabel: messages.marker.windowControlsMoreAriaLabel,
        }, title: _jsx("span", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.settings.devicePreviewFloatingAriaLabel }), children: _jsxs("div", { className: "flex w-full flex-col gap-[10px]", children: [_jsxs("label", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewScaleLabel }), _jsx("select", { value: String(captureScale), onChange: (event) => onCaptureScaleChange(Number(event.target.value)), "aria-label": messages.settings.devicePreviewScaleAriaLabel, className: selectClassName, children: DEVICE_PREVIEW_SCALE_OPTIONS.map((scale) => (_jsx("option", { value: String(scale), children: formatDevicePreviewScale(scale) }, scale))) })] }), _jsxs("div", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewImageLabel }), _jsx(PanelOptionSwitch, { options: [
                                { value: "off", label: messages.settings.devicePreviewImageOff },
                                { value: "on", label: messages.settings.devicePreviewImageOn },
                            ], value: captureImageEnabled ? "on" : "off", onChange: (value) => onCaptureImageEnabledChange(value === "on"), ariaLabel: messages.settings.devicePreviewImageAriaLabel })] }), _jsxs("div", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewStatusBarLabel }), _jsx(PanelOptionSwitch, { options: [
                                { value: "off", label: messages.settings.devicePreviewStatusBarOff },
                                { value: "on", label: messages.settings.devicePreviewStatusBarOn },
                            ], value: captureStatusBarEnabled ? "on" : "off", onChange: (value) => onCaptureStatusBarEnabledChange(value === "on"), ariaLabel: messages.settings.devicePreviewStatusBarAriaLabel })] }), _jsx("button", { type: "button", onClick: onCapture, disabled: captureState === "capturing", "aria-label": messages.settings.devicePreviewCaptureAriaLabel, className: "h-[28px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[10px] font-semibold text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)] disabled:opacity-60", children: captureLabel })] }) }));
}
//# sourceMappingURL=MobilePreviewCaptureWindow.js.map