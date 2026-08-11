import type { DevicePreviewPreset } from "../../constants/devicePreview.js";
type StatusBarAppearance = "light" | "dark";
type DeviceStatusBarProps = {
    preset: DevicePreviewPreset;
    width: number;
    scale?: number;
    appearance?: StatusBarAppearance;
};
export declare function getDeviceStatusBarHeight(preset: DevicePreviewPreset, screenWidth: number, scale?: number): number;
export declare function DeviceStatusBar({ preset, width, scale, appearance, }: DeviceStatusBarProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=DeviceStatusBar.d.ts.map