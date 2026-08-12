import {
    DEVICE_PREVIEW_FRAME_ATTR,
    getGuestDocument,
    getGuestWindow,
} from "@/utils/overlay/devicePreviewFrame.js";

export type PageDocumentBridgeState = {
    iframe: HTMLIFrameElement | null;
    fitScale: number;
};

type BridgeListener = () => void;

let bridgeState: PageDocumentBridgeState = {
    iframe: null,
    fitScale: 1,
};

const listeners = new Set<BridgeListener>();

function notifyBridgeListeners() {
    for (const listener of listeners) {
        listener();
    }
}

export function notifyPageDocumentBridge() {
    notifyBridgeListeners();
}

export function isHtmlElement(value: unknown): value is HTMLElement {
    return typeof value === "object" && value !== null && (value as Node).nodeType === Node.ELEMENT_NODE && "getBoundingClientRect" in value;
}

export function setPageDocumentBridge(next: { iframe: HTMLIFrameElement | null; fitScale?: number }) {
    const fitScale = next.fitScale === undefined ? bridgeState.fitScale : Math.max(0.01, next.fitScale);
    const iframe = next.iframe;
    const changed = bridgeState.iframe !== iframe || bridgeState.fitScale !== fitScale;

    bridgeState = { iframe, fitScale };

    if (changed) {
        notifyBridgeListeners();
    }
}

export function clearPageDocumentBridge() {
    if (!bridgeState.iframe && bridgeState.fitScale === 1) {
        return;
    }

    bridgeState = { iframe: null, fitScale: 1 };
    notifyBridgeListeners();
}

export function subscribePageDocumentBridge(listener: BridgeListener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getPageDocumentBridgeState(): PageDocumentBridgeState {
    return bridgeState;
}

export function isPageDocumentBridged() {
    return Boolean(bridgeState.iframe && getGuestDocument(bridgeState.iframe));
}

export function getPageDocument(): Document {
    return getGuestDocument(bridgeState.iframe) ?? document;
}

export function getPageWindow(): Window {
    return getGuestWindow(bridgeState.iframe) ?? window;
}

export function getPageScrollY() {
    const pageWindow = getPageWindow();
    if (Number.isFinite(pageWindow.scrollY)) {
        return pageWindow.scrollY;
    }

    const scrolling = getPageDocument().scrollingElement ?? getPageDocument().documentElement;
    return scrolling?.scrollTop ?? 0;
}

export function getPageViewportSize() {
    const pageWindow = getPageWindow();
    return {
        width: pageWindow.innerWidth > 0 ? pageWindow.innerWidth : 1,
        height: pageWindow.innerHeight > 0 ? pageWindow.innerHeight : 1,
    };
}

export function getPagePathname() {
    try {
        const pathname = getPageWindow().location.pathname;
        return pathname || "/";
    } catch {
        return typeof window !== "undefined" ? window.location.pathname || "/" : "/";
    }
}

export function mapHostPointToPage(clientX: number, clientY: number): { x: number; y: number } | null {
    const iframe = bridgeState.iframe;
    if (!iframe || !getGuestDocument(iframe)) {
        return { x: clientX, y: clientY };
    }

    const rect = iframe.getBoundingClientRect();
    const scale = bridgeState.fitScale;
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    const width = iframe.offsetWidth || rect.width / scale;
    const height = iframe.offsetHeight || rect.height / scale;

    if (x < 0 || y < 0 || x > width || y > height) {
        return null;
    }

    return { x, y };
}

function toReadOnlyRect(args: { left: number; top: number; width: number; height: number }): DOMRectReadOnly {
    const right = args.left + args.width;
    const bottom = args.top + args.height;

    return {
        x: args.left,
        y: args.top,
        left: args.left,
        top: args.top,
        width: args.width,
        height: args.height,
        right,
        bottom,
        toJSON() {
            return {
                x: args.left,
                y: args.top,
                left: args.left,
                top: args.top,
                width: args.width,
                height: args.height,
                right,
                bottom,
            };
        },
    };
}

export function mapPagePointToHost(pageX: number, pageY: number): { x: number; y: number } {
    const iframe = bridgeState.iframe;
    if (!iframe || !getGuestDocument(iframe)) {
        return { x: pageX, y: pageY };
    }

    const frameRect = iframe.getBoundingClientRect();
    const scale = bridgeState.fitScale;

    return {
        x: frameRect.left + pageX * scale,
        y: frameRect.top + pageY * scale,
    };
}

export function mapPageRectToHost(rect: DOMRect | DOMRectReadOnly): DOMRectReadOnly {
    const iframe = bridgeState.iframe;
    if (!iframe || !getGuestDocument(iframe)) {
        return rect;
    }

    const frameRect = iframe.getBoundingClientRect();
    const scale = bridgeState.fitScale;

    return toReadOnlyRect({
        left: frameRect.left + rect.left * scale,
        top: frameRect.top + rect.top * scale,
        width: rect.width * scale,
        height: rect.height * scale,
    });
}

export function getElementHostRect(element: Element): DOMRectReadOnly {
    return mapPageRectToHost(element.getBoundingClientRect());
}

export function getPageElementsFromPoint(hostClientX: number, hostClientY: number): HTMLElement[] {
    const pagePoint = mapHostPointToPage(hostClientX, hostClientY);
    if (!pagePoint) {
        return [];
    }

    const pageDocument = getPageDocument();

    if (typeof pageDocument.elementsFromPoint === "function") {
        return pageDocument.elementsFromPoint(pagePoint.x, pagePoint.y).filter(isHtmlElement);
    }

    if (typeof pageDocument.elementFromPoint === "function") {
        const hit = pageDocument.elementFromPoint(pagePoint.x, pagePoint.y);
        return isHtmlElement(hit) ? [hit] : [];
    }

    return [];
}

export function queryPageSelector<T extends Element = Element>(selector: string): T | null {
    try {
        const element = getPageDocument().querySelector(selector);
        return element as T | null;
    } catch {
        return null;
    }
}

export function queryPageSelectorAll<T extends Element = Element>(selector: string): T[] {
    try {
        return Array.from(getPageDocument().querySelectorAll(selector)) as T[];
    } catch {
        return [];
    }
}

/** Navigate inside the preview guest when bridged; otherwise use the host window. */
export function assignPageLocation(pathname: string) {
    const pageWindow = getPageWindow();

    try {
        pageWindow.location.assign(pathname);
    } catch {
        window.location.assign(pathname);
    }
}

/** Prefer guest navigation callback when preview is bridged. */
export async function navigatePagePath(pathname: string, onNavigate?: (pathname: string) => void | Promise<void>) {
    if (isPageDocumentBridged()) {
        assignPageLocation(pathname);
        notifyPageDocumentBridge();
        return;
    }

    if (onNavigate) {
        await onNavigate(pathname);
        return;
    }

    assignPageLocation(pathname);
}

export function findDevicePreviewFrameElement(): HTMLIFrameElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    return document.querySelector<HTMLIFrameElement>(`iframe[${DEVICE_PREVIEW_FRAME_ATTR}]`);
}
