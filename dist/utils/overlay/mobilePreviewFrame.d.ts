export declare const MOBILE_PREVIEW_FRAME_ATTR = "data-fivepixels-mobile-preview-frame";
export declare const MOBILE_PREVIEW_FRAME_NAME = "fivepixels-mobile-preview-guest";
export declare const MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR = "data-fivepixels-mobile-preview-viewport";
export declare const MOBILE_PREVIEW_GUEST_HTML_CLASS = "fivepixels-mobile-preview-guest";
export declare function isInsideMobilePreviewFrame(): boolean;
/**
 * Prefer the scrolling document root so html padding-top (status-bar safe area)
 * is included in the capture bitmap. body alone omits that inset.
 */
export declare function getMobilePreviewCaptureRoot(iframe: HTMLIFrameElement | null): HTMLElement | null;
export type MobilePreviewCaptureScroll = {
    scrollX: number;
    scrollY: number;
    scrollWidth: number;
    scrollHeight: number;
};
/** Window / scrollingElement scroll used to crop the guest capture to the visible viewport. */
export declare function readMobilePreviewCaptureScroll(iframe: HTMLIFrameElement | null): MobilePreviewCaptureScroll;
export declare function getMobilePreviewGuestDocument(iframe: HTMLIFrameElement | null): Document | null;
export declare function isMobilePreviewGuestDocumentReady(iframe: HTMLIFrameElement | null): boolean;
export declare function getMobilePreviewGuestWindow(iframe: HTMLIFrameElement | null): Window | null;
/** Force the guest document layout viewport to the device logical width so media queries reflow. */
export declare function syncMobilePreviewGuestViewport(doc: Document | null, viewportWidth: number): void;
//# sourceMappingURL=mobilePreviewFrame.d.ts.map