import { FIVEPIXELS_HOST_ID } from "@/constants/overlayChrome.js";

export const DEVICE_PREVIEW_FRAME_ATTR = "data-fivepixels-device-preview-frame";
export const DEVICE_PREVIEW_FRAME_NAME = "fivepixels-device-preview-guest";
export const DEVICE_PREVIEW_GUEST_STYLE_ID = "fivepixels-device-preview-guest-style";
export const HTML_DEVICE_PREVIEW_ACTIVE_CLASS = "fivepixels-device-preview-active";
export const DEVICE_PREVIEW_HOST_STYLE_ID = "fivepixels-device-preview-host-style";

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

export function isInsideDevicePreviewFrame(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        if (window.name === DEVICE_PREVIEW_FRAME_NAME) {
            return true;
        }

        const frame = window.frameElement;
        return frame instanceof HTMLIFrameElement && frame.hasAttribute(DEVICE_PREVIEW_FRAME_ATTR);
    } catch {
        return window.name === DEVICE_PREVIEW_FRAME_NAME;
    }
}

export function getGuestWindow(iframe: HTMLIFrameElement | null): Window | null {
    if (!iframe) {
        return null;
    }

    try {
        return iframe.contentWindow;
    } catch {
        return null;
    }
}

export function getGuestDocument(iframe: HTMLIFrameElement | null): Document | null {
    if (!iframe) {
        return null;
    }

    try {
        return iframe.contentDocument;
    } catch {
        return null;
    }
}

export function getGuestCaptureRoot(iframe: HTMLIFrameElement | null): HTMLElement | null {
    const doc = getGuestDocument(iframe);
    if (!doc) {
        return null;
    }

    if (doc.body) {
        return doc.body;
    }

    return doc.documentElement;
}

export function isGuestDocumentReady(iframe: HTMLIFrameElement | null): boolean {
    const doc = getGuestDocument(iframe);
    return Boolean(doc?.documentElement);
}

export function readGuestContentMetrics(iframe: HTMLIFrameElement | null, fallbackWidth: number): DevicePreviewContentMetrics {
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

export function buildDevicePreviewHostStyle(args: { background: string; line: string; gridSize: number }): string {
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

export function syncGuestStatusBarStyle(doc: Document | null, statusBarHeight: number) {
    if (!doc) {
        return;
    }

    const safeHeight = Math.max(0, Math.round(statusBarHeight));

    if (safeHeight <= 0) {
        doc.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID)?.remove();
        return;
    }

    let style = doc.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID) as HTMLStyleElement | null;
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

export function clearGuestStatusBarStyle(doc: Document | null) {
    doc?.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID)?.remove();
}

export function readGuestPageHref(iframe: HTMLIFrameElement | null): string | null {
    try {
        const href = iframe?.contentWindow?.location.href;
        if (!href || href.startsWith("about:")) {
            return null;
        }

        return href;
    } catch {
        return null;
    }
}

export function closeDevicePreviewAndSyncGuestUrl(iframe: HTMLIFrameElement | null, close: () => void) {
    const guestHref = readGuestPageHref(iframe);
    close();

    if (guestHref && guestHref !== window.location.href) {
        window.location.replace(guestHref);
    }
}
