import { isInsideDevicePreviewFrame } from "../utils/overlay/devicePreviewFrame.js";
import { isInsideMobilePreviewFrame } from "../preview/mobilePreviewFrame.js";
export function isInsidePreviewGuestFrame() {
    return isInsideDevicePreviewFrame() || isInsideMobilePreviewFrame();
}
//# sourceMappingURL=previewGuestFrame.js.map