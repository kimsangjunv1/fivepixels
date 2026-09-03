import { useCallback, useState } from "react";
import { PanelOptionSwitch } from "@/components/panel/PanelOptionSwitch.js";
import { OverlayShell, type FloatingWindowMode } from "@/components/ui/OverlayShell.js";
import type { WindowPosition } from "@/hooks/useDraggableWindow.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import type { DevicePreviewCaptureState } from "@/utils/overlay/devicePreviewCapture.js";

const MOBILE_PREVIEW_CAPTURE_BAR_STORAGE_KEY = "fivepixels:mobile-preview-capture-bar-position:v1";

function readMobilePreviewCaptureBarPosition(): WindowPosition {
    const fallback = getDefaultMobilePreviewCaptureBarPosition();

    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(MOBILE_PREVIEW_CAPTURE_BAR_STORAGE_KEY);

        if (!raw) {
            return fallback;
        }

        const parsed = JSON.parse(raw) as Partial<WindowPosition>;

        if (typeof parsed.left === "number" && Number.isFinite(parsed.left) && typeof parsed.top === "number" && Number.isFinite(parsed.top)) {
            return { left: parsed.left, top: parsed.top };
        }
    } catch {
        // Ignore storage failures.
    }

    return fallback;
}

function getDefaultMobilePreviewCaptureBarPosition(): WindowPosition {
    if (typeof window === "undefined") {
        return { left: 80, top: 640 };
    }

    return {
        left: Math.max(16, window.innerWidth - 260),
        top: Math.max(16, window.innerHeight - 420),
    };
}

function persistMobilePreviewCaptureBarPosition(position: WindowPosition) {
    try {
        window.localStorage.setItem(MOBILE_PREVIEW_CAPTURE_BAR_STORAGE_KEY, JSON.stringify(position));
    } catch {
        // Ignore storage failures.
    }
}

export type MobilePreviewCaptureWindowProps = {
    captureState: DevicePreviewCaptureState;
    captureImageEnabled: boolean;
    captureStatusBarEnabled: boolean;
    onCaptureImageEnabledChange: (enabled: boolean) => void;
    onCaptureStatusBarEnabledChange: (enabled: boolean) => void;
    onCapture: () => void;
    onClose: () => void;
};

export function MobilePreviewCaptureWindow({
    captureState,
    captureImageEnabled,
    captureStatusBarEnabled,
    onCaptureImageEnabledChange,
    onCaptureStatusBarEnabledChange,
    onCapture,
    onClose,
}: MobilePreviewCaptureWindowProps) {
    const { messages } = useReportPreferences();
    const [position, setPosition] = useState<WindowPosition>(() => readMobilePreviewCaptureBarPosition());
    const [mode, setMode] = useState<FloatingWindowMode>("normal");
    const captureLabel =
        captureState === "capturing"
            ? messages.settings.devicePreviewCaptureCapturingLabel
            : captureState === "saved"
              ? messages.settings.devicePreviewCaptureSavedLabel
              : captureState === "failed"
                ? messages.settings.devicePreviewCaptureFailedLabel
                : messages.settings.devicePreviewCaptureLabel;

    const handlePositionChange = useCallback((next: WindowPosition) => {
        setPosition(next);
        persistMobilePreviewCaptureBarPosition(next);
    }, []);

    return (
        <OverlayShell
            windowId="mobile-preview-capture-toolbar"
            minimizePolicy="dock"
            dataChrome="mobile-preview-capture-toolbar"
            role="toolbar"
            ariaLabel={messages.settings.devicePreviewFloatingAriaLabel}
            position={position}
            onPositionChange={handlePositionChange}
            mode={mode}
            onModeChange={setMode}
            width={220}
            minWidth={200}
            minHeight={160}
            resizable
            resizeAriaLabel={messages.marker.resizeAriaLabel}
            contentClassName="px-[12px] pb-[12px]"
            minimizedDockSubtitle={messages.settings.devicePreviewFloatingAriaLabel}
            controls={{
                onClose,
                closeAriaLabel: messages.marker.windowCloseAriaLabel,
                minimizeAriaLabel: messages.marker.windowMinimizeAriaLabel,
                maximizeAriaLabel: messages.marker.windowMaximizeAriaLabel,
                restoreAriaLabel: messages.marker.windowRestoreAriaLabel,
                moreAriaLabel: messages.marker.windowControlsMoreAriaLabel,
            }}
            title={
                <span className="truncate text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.settings.devicePreviewFloatingAriaLabel}</span>
            }
        >
            <div className="flex w-full flex-col gap-[10px]">
                <div className="flex flex-col gap-[3px]">
                    <span className="text-[9px] font-semibold text-[var(--adaptive-black500)]">{messages.settings.devicePreviewImageLabel}</span>
                    <PanelOptionSwitch
                        options={[
                            { value: "off", label: messages.settings.devicePreviewImageOff },
                            { value: "on", label: messages.settings.devicePreviewImageOn },
                        ]}
                        value={captureImageEnabled ? "on" : "off"}
                        onChange={(value) => onCaptureImageEnabledChange(value === "on")}
                        ariaLabel={messages.settings.devicePreviewImageAriaLabel}
                    />
                </div>

                <div className="flex flex-col gap-[3px]">
                    <span className="text-[9px] font-semibold text-[var(--adaptive-black500)]">{messages.settings.devicePreviewStatusBarLabel}</span>
                    <PanelOptionSwitch
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
        </OverlayShell>
    );
}
