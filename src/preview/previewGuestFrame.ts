import { isInsideDevicePreviewFrame } from "@/utils/overlay/devicePreviewFrame.js";
import { isInsideMobilePreviewFrame } from "@/preview/mobilePreviewFrame.js";

export function isInsidePreviewGuestFrame(): boolean {
    return isInsideDevicePreviewFrame() || isInsideMobilePreviewFrame();
}
