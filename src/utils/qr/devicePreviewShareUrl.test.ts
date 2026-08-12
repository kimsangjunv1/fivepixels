import { describe, expect, it } from "vitest";
import {
    getCurrentPageShareUrl,
    isLoopbackHostname,
    isLoopbackPageUrl,
    normalizeShareUrlInput,
    resolveDevicePreviewQrUrl,
} from "./devicePreviewShareUrl.js";
import { buildQrSvgPath, encodeQrModules } from "./encodeQrSvg.js";

describe("devicePreviewShareUrl", () => {
    it("detects loopback hosts", () => {
        expect(isLoopbackHostname("localhost")).toBe(true);
        expect(isLoopbackHostname("127.0.0.1")).toBe(true);
        expect(isLoopbackHostname("::1")).toBe(true);
        expect(isLoopbackHostname("192.168.0.12")).toBe(false);
        expect(isLoopbackHostname("qa.example.com")).toBe(false);
    });

    it("uses the current page url for non-loopback hosts", () => {
        const href = "https://qa.example.com/app?x=1#hash";
        expect(isLoopbackPageUrl(href)).toBe(false);
        expect(resolveDevicePreviewQrUrl({ pageHref: href })).toEqual({
            url: getCurrentPageShareUrl(href),
            needsManualUrl: false,
        });
    });

    it("requires a manual url on localhost and normalizes input", () => {
        const pageHref = "http://localhost:5173/edgecase";
        expect(resolveDevicePreviewQrUrl({ pageHref, manualUrl: "" })).toEqual({
            url: null,
            needsManualUrl: true,
        });
        expect(resolveDevicePreviewQrUrl({ pageHref, manualUrl: "192.168.0.12:5173/edgecase" })).toEqual({
            url: "http://192.168.0.12:5173/edgecase",
            needsManualUrl: true,
        });
    });

    it("rejects non-http(s) schemes", () => {
        expect(normalizeShareUrlInput("javascript:alert(1)")).toBeNull();
        expect(normalizeShareUrlInput("ftp://example.com")).toBeNull();
    });
});

describe("encodeQrSvg", () => {
    it("encodes text into a square module grid and svg path", () => {
        const encoded = encodeQrModules("https://example.com/qa");
        expect(encoded.size).toBeGreaterThanOrEqual(21);
        expect(encoded.modules).toHaveLength(encoded.size);
        expect(encoded.modules.every((row) => row.length === encoded.size)).toBe(true);

        const { path, dimension } = buildQrSvgPath(encoded, 4, 2);
        expect(path.length).toBeGreaterThan(0);
        expect(dimension).toBe((encoded.size + 4) * 4);
    });
});
