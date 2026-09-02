import { isInsideDevicePreviewFrame } from "@/utils/overlay/devicePreviewFrame.js";
import { isInsideMobilePreviewFrame } from "@/utils/overlay/mobilePreviewFrame.js";

export function isInsidePreviewGuestFrame(): boolean {
    return isInsideDevicePreviewFrame() || isInsideMobilePreviewFrame();
}
