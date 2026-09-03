import { afterEach, describe, expect, it, vi } from "vitest";
import { FIVEPIXELS_HOST_ID } from "@/constants/overlayChrome.js";

const { toCanvasMock } = vi.hoisted(() => ({ toCanvasMock: vi.fn() }));

vi.mock("html-to-image", () => ({ toCanvas: toCanvasMock }));

import {
    DEVICE_PREVIEW_BUTTON_OUTSET,
    applyCaptureScreenCornerClip,
    applyCaptureScrollShift,
    applyCaptureScrollShifts,
    buildDevicePreviewCaptureFilename,
    captureDevicePreview,
    defaultRasterizeElement,
    getDevicePreviewCaptureLayout,
    resolveCaptureViewportScroll,
    shouldCaptureDevicePreviewNode,
    type RasterizeOptions,
} from "./devicePreviewCapture.js";

function stubCanvasContext() {
    const context = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        clip: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        fillStyle: "",
    };

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    return context;
}

describe("devicePreviewCapture", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        toCanvasMock.mockReset();
    });

    it("skips overlay chrome and explicit skip nodes while capturing", () => {
        const host = document.createElement("div");
        host.id = FIVEPIXELS_HOST_ID;
        const skipped = document.createElement("div");
        skipped.setAttribute("data-fivepixels-skip-capture", "");
        const page = document.createElement("main");

        expect(shouldCaptureDevicePreviewNode(host)).toBe(false);
        expect(shouldCaptureDevicePreviewNode(skipped)).toBe(false);
        expect(shouldCaptureDevicePreviewNode(page)).toBe(true);
        expect(shouldCaptureDevicePreviewNode(document.createTextNode("ok"))).toBe(true);
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

    it("prefers window scroll over body scrollTop for document roots", () => {
        const body = document.createElement("div");
        document.body.append(body);
        Object.defineProperty(body, "scrollTop", { configurable: true, value: 0 });
        Object.defineProperty(body, "scrollLeft", { configurable: true, value: 0 });
        Object.defineProperty(body, "scrollWidth", { configurable: true, value: 430 });
        Object.defineProperty(body, "scrollHeight", { configurable: true, value: 2000 });

        const scroll = resolveCaptureViewportScroll(document.documentElement, {
            scrollX: 12,
            scrollY: 500,
            innerWidth: 430,
            innerHeight: 932,
        } as Window);

        expect(scroll.scrollX).toBe(12);
        expect(scroll.scrollY).toBe(500);
        expect(scroll.scrollHeight).toBeGreaterThanOrEqual(500 + 932);

        body.remove();
    });

    it("uses documentElement.scrollTop when window.scrollY is zero", () => {
        const scrolling = document.scrollingElement ?? document.documentElement;
        const previousTop = scrolling.scrollTop;
        Object.defineProperty(scrolling, "scrollTop", { configurable: true, value: 720 });

        const scroll = resolveCaptureViewportScroll(document.documentElement, {
            scrollX: 0,
            scrollY: 0,
            innerWidth: 430,
            innerHeight: 932,
        } as Window);

        expect(scroll.scrollY).toBe(720);

        Object.defineProperty(scrolling, "scrollTop", { configurable: true, value: previousTop });
    });

    it("shifts scroller children so the visible viewport sits at the origin", () => {
        const scroller = document.createElement("div");
        const child = document.createElement("div");
        scroller.append(child);

        const restore = applyCaptureScrollShift(scroller, 12, 480);
        expect(child.style.transform).toBe("translate(-12px, -480px)");
        expect(scroller.style.overflow).toBe("hidden");

        restore();
        expect(child.style.transform).toBe("");
    });

    it("keeps the page root and shifts every nested scroll viewport", () => {
        const root = document.createElement("div");
        const header = document.createElement("header");
        const verticalScroller = document.createElement("main");
        const verticalContent = document.createElement("section");
        const horizontalScroller = document.createElement("nav");
        const horizontalContent = document.createElement("div");
        verticalScroller.append(verticalContent);
        horizontalScroller.append(horizontalContent);
        root.append(header, verticalScroller, horizontalScroller);
        Object.defineProperty(verticalScroller, "scrollTop", { configurable: true, value: 640 });
        Object.defineProperty(verticalScroller, "scrollLeft", { configurable: true, value: 0 });
        Object.defineProperty(horizontalScroller, "scrollTop", { configurable: true, value: 0 });
        Object.defineProperty(horizontalScroller, "scrollLeft", { configurable: true, value: 120 });

        const restore = applyCaptureScrollShifts(root, 0, 0);

        expect(header.style.transform).toBe("");
        expect(verticalContent.style.transform).toBe("translate(0px, -640px)");
        expect(horizontalContent.style.transform).toBe("translate(-120px, 0px)");
        expect(verticalScroller.style.overflow).toBe("hidden");
        expect(horizontalScroller.style.overflow).toBe("hidden");

        restore();

        expect(verticalContent.style.transform).toBe("");
        expect(horizontalContent.style.transform).toBe("");
        expect(verticalScroller.style.overflow).toBe("");
        expect(horizontalScroller.style.overflow).toBe("");
    });

    it("rasterizes the full page while nested scroll shifts are active", async () => {
        const root = document.createElement("div");
        const header = document.createElement("header");
        const scroller = document.createElement("main");
        const content = document.createElement("section");
        scroller.append(content);
        root.append(header, scroller);
        Object.defineProperty(scroller, "scrollTop", { configurable: true, value: 480 });
        Object.defineProperty(scroller, "scrollLeft", { configurable: true, value: 0 });

        toCanvasMock.mockImplementationOnce(async (element: HTMLElement) => {
            expect(element).toBe(root);
            expect(header.style.transform).toBe("");
            expect(content.style.transform).toBe("translate(0px, -480px)");

            const canvas = document.createElement("canvas");
            canvas.width = 100;
            canvas.height = 200;
            return canvas;
        });

        await defaultRasterizeElement(root, {
            width: 100,
            height: 200,
            cropToViewport: true,
            scrollX: 0,
            scrollY: 0,
        });

        expect(toCanvasMock).toHaveBeenCalledOnce();
        expect(header.style.transform).toBe("");
        expect(content.style.transform).toBe("");
        expect(scroller.style.overflow).toBe("");
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
            contentScrollX: 0,
            contentScrollY: 480,
            contentScrollWidth: 100,
            contentScrollHeight: 1600,
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
                options: {
                    width: 100,
                    height: 200,
                    backgroundColor: "#ffffff",
                    cropToViewport: true,
                    scrollX: 0,
                    scrollY: 480,
                    scrollWidth: 100,
                    scrollHeight: 1600,
                },
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
        const rasterize = vi.fn(async (_element: HTMLElement, options: RasterizeOptions) => {
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

    it("clips screen content before drawing chrome when a corner radius is set", async () => {
        const context = stubCanvasContext();
        const contentRoot = document.createElement("div");
        const chromeStage = document.createElement("div");
        const layout = getDevicePreviewCaptureLayout({
            screenWidth: 100,
            screenHeight: 200,
            bezel: { top: 10, right: 8, bottom: 12, left: 8 },
            deviceImageEnabled: true,
        });

        await captureDevicePreview({
            contentRoot,
            chromeStage,
            statusBarLayer: null,
            deviceImageEnabled: true,
            statusBarEnabled: false,
            layout,
            background: "#ffffff",
            screenCornerRadius: 40,
            rasterize: async (_element, options) => {
                const next = document.createElement("canvas");
                next.width = options.width;
                next.height = options.height;
                return next;
            },
        });

        expect(context.save).toHaveBeenCalled();
        expect(context.roundRect).toHaveBeenCalledWith(layout.screenX, layout.screenY, 100, 200, 40);
        expect(context.clip).toHaveBeenCalled();
        expect(context.restore).toHaveBeenCalled();
        expect(context.drawImage).toHaveBeenCalled();
    });

    it("applies a rounded screen clip when a corner radius is provided without chrome", async () => {
        const context = stubCanvasContext();
        const contentRoot = document.createElement("div");
        const layout = getDevicePreviewCaptureLayout({
            screenWidth: 100,
            screenHeight: 200,
            bezel: { top: 0, right: 0, bottom: 0, left: 0 },
            deviceImageEnabled: false,
        });

        await captureDevicePreview({
            contentRoot,
            chromeStage: null,
            statusBarLayer: null,
            deviceImageEnabled: false,
            statusBarEnabled: false,
            layout,
            background: "#ffffff",
            screenCornerRadius: 24,
            rasterize: async (_element, options) => {
                const next = document.createElement("canvas");
                next.width = options.width;
                next.height = options.height;
                return next;
            },
        });

        expect(context.roundRect).toHaveBeenCalledWith(0, 0, 100, 200, 24);
        expect(context.clip).toHaveBeenCalled();
    });

    it("returns the source canvas when corner radius is zero", () => {
        const source = document.createElement("canvas");
        source.width = 40;
        source.height = 80;
        const layout = getDevicePreviewCaptureLayout({
            screenWidth: 40,
            screenHeight: 80,
            bezel: { top: 0, right: 0, bottom: 0, left: 0 },
            deviceImageEnabled: false,
        });

        expect(applyCaptureScreenCornerClip(source, layout, 0)).toBe(source);
    });
});
