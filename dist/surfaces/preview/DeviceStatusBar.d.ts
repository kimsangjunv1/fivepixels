import { type DevicePreviewPreset } from "../../shared/constants/devicePreview.js";
type StatusBarAppearance = "light" | "dark";
type DeviceStatusBarProps = {
    preset: DevicePreviewPreset;
    width: number;
    screenHeight?: number;
    scale?: number;
    appearance?: StatusBarAppearance;
    showCutout?: boolean;
    orientation?: "portrait" | "landscape";
    referenceLogicalWidth?: number;
};
export declare function getDeviceStatusBarHeight(preset: DevicePreviewPreset, screenWidth: number, scale?: number, referenceLogicalWidth?: number): number;
export declare function DeviceStatusBar({ preset, width, screenHeight, scale, appearance, showCutout, orientation, referenceLogicalWidth, }: DeviceStatusBarProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=DeviceStatusBar.d.ts.map