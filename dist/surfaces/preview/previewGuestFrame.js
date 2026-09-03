import { isInsideDevicePreviewFrame } from "../../shared/utils/overlay/devicePreviewFrame.js";
import { isInsideMobilePreviewFrame } from "../../surfaces/preview/mobilePreviewFrame.js";
export function isInsidePreviewGuestFrame() {
    return isInsideDevicePreviewFrame() || isInsideMobilePreviewFrame();
}
//# sourceMappingURL=previewGuestFrame.js.map