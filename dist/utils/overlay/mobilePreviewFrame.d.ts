export declare const MOBILE_PREVIEW_FRAME_ATTR = "data-fivepixels-mobile-preview-frame";
export declare const MOBILE_PREVIEW_FRAME_NAME = "fivepixels-mobile-preview-guest";
export declare const MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR = "data-fivepixels-mobile-preview-viewport";
export declare const MOBILE_PREVIEW_GUEST_HTML_CLASS = "fivepixels-mobile-preview-guest";
export declare function isInsideMobilePreviewFrame(): boolean;
export declare function getMobilePreviewGuestDocument(iframe: HTMLIFrameElement | null): Document | null;
export declare function isMobilePreviewGuestDocumentReady(iframe: HTMLIFrameElement | null): boolean;
export declare function getMobilePreviewGuestWindow(iframe: HTMLIFrameElement | null): Window | null;
/** Force the guest document layout viewport to the device logical width so media queries reflow. */
export declare function syncMobilePreviewGuestViewport(doc: Document | null, viewportWidth: number): void;
//# sourceMappingURL=mobilePreviewFrame.d.ts.map