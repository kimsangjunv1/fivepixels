import type { DevicePreviewCaptureState } from "../preview/devicePreviewCapture.js";
import type { MobilePreviewCornerStyle } from "../preview/mobilePreviewLayout.js";
export type { MobilePreviewCornerStyle };
export type CapturePanelProps = {
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
export declare function CapturePanel({ captureState, captureImageEnabled, captureStatusBarEnabled, captureCornerStyle, onCaptureImageEnabledChange, onCaptureStatusBarEnabledChange, onCaptureCornerStyleChange, onCapture, width, className, }: CapturePanelProps): import("react").JSX.Element;
//# sourceMappingURL=CapturePanel.d.ts.map