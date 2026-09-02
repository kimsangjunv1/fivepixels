import type { DevicePreviewPreset } from "@/constants/devicePreview.js";
import type { MobilePreviewOrientation } from "@/hooks/useMobilePreviewPreference.js";

export function resolveMobilePreviewScreenSize(preset: DevicePreviewPreset, orientation: MobilePreviewOrientation) {
    if (orientation === "landscape") {
        return {
            width: preset.height,
            height: preset.width,
        };
    }

    return {
        width: preset.width,
        height: preset.height,
    };
}
