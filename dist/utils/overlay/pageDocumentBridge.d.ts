export type PageDocumentBridgeState = {
    iframe: HTMLIFrameElement | null;
    fitScale: number;
};
type BridgeListener = () => void;
export declare function notifyPageDocumentBridge(): void;
export declare function isHtmlElement(value: unknown): value is HTMLElement;
export declare function setPageDocumentBridge(next: {
    iframe: HTMLIFrameElement | null;
    fitScale?: number;
}): void;
export declare function clearPageDocumentBridge(): void;
export declare function subscribePageDocumentBridge(listener: BridgeListener): () => void;
export declare function getPageDocumentBridgeState(): PageDocumentBridgeState;
export declare function isPageDocumentBridged(): boolean;
export declare function getPageDocument(): Document;
export declare function getPageWindow(): Window;
export declare function getPageScrollY(): number;
export declare function getPageViewportSize(): {
    width: number;
    height: number;
};
export declare function getPagePathname(): string;
export declare function mapHostPointToPage(clientX: number, clientY: number): {
    x: number;
    y: number;
} | null;
export declare function mapPagePointToHost(pageX: number, pageY: number): {
    x: number;
    y: number;
};
export declare function mapPageRectToHost(rect: DOMRect | DOMRectReadOnly): DOMRectReadOnly;
export declare function getElementHostRect(element: Element): DOMRectReadOnly;
export declare function getPageElementsFromPoint(hostClientX: number, hostClientY: number): HTMLElement[];
export declare function queryPageSelector<T extends Element = Element>(selector: string): T | null;
export declare function queryPageSelectorAll<T extends Element = Element>(selector: string): T[];
/** Navigate inside the preview guest when bridged; otherwise use the host window. */
export declare function assignPageLocation(pathname: string): void;
/** Prefer guest navigation callback when preview is bridged. */
export declare function navigatePagePath(pathname: string, onNavigate?: (pathname: string) => void | Promise<void>): Promise<void>;
export declare function findDevicePreviewFrameElement(): HTMLIFrameElement | null;
export {};
//# sourceMappingURL=pageDocumentBridge.d.ts.map