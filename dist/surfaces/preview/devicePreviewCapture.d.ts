export declare const DEVICE_PREVIEW_BUTTON_OUTSET = 3;
export declare function shouldCaptureDevicePreviewNode(node: Node): boolean;
export type DevicePreviewCaptureState = "idle" | "capturing" | "saved" | "failed";
export type DevicePreviewCaptureBezel = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export type DevicePreviewCaptureLayout = {
    canvasWidth: number;
    canvasHeight: number;
    frameWidth: number;
    frameHeight: number;
    screenX: number;
    screenY: number;
    screenWidth: number;
    screenHeight: number;
    outset: number;
};
export type CaptureViewportScroll = {
    scrollX: number;
    scrollY: number;
    scrollWidth: number;
    scrollHeight: number;
};
export type RasterizeOptions = {
    width: number;
    height: number;
    backgroundColor?: string | null;
    cropToViewport?: boolean;
    pixelRatio?: number;
    /** Explicit viewport scroll for document roots (window.scrollX/Y). */
    scrollX?: number;
    scrollY?: number;
    scrollWidth?: number;
    scrollHeight?: number;
};
export type RasterizeElement = (element: HTMLElement, options: RasterizeOptions) => Promise<HTMLCanvasElement>;
export declare function getDevicePreviewCaptureLayout(args: {
    screenWidth: number;
    screenHeight: number;
    bezel: DevicePreviewCaptureBezel;
    deviceImageEnabled: boolean;
}): DevicePreviewCaptureLayout;
export declare function buildDevicePreviewCaptureFilename(args: {
    deviceId: string;
    width: number;
    height: number;
    now?: Date;
}): string;
/**
 * Resolve window / scrollingElement scroll for document roots.
 * Use Math.max — `window.scrollY ?? element.scrollTop` fails when scrollY is 0 but documentElement.scrollTop is not.
 */
export declare function resolveCaptureViewportScroll(element: HTMLElement, guestWindow?: Window | null): CaptureViewportScroll;
/**
 * Shift scroller children so the currently visible region sits at (0,0).
 * html-to-image clones reset scrollTop to 0; translating content makes the clone match the live viewport.
 */
export declare function applyCaptureScrollShift(element: HTMLElement, scrollX: number, scrollY: number): () => void;
/** Recreate every live scroll viewport while keeping the full page as the capture root. */
export declare function applyCaptureScrollShifts(root: HTMLElement, rootScrollX: number, rootScrollY: number): () => void;
export declare function defaultRasterizeElement(element: HTMLElement, options: RasterizeOptions): Promise<HTMLCanvasElement>;
/** Clip the screen region of a capture canvas to a rounded rectangle (visual CSS px). */
export declare function applyCaptureScreenCornerClip(source: HTMLCanvasElement, layout: DevicePreviewCaptureLayout, radius: number): HTMLCanvasElement;
export declare function captureDevicePreview(args: {
    contentRoot: HTMLElement;
    chromeStage: HTMLElement | null;
    statusBarLayer: HTMLElement | null;
    deviceImageEnabled: boolean;
    statusBarEnabled: boolean;
    layout: DevicePreviewCaptureLayout;
    background: string;
    screenCornerRadius?: number;
    contentScrollX?: number;
    contentScrollY?: number;
    contentScrollWidth?: number;
    contentScrollHeight?: number;
    rasterize?: RasterizeElement;
}): Promise<HTMLCanvasElement>;
export declare function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): Promise<void>;
//# sourceMappingURL=devicePreviewCapture.d.ts.map