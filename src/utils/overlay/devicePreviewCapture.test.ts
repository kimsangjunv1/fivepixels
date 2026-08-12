import { afterEach, describe, expect, it, vi } from "vitest";
import {
    DEVICE_PREVIEW_BUTTON_OUTSET,
    buildDevicePreviewCaptureFilename,
    captureDevicePreview,
    getDevicePreviewCaptureLayout,
    type RasterizeOptions,
} from "./devicePreviewCapture.js";

function stubCanvasContext() {
    const context = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        fillStyle: "",
    };

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    return context;
}

describe("devicePreviewCapture", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("includes the device bezel and button outset when the device image is on", () => {
        expect(
            getDevicePreviewCaptureLayout({
                screenWidth: 375,
                screenHeight: 667,
                bezel: { top: 40, right: 12, bottom: 40, left: 12 },
                deviceImageEnabled: true,
            }),
        ).toEqual({
            canvasWidth: 375 + 12 + 12 + DEVICE_PREVIEW_BUTTON_OUTSET * 2,
            canvasHeight: 667 + 40 + 40 + DEVICE_PREVIEW_BUTTON_OUTSET * 2,
            frameWidth: 399,
            frameHeight: 747,
            screenX: DEVICE_PREVIEW_BUTTON_OUTSET + 12,
            screenY: DEVICE_PREVIEW_BUTTON_OUTSET + 40,
            screenWidth: 375,
            screenHeight: 667,
            outset: DEVICE_PREVIEW_BUTTON_OUTSET,
        });
    });

    it("captures only the screen when the device image is off", () => {
        expect(
            getDevicePreviewCaptureLayout({
                screenWidth: 375,
                screenHeight: 667,
                bezel: { top: 40, right: 12, bottom: 40, left: 12 },
                deviceImageEnabled: false,
            }),
        ).toEqual({
            canvasWidth: 375,
            canvasHeight: 667,
            frameWidth: 375,
            frameHeight: 667,
            screenX: 0,
            screenY: 0,
            screenWidth: 375,
            screenHeight: 667,
            outset: 0,
        });
    });

    it("builds a stable download filename from the device and resolution", () => {
        expect(
            buildDevicePreviewCaptureFilename({
                deviceId: "iphone-se",
                width: 375,
                height: 667,
                now: new Date(2026, 7, 12, 10, 17, 8),
            }),
        ).toBe("fivepixels-preview-iphone-se-375x667-20260812-101708.png");
        expect(
            buildDevicePreviewCaptureFilename({
                deviceId: "Galaxy S24 Ultra!!",
                width: 384,
                height: 832,
                now: new Date(2026, 0, 2, 3, 4, 5),
            }),
        ).toBe("fivepixels-preview-Galaxy-S24-Ultra-384x832-20260102-030405.png");
    });

    it("rasterizes the page and chrome when the device image is enabled", async () => {
        stubCanvasContext();
        const contentRoot = document.createElement("div");
        const chromeStage = document.createElement("div");
        const statusBarLayer = document.createElement("div");
        const layout = getDevicePreviewCaptureLayout({
            screenWidth: 100,
            screenHeight: 200,
            bezel: { top: 10, right: 8, bottom: 12, left: 8 },
            deviceImageEnabled: true,
        });
        const calls: Array<{ element: HTMLElement; options: RasterizeOptions }> = [];

        const canvas = await captureDevicePreview({
            contentRoot,
            chromeStage,
            statusBarLayer,
            deviceImageEnabled: true,
            statusBarEnabled: true,
            layout,
            background: "#ffffff",
            rasterize: async (element, options) => {
                calls.push({ element, options });
                const next = document.createElement("canvas");
                next.width = options.width;
                next.height = options.height;
                return next;
            },
        });

        expect(canvas.width).toBe(layout.canvasWidth);
        expect(canvas.height).toBe(layout.canvasHeight);
        expect(calls).toEqual([
            {
                element: contentRoot,
                options: { width: 100, height: 200, backgroundColor: "#ffffff", cropToViewport: true },
            },
            {
                element: chromeStage,
                options: { width: layout.frameWidth, height: layout.frameHeight, backgroundColor: null },
            },
        ]);
    });

    it("rasterizes the status bar without chrome when the device image is off", async () => {
        stubCanvasContext();
        const contentRoot = document.createElement("div");
        const chromeStage = document.createElement("div");
        const statusBarLayer = document.createElement("div");
        const layout = getDevicePreviewCaptureLayout({
            screenWidth: 100,
            screenHeight: 200,
            bezel: { top: 0, right: 0, bottom: 0, left: 0 },
            deviceImageEnabled: false,
        });
        const rasterize = vi.fn(async (element: HTMLElement, options: RasterizeOptions) => {
            const next = document.createElement("canvas");
            next.width = options.width;
            next.height = options.height;
            return next;
        });

        await captureDevicePreview({
            contentRoot,
            chromeStage,
            statusBarLayer,
            deviceImageEnabled: false,
            statusBarEnabled: true,
            layout,
            background: "#111111",
            rasterize,
        });

        expect(rasterize).toHaveBeenCalledTimes(2);
        expect(rasterize.mock.calls[0]?.[0]).toBe(contentRoot);
        expect(rasterize.mock.calls[1]?.[0]).toBe(statusBarLayer);
    });
});
