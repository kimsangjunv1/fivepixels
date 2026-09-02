import { isInsideDevicePreviewFrame } from "../../utils/overlay/devicePreviewFrame.js";
import { isInsideMobilePreviewFrame } from "../../utils/overlay/mobilePreviewFrame.js";
export function isInsidePreviewGuestFrame() {
    return isInsideDevicePreviewFrame() || isInsideMobilePreviewFrame();
}
//# sourceMappingURL=previewGuestFrame.js.map