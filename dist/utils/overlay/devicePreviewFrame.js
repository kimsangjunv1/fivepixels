import { FIVEPIXELS_HOST_ID } from "../../constants/overlayChrome.js";
export const DEVICE_PREVIEW_FRAME_ATTR = "data-fivepixels-device-preview-frame";
export const DEVICE_PREVIEW_FRAME_NAME = "fivepixels-device-preview-guest";
export const DEVICE_PREVIEW_GUEST_STYLE_ID = "fivepixels-device-preview-guest-style";
export const HTML_DEVICE_PREVIEW_ACTIVE_CLASS = "fivepixels-device-preview-active";
export const DEVICE_PREVIEW_HOST_STYLE_ID = "fivepixels-device-preview-host-style";
export function isInsideDevicePreviewFrame() {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        if (window.name === DEVICE_PREVIEW_FRAME_NAME) {
            return true;
        }
        const frame = window.frameElement;
        return frame instanceof HTMLIFrameElement && frame.hasAttribute(DEVICE_PREVIEW_FRAME_ATTR);
    }
    catch {
        return window.name === DEVICE_PREVIEW_FRAME_NAME;
    }
}
export function getGuestWindow(iframe) {
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
export function getGuestDocument(iframe) {
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
export function getGuestCaptureRoot(iframe) {
    const doc = getGuestDocument(iframe);
    if (!doc) {
        return null;
    }
    if (doc.body) {
        return doc.body;
    }
    return doc.documentElement;
}
export function isGuestDocumentReady(iframe) {
    const doc = getGuestDocument(iframe);
    return Boolean(doc?.documentElement);
}
export function readGuestContentMetrics(iframe, fallbackWidth) {
    const guestWindow = getGuestWindow(iframe);
    const guestDocument = getGuestDocument(iframe);
    const scrolling = guestDocument?.scrollingElement ?? guestDocument?.documentElement;
    const rect = iframe?.getBoundingClientRect();
    return {
        scrollY: Math.round(guestWindow?.scrollY ?? scrolling?.scrollTop ?? 0),
        scrollHeight: Math.round(scrolling?.scrollHeight ?? 0),
        clientHeight: Math.round(guestWindow?.innerHeight ?? scrolling?.clientHeight ?? 0),
        left: Math.round(rect?.left ?? 0),
        top: Math.round(rect?.top ?? 0),
        width: Math.round(rect?.width ?? fallbackWidth),
        viewportWidth: typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 1280,
        viewportHeight: typeof window !== "undefined" && window.innerHeight > 0 ? window.innerHeight : 800,
    };
}
export function buildDevicePreviewHostStyle(args) {
    const { background, line, gridSize } = args;
    const active = `html.${HTML_DEVICE_PREVIEW_ACTIVE_CLASS}`;
    return `
${active},
${active} body {
  height: 100% !important;
  max-height: 100% !important;
  overflow: hidden !important;
  background-color: ${background} !important;
  background-image: linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px) !important;
  background-size: ${gridSize}px ${gridSize}px !important;
}

${active} body > :not(#${FIVEPIXELS_HOST_ID}) {
  display: none !important;
}

${active} #${FIVEPIXELS_HOST_ID} {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  pointer-events: none !important;
  z-index: 2147483646 !important;
}
`;
}
export function syncGuestStatusBarStyle(doc, statusBarHeight) {
    if (!doc) {
        return;
    }
    const safeHeight = Math.max(0, Math.round(statusBarHeight));
    if (safeHeight <= 0) {
        doc.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID)?.remove();
        return;
    }
    let style = doc.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID);
    if (!style) {
        style = doc.createElement("style");
        style.id = DEVICE_PREVIEW_GUEST_STYLE_ID;
        doc.documentElement.append(style);
    }
    style.textContent = `
html {
  padding-top: ${safeHeight}px !important;
  box-sizing: border-box !important;
}
`;
}
export function clearGuestStatusBarStyle(doc) {
    doc?.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID)?.remove();
}
export function readGuestPageHref(iframe) {
    try {
        const href = iframe?.contentWindow?.location.href;
        if (!href || href.startsWith("about:")) {
            return null;
        }
        return href;
    }
    catch {
        return null;
    }
}
export function closeDevicePreviewAndSyncGuestUrl(iframe, close) {
    const guestHref = readGuestPageHref(iframe);
    close();
    if (guestHref && guestHref !== window.location.href) {
        window.location.replace(guestHref);
    }
}
//# sourceMappingURL=devicePreviewFrame.js.map