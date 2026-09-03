import type { DevicePreviewCaptureState } from "../../utils/overlay/devicePreviewCapture.js";
export type MobilePreviewCaptureWindowProps = {
    captureState: DevicePreviewCaptureState;
    captureImageEnabled: boolean;
    captureStatusBarEnabled: boolean;
    onCaptureImageEnabledChange: (enabled: boolean) => void;
    onCaptureStatusBarEnabledChange: (enabled: boolean) => void;
    onCapture: () => void;
    onClose: () => void;
};
export declare function MobilePreviewCaptureWindow({ captureState, captureImageEnabled, captureStatusBarEnabled, onCaptureImageEnabledChange, onCaptureStatusBarEnabledChange, onCapture, onClose, }: MobilePreviewCaptureWindowProps): import("react").JSX.Element;
//# sourceMappingURL=MobilePreviewCaptureWindow.d.ts.map