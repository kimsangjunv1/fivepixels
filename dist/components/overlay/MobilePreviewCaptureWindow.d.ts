import type { DevicePreviewCaptureState } from "../../utils/overlay/devicePreviewCapture.js";
import type { MobilePreviewCornerStyle } from "../../utils/overlay/mobilePreviewLayout.js";
export type { MobilePreviewCornerStyle };
export type MobilePreviewCaptureWindowProps = {
    captureState: DevicePreviewCaptureState;
    captureImageEnabled: boolean;
    captureStatusBarEnabled: boolean;
    captureCornerStyle: MobilePreviewCornerStyle;
    onCaptureImageEnabledChange: (enabled: boolean) => void;
    onCaptureStatusBarEnabledChange: (enabled: boolean) => void;
    onCaptureCornerStyleChange: (style: MobilePreviewCornerStyle) => void;
    onCapture: () => void;
    width?: number;
    className?: string;
};
export declare function MobilePreviewCaptureWindow({ captureState, captureImageEnabled, captureStatusBarEnabled, captureCornerStyle, onCaptureImageEnabledChange, onCaptureStatusBarEnabledChange, onCaptureCornerStyleChange, onCapture, width, className, }: MobilePreviewCaptureWindowProps): import("react").JSX.Element;
//# sourceMappingURL=MobilePreviewCaptureWindow.d.ts.map