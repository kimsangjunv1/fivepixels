import { describe, expect, it } from "vitest";
import { getDevicePreviewPreset, scaleDeviceChrome } from "@/constants/devicePreview.js";
import {
    resolveMobilePreviewChrome,
    resolveMobilePreviewFrameMetrics,
    resolveMobilePreviewLayout,
    resolveMobilePreviewScreenRadius,
    resolveMobilePreviewScreenSize,
    rotateDeviceChromeForLandscape,
} from "./mobilePreviewLayout.js";

describe("resolveMobilePreviewScreenSize", () => {
    const preset = getDevicePreviewPreset("iphone-14");

    it("returns preset dimensions in portrait", () => {
        expect(resolveMobilePreviewScreenSize(preset, "portrait")).toEqual({
            width: 390,
            height: 844,
        });
    });

    it("swaps dimensions in landscape", () => {
        expect(resolveMobilePreviewScreenSize(preset, "landscape")).toEqual({
            width: 844,
            height: 390,
        });
    });
});

describe("resolveMobilePreviewLayout", () => {
    const preset = getDevicePreviewPreset("iphone-14");

    it("returns portrait scaled layout", () => {
        expect(resolveMobilePreviewLayout(preset, 0.75, "portrait")).toEqual({
            width: 293,
            height: 633,
        });
    });

    it("returns landscape scaled layout", () => {
        expect(resolveMobilePreviewLayout(preset, 0.75, "landscape")).toEqual({
            width: 633,
            height: 293,
        });
    });
});

describe("rotateDeviceChromeForLandscape", () => {
    it("remaps bezel and hardware buttons for landscape silhouette", () => {
        const preset = getDevicePreviewPreset("iphone-15-pro");
        const chrome = scaleDeviceChrome(preset, 0.75);
        const rotated = rotateDeviceChromeForLandscape(chrome);

        expect(rotated.bezel).toEqual({
            top: chrome.bezel.left,
            right: chrome.bezel.bottom,
            bottom: chrome.bezel.right,
            left: chrome.bezel.top,
        });
        expect(rotated.buttons?.top?.length).toBe(chrome.buttons?.left?.length ?? 0);
        expect(rotated.buttons?.bottom?.length).toBe(chrome.buttons?.right?.length ?? 0);
        expect(rotated.buttons?.left).toBeUndefined();
        expect(rotated.buttons?.right).toBeUndefined();
    });
});

describe("resolveMobilePreviewFrameMetrics", () => {
    const preset = getDevicePreviewPreset("iphone-14");
    const portraitLayout = resolveMobilePreviewLayout(preset, 0.75, "portrait");
    const landscapeLayout = resolveMobilePreviewLayout(preset, 0.75, "landscape");
    const portraitChrome = scaleDeviceChrome(preset, 0.75);
    const landscapeChrome = resolveMobilePreviewChrome(portraitChrome, "landscape");

    it("computes portrait frame bounds", () => {
        const metrics = resolveMobilePreviewFrameMetrics(portraitLayout, portraitChrome.bezel);
        expect(metrics.frameWidth).toBeGreaterThan(portraitLayout.width);
        expect(metrics.frameHeight).toBeGreaterThan(portraitLayout.height);
    });

    it("computes landscape frame bounds from remapped chrome", () => {
        const portraitMetrics = resolveMobilePreviewFrameMetrics(portraitLayout, portraitChrome.bezel);
        const landscapeMetrics = resolveMobilePreviewFrameMetrics(landscapeLayout, landscapeChrome.bezel);
        expect(landscapeMetrics.frameWidth).toBe(portraitMetrics.frameHeight);
        expect(landscapeMetrics.frameHeight).toBe(portraitMetrics.frameWidth);
    });
});

describe("resolveMobilePreviewScreenRadius", () => {
    const preset = getDevicePreviewPreset("iphone-15-pro-max");
    const deviceChrome = scaleDeviceChrome(preset, 0.75);

    it("uses screenRadius when device image is on", () => {
        expect(
            resolveMobilePreviewScreenRadius({
                deviceChrome,
                deviceImageEnabled: true,
                cornerStyle: "rounded",
            }),
        ).toBe(deviceChrome.screenRadius);
    });

    it("uses frameRadius when device image is off and corners are rounded", () => {
        expect(
            resolveMobilePreviewScreenRadius({
                deviceChrome,
                deviceImageEnabled: false,
                cornerStyle: "rounded",
            }),
        ).toBe(deviceChrome.frameRadius);
    });

    it("returns 0 when corners are sharp", () => {
        expect(
            resolveMobilePreviewScreenRadius({
                deviceChrome,
                deviceImageEnabled: false,
                cornerStyle: "sharp",
            }),
        ).toBe(0);
    });
});
