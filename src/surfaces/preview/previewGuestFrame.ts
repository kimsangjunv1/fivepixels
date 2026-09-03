import { isInsideDevicePreviewFrame } from "@/shared/utils/overlay/devicePreviewFrame.js";
import { isInsideMobilePreviewFrame } from "@/surfaces/preview/mobilePreviewFrame.js";

export function isInsidePreviewGuestFrame(): boolean {
    return isInsideDevicePreviewFrame() || isInsideMobilePreviewFrame();
}
