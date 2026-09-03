export const MOBILE_PREVIEW_FRAME_ATTR = "data-fivepixels-mobile-preview-frame";
export const MOBILE_PREVIEW_FRAME_NAME = "fivepixels-mobile-preview-guest";
export const MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR = "data-fivepixels-mobile-preview-viewport";
export const MOBILE_PREVIEW_GUEST_HTML_CLASS = "fivepixels-mobile-preview-guest";
export function isInsideMobilePreviewFrame() {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        if (window.name === MOBILE_PREVIEW_FRAME_NAME) {
            return true;
        }
        const frame = window.frameElement;
        return frame instanceof HTMLIFrameElement && frame.hasAttribute(MOBILE_PREVIEW_FRAME_ATTR);
    }
    catch {
        return window.name === MOBILE_PREVIEW_FRAME_NAME;
    }
}
/**
 * Prefer the scrolling document root so html padding-top (status-bar safe area)
 * is included in the capture bitmap. body alone omits that inset.
 */
export function getMobilePreviewCaptureRoot(iframe) {
    const doc = getMobilePreviewGuestDocument(iframe);
    if (!doc?.documentElement) {
        return null;
    }
    if (doc.scrollingElement instanceof HTMLElement) {
        return doc.scrollingElement;
    }
    return doc.documentElement;
}
/** Window / scrollingElement scroll used to crop the guest capture to the visible viewport. */
export function readMobilePreviewCaptureScroll(iframe) {
    const guestWindow = getMobilePreviewGuestWindow(iframe);
    const guestDocument = getMobilePreviewGuestDocument(iframe);
    const scrolling = guestDocument?.scrollingElement ?? guestDocument?.documentElement ?? null;
    // Do not use `??` — scrollY can be 0 while scrollingElement.scrollTop is the real offset.
    const scrollX = Math.max(0, Math.round(Math.max(guestWindow?.scrollX ?? 0, scrolling?.scrollLeft ?? 0)));
    const scrollY = Math.max(0, Math.round(Math.max(guestWindow?.scrollY ?? 0, scrolling?.scrollTop ?? 0)));
    const viewportWidth = Math.max(0, Math.round(guestWindow?.innerWidth ?? scrolling?.clientWidth ?? 0));
    const viewportHeight = Math.max(0, Math.round(guestWindow?.innerHeight ?? scrolling?.clientHeight ?? 0));
    return {
        scrollX,
        scrollY,
        scrollWidth: Math.round(Math.max(scrolling?.scrollWidth ?? 0, viewportWidth + scrollX)),
        scrollHeight: Math.round(Math.max(scrolling?.scrollHeight ?? 0, viewportHeight + scrollY)),
    };
}
export function getMobilePreviewGuestDocument(iframe) {
    if (!iframe) {
        return null;
    }
    try {
        return iframe.contentDocument;
    }
    catch {
        return null;
    }
}
export function isMobilePreviewGuestDocumentReady(iframe) {
    const doc = getMobilePreviewGuestDocument(iframe);
    return Boolean(doc?.documentElement);
}
export function getMobilePreviewGuestWindow(iframe) {
    if (!iframe) {
        return null;
    }
    try {
        return iframe.contentWindow;
    }
    catch {
        return null;
    }
}
/** Force the guest document layout viewport to the device logical width so media queries reflow. */
export function syncMobilePreviewGuestViewport(doc, viewportWidth) {
    if (!doc?.documentElement) {
        return;
    }
    const width = Math.max(1, Math.round(viewportWidth));
    doc.documentElement.classList.add(MOBILE_PREVIEW_GUEST_HTML_CLASS);
    let meta = doc.querySelector(`meta[${MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR}]`);
    if (!meta) {
        meta = doc.querySelector('meta[name="viewport"]');
    }
    if (!meta) {
        meta = doc.createElement("meta");
        meta.setAttribute("name", "viewport");
        doc.head?.prepend(meta);
    }
    meta.setAttribute(MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR, "");
    meta.setAttribute("content", `width=${width}, initial-scale=1, viewport-fit=cover`);
}
//# sourceMappingURL=mobilePreviewFrame.js.map