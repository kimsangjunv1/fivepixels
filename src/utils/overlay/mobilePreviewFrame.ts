export const MOBILE_PREVIEW_FRAME_ATTR = "data-fivepixels-mobile-preview-frame";
export const MOBILE_PREVIEW_FRAME_NAME = "fivepixels-mobile-preview-guest";
export const MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR = "data-fivepixels-mobile-preview-viewport";
export const MOBILE_PREVIEW_GUEST_HTML_CLASS = "fivepixels-mobile-preview-guest";

export function isInsideMobilePreviewFrame(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        if (window.name === MOBILE_PREVIEW_FRAME_NAME) {
            return true;
        }

        const frame = window.frameElement;
        return frame instanceof HTMLIFrameElement && frame.hasAttribute(MOBILE_PREVIEW_FRAME_ATTR);
    } catch {
        return window.name === MOBILE_PREVIEW_FRAME_NAME;
    }
}

export function getMobilePreviewCaptureRoot(iframe: HTMLIFrameElement | null): HTMLElement | null {
    const doc = getMobilePreviewGuestDocument(iframe);

    if (!doc) {
        return null;
    }

    if (doc.body) {
        return doc.body;
    }

    return doc.documentElement;
}

export function getMobilePreviewGuestDocument(iframe: HTMLIFrameElement | null): Document | null {
    if (!iframe) {
        return null;
    }

    try {
        return iframe.contentDocument;
    } catch {
        return null;
    }
}

export function isMobilePreviewGuestDocumentReady(iframe: HTMLIFrameElement | null): boolean {
    const doc = getMobilePreviewGuestDocument(iframe);
    return Boolean(doc?.documentElement);
}

export function getMobilePreviewGuestWindow(iframe: HTMLIFrameElement | null): Window | null {
    if (!iframe) {
        return null;
    }

    try {
        return iframe.contentWindow;
    } catch {
        return null;
    }
}

/** Force the guest document layout viewport to the device logical width so media queries reflow. */
export function syncMobilePreviewGuestViewport(doc: Document | null, viewportWidth: number) {
    if (!doc?.documentElement) {
        return;
    }

    const width = Math.max(1, Math.round(viewportWidth));
    doc.documentElement.classList.add(MOBILE_PREVIEW_GUEST_HTML_CLASS);

    let meta = doc.querySelector(`meta[${MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR}]`) as HTMLMetaElement | null;

    if (!meta) {
        meta = doc.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    }

    if (!meta) {
        meta = doc.createElement("meta");
        meta.setAttribute("name", "viewport");
        doc.head?.prepend(meta);
    }

    meta.setAttribute(MOBILE_PREVIEW_GUEST_VIEWPORT_META_ATTR, "");
    meta.setAttribute("content", `width=${width}, initial-scale=1, viewport-fit=cover`);
}
