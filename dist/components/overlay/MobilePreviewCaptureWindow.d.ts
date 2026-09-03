import { type DevicePreviewScale } from "../../constants/devicePreview.js";
import type { DevicePreviewCaptureState } from "../../utils/overlay/devicePreviewCapture.js";
export type MobilePreviewCaptureWindowProps = {
    captureState: DevicePreviewCaptureState;
    captureScale: DevicePreviewScale;
    captureImageEnabled: boolean;
    captureFitToViewport: boolean;
    captureStatusBarEnabled: boolean;
    onCaptureScaleChange: (scale: DevicePreviewScale) => void;
    onCaptureImageEnabledChange: (enabled: boolean) => void;
    onCaptureFitToViewportChange: (enabled: boolean) => void;
    onCaptureStatusBarEnabledChange: (enabled: boolean) => void;
    onCapture: () => void;
    onClose: () => void;
};
export declare function MobilePreviewCaptureWindow({ captureState, captureScale, captureImageEnabled, captureFitToViewport, captureStatusBarEnabled, onCaptureScaleChange, onCaptureImageEnabledChange, onCaptureFitToViewportChange, onCaptureStatusBarEnabledChange, onCapture, onClose, }: MobilePreviewCaptureWindowProps): import("react").JSX.Element;
//# sourceMappingURL=MobilePreviewCaptureWindow.d.ts.map