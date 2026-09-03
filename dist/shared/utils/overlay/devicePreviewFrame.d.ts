export declare const DEVICE_PREVIEW_FRAME_ATTR = "data-fivepixels-device-preview-frame";
export declare const DEVICE_PREVIEW_FRAME_NAME = "fivepixels-device-preview-guest";
export declare const DEVICE_PREVIEW_GUEST_STYLE_ID = "fivepixels-device-preview-guest-style";
export declare const HTML_DEVICE_PREVIEW_ACTIVE_CLASS = "fivepixels-device-preview-active";
export declare const DEVICE_PREVIEW_HOST_STYLE_ID = "fivepixels-device-preview-host-style";
export type DevicePreviewContentMetrics = {
    scrollY: number;
    scrollHeight: number;
    clientHeight: number;
    left: number;
    top: number;
    width: number;
    viewportWidth: number;
    viewportHeight: number;
};
export declare function isInsideDevicePreviewFrame(): boolean;
export declare function getGuestWindow(iframe: HTMLIFrameElement | null): Window | null;
export declare function getGuestDocument(iframe: HTMLIFrameElement | null): Document | null;
export declare function getGuestCaptureRoot(iframe: HTMLIFrameElement | null): HTMLElement | null;
export declare function isGuestDocumentReady(iframe: HTMLIFrameElement | null): boolean;
export declare function readGuestContentMetrics(iframe: HTMLIFrameElement | null, fallbackWidth: number): DevicePreviewContentMetrics;
export declare function buildDevicePreviewHostStyle(args: {
    background: string;
    line: string;
    gridSize: number;
}): string;
export declare function syncGuestStatusBarStyle(doc: Document | null, statusBarHeight: number): void;
export declare function clearGuestStatusBarStyle(doc: Document | null): void;
export declare function readGuestPageHref(iframe: HTMLIFrameElement | null): string | null;
export declare function closeDevicePreviewAndSyncGuestUrl(iframe: HTMLIFrameElement | null, close: () => void): void;
//# sourceMappingURL=devicePreviewFrame.d.ts.map