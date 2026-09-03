import { type DeviceChromeSpec, type DevicePreviewPreset } from "../../constants/devicePreview.js";
type DeviceFrameArtworkProps = {
    preset: DevicePreviewPreset;
    chrome: DeviceChromeSpec;
    screenWidth: number;
    screenHeight: number;
    orientation?: "portrait" | "landscape";
};
export declare function DeviceFrameArtwork(props: DeviceFrameArtworkProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=DeviceFrameArtwork.d.ts.map