export type MobilePreviewOrientation = "portrait" | "landscape";
export declare function useMobilePreviewPreference(): {
    mobilePreviewUiOpen: boolean;
    setMobilePreviewUiOpen: (open: boolean) => void;
    mobilePreviewDeviceId: string;
    setMobilePreviewDeviceId: (deviceId: string) => void;
    mobilePreviewOrientation: MobilePreviewOrientation;
    setMobilePreviewOrientation: (orientation: MobilePreviewOrientation) => void;
    toggleMobilePreviewOrientation: () => void;
    mobilePreviewPreset: import("../../shared/constants/devicePreview.js").DevicePreviewPreset;
};
//# sourceMappingURL=useMobilePreviewPreference.d.ts.map