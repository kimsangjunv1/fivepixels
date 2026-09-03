import { OptionSwitch } from "@/components/ui/OptionSwitch.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import type { DevicePreviewCaptureState } from "@/preview/devicePreviewCapture.js";
import type { MobilePreviewCornerStyle } from "@/preview/mobilePreviewLayout.js";
import { MOBILE_PREVIEW_SIDE_PANEL_WIDTH } from "@/preview/mobilePreviewSidePanels.js";

export type { MobilePreviewCornerStyle };

export type CapturePanelProps = {
    captureState: DevicePreviewCaptureState;
    captureImageEnabled: boolean;
    captureStatusBarEnabled: boolean;
    captureCornerStyle: MobilePreviewCornerStyle;
    onCaptureImageEnabledChange: (enabled: boolean) => void;
    onCaptureStatusBarEnabledChange: (enabled: boolean) => void;
    onCaptureCornerStyleChange: (style: MobilePreviewCornerStyle) => void;
    onCapture: () => void;
    width?: number;
    className?: string;
};

export function CapturePanel({
    captureState,
    captureImageEnabled,
    captureStatusBarEnabled,
    captureCornerStyle,
    onCaptureImageEnabledChange,
    onCaptureStatusBarEnabledChange,
    onCaptureCornerStyleChange,
    onCapture,
    width = MOBILE_PREVIEW_SIDE_PANEL_WIDTH,
    className = "",
}: CapturePanelProps) {
    const { messages } = useReportPreferences();
    const captureLabel =
        captureState === "capturing"
            ? messages.settings.devicePreviewCaptureCapturingLabel
            : captureState === "saved"
              ? messages.settings.devicePreviewCaptureSavedLabel
              : captureState === "failed"
                ? messages.settings.devicePreviewCaptureFailedLabel
                : messages.settings.devicePreviewCaptureLabel;

    return (
        <div
            data-fivepixels-interactive=""
            data-chrome="mobile-preview-capture-panel"
            className={`pointer-events-auto flex flex-col gap-[10px] rounded-[12px] bg-[var(--adaptive-fillOpacity700)] px-[12px] py-[12px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px] ${className}`.trim()}
            style={{ width }}
            role="toolbar"
            aria-label={messages.settings.devicePreviewFloatingAriaLabel}
        >
            <div className="truncate text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.settings.devicePreviewFloatingAriaLabel}</div>

            <div className="flex flex-col gap-[3px]">
                <span className="text-[9px] font-semibold text-[var(--adaptive-black500)]">{messages.settings.devicePreviewImageLabel}</span>
                <OptionSwitch
                    options={[
                        { value: "off", label: messages.settings.devicePreviewImageOff },
                        { value: "on", label: messages.settings.devicePreviewImageOn },
                    ]}
                    value={captureImageEnabled ? "on" : "off"}
                    onChange={(value) => onCaptureImageEnabledChange(value === "on")}
                    ariaLabel={messages.settings.devicePreviewImageAriaLabel}
                />
            </div>

            {!captureImageEnabled ? (
                <div className="flex flex-col gap-[3px]">
                    <span className="text-[9px] font-semibold text-[var(--adaptive-black500)]">{messages.settings.mobilePreviewCornerStyleLabel}</span>
                    <OptionSwitch
                        options={[
                            { value: "sharp", label: messages.settings.mobilePreviewCornerStyleSharp },
                            { value: "rounded", label: messages.settings.mobilePreviewCornerStyleRounded },
                        ]}
                        value={captureCornerStyle}
                        onChange={(value) => onCaptureCornerStyleChange(value as MobilePreviewCornerStyle)}
                        ariaLabel={messages.settings.mobilePreviewCornerStyleAriaLabel}
                    />
                </div>
            ) : null}

            <div className="flex flex-col gap-[3px]">
                <span className="text-[9px] font-semibold text-[var(--adaptive-black500)]">{messages.settings.devicePreviewStatusBarLabel}</span>
                <OptionSwitch
                    options={[
                        { value: "off", label: messages.settings.devicePreviewStatusBarOff },
                        { value: "on", label: messages.settings.devicePreviewStatusBarOn },
                    ]}
                    value={captureStatusBarEnabled ? "on" : "off"}
                    onChange={(value) => onCaptureStatusBarEnabledChange(value === "on")}
                    ariaLabel={messages.settings.devicePreviewStatusBarAriaLabel}
                />
            </div>

            <button
                type="button"
                onClick={onCapture}
                disabled={captureState === "capturing"}
                aria-label={messages.settings.devicePreviewCaptureAriaLabel}
                className="h-[28px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[10px] font-semibold text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)] disabled:opacity-60"
            >
                {captureLabel}
            </button>
        </div>
    );
}
