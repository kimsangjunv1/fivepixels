import type { DevicePreviewCaptureState } from "../../utils/overlay/devicePreviewCapture.js";
export type MobilePreviewCornerStyle = "sharp" | "rounded";
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