import { DEVICE_PREVIEW_FRAME_ATTR, getGuestDocument, getGuestWindow, } from "../../../shared/utils/overlay/devicePreviewFrame.js";
let bridgeState = {
    iframe: null,
    fitScale: 1,
};
const listeners = new Set();
function notifyBridgeListeners() {
    for (const listener of listeners) {
        listener();
    }
}
export function notifyPageDocumentBridge() {
    notifyBridgeListeners();
}
export function isHtmlElement(value) {
    return typeof value === "object" && value !== null && value.nodeType === Node.ELEMENT_NODE && "getBoundingClientRect" in value;
}
export function setPageDocumentBridge(next) {
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
export function subscribePageDocumentBridge(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
export function getPageDocumentBridgeState() {
    return bridgeState;
}
export function isPageDocumentBridged() {
    return Boolean(bridgeState.iframe && getGuestDocument(bridgeState.iframe));
}
export function getPageDocument() {
    return getGuestDocument(bridgeState.iframe) ?? document;
}
export function getPageWindow() {
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
    }
    catch {
        return typeof window !== "undefined" ? window.location.pathname || "/" : "/";
    }
}
export function mapHostPointToPage(clientX, clientY) {
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
function toReadOnlyRect(args) {
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
export function mapPagePointToHost(pageX, pageY) {
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
export function mapPageRectToHost(rect) {
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
export function getElementHostRect(element) {
    return mapPageRectToHost(element.getBoundingClientRect());
}
export function getPageElementsFromPoint(hostClientX, hostClientY) {
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
export function queryPageSelector(selector) {
    try {
        const element = getPageDocument().querySelector(selector);
        return element;
    }
    catch {
        return null;
    }
}
export function queryPageSelectorAll(selector) {
    try {
        return Array.from(getPageDocument().querySelectorAll(selector));
    }
    catch {
        return [];
    }
}
/** Navigate inside the preview guest when bridged; otherwise use the host window. */
export function assignPageLocation(pathname) {
    const pageWindow = getPageWindow();
    try {
        pageWindow.location.assign(pathname);
    }
    catch {
        window.location.assign(pathname);
    }
}
/** Prefer guest navigation callback when preview is bridged. */
export async function navigatePagePath(pathname, onNavigate) {
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
export function findDevicePreviewFrameElement() {
    if (typeof document === "undefined") {
        return null;
    }
    return document.querySelector(`iframe[${DEVICE_PREVIEW_FRAME_ATTR}]`);
}
//# sourceMappingURL=pageDocumentBridge.js.map