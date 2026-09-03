import { type DevicePreviewScale } from "../../shared/constants/devicePreview.js";
export declare function useDevicePreviewPreference(): {
    devicePreviewUiOpen: boolean;
    setDevicePreviewUiOpen: (open: boolean) => void;
    devicePreviewDeviceId: string;
    setDevicePreviewDeviceId: (deviceId: string) => void;
    devicePreviewScale: 1 | 0.5 | 0.75 | 1.25;
    setDevicePreviewScale: (scale: DevicePreviewScale) => void;
    devicePreviewImageEnabled: boolean;
    setDevicePreviewImageEnabled: (enabled: boolean) => void;
    devicePreviewFitToViewport: boolean;
    setDevicePreviewFitToViewport: (enabled: boolean) => void;
    devicePreviewStatusBarEnabled: boolean;
    setDevicePreviewStatusBarEnabled: (enabled: boolean) => void;
    devicePreviewPreset: import("../../shared/constants/devicePreview.js").DevicePreviewPreset;
};
//# sourceMappingURL=useDevicePreviewPreference.d.ts.map