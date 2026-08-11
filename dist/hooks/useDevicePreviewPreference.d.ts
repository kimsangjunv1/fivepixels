import { type DevicePreviewScale } from "../constants/devicePreview.js";
export declare function useDevicePreviewPreference(): {
    devicePreviewUiOpen: boolean;
    setDevicePreviewUiOpen: (open: boolean) => void;
    devicePreviewDeviceId: string;
    setDevicePreviewDeviceId: (deviceId: string) => void;
    devicePreviewScale: 1 | 0.5 | 0.75 | 1.25;
    setDevicePreviewScale: (scale: DevicePreviewScale) => void;
    devicePreviewImageEnabled: boolean;
    setDevicePreviewImageEnabled: (enabled: boolean) => void;
    devicePreviewPreset: import("../constants/devicePreview.js").DevicePreviewPreset;
};
//# sourceMappingURL=useDevicePreviewPreference.d.ts.map