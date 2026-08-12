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
export type RasterizeOptions = {
    width: number;
    height: number;
    backgroundColor?: string | null;
    cropToViewport?: boolean;
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
export declare function defaultRasterizeElement(element: HTMLElement, options: RasterizeOptions): Promise<HTMLCanvasElement>;
export declare function captureDevicePreview(args: {
    contentRoot: HTMLElement;
    chromeStage: HTMLElement | null;
    statusBarLayer: HTMLElement | null;
    deviceImageEnabled: boolean;
    statusBarEnabled: boolean;
    layout: DevicePreviewCaptureLayout;
    background: string;
    rasterize?: RasterizeElement;
}): Promise<HTMLCanvasElement>;
export declare function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): Promise<void>;
//# sourceMappingURL=devicePreviewCapture.d.ts.map