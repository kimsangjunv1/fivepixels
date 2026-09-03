import { afterEach, describe, expect, it, vi } from "vitest";
import { FIVEPIXELS_HOST_ID } from "@/shared/constants/overlayChrome.js";
import {
    DEVICE_PREVIEW_FRAME_ATTR,
    DEVICE_PREVIEW_FRAME_NAME,
    DEVICE_PREVIEW_GUEST_STYLE_ID,
    buildDevicePreviewHostStyle,
    clearGuestStatusBarStyle,
    closeDevicePreviewAndSyncGuestUrl,
    getGuestCaptureRoot,
    isGuestDocumentReady,
    isInsideDevicePreviewFrame,
    readGuestContentMetrics,
    readGuestPageHref,
    syncGuestStatusBarStyle,
} from "./devicePreviewFrame.js";

describe("isInsideDevicePreviewFrame", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        Object.defineProperty(window, "name", { configurable: true, value: "" });
        Object.defineProperty(window, "frameElement", { configurable: true, value: null });
    });

    it("returns false on the top-level page", () => {
        Object.defineProperty(window, "name", { configurable: true, value: "" });
        Object.defineProperty(window, "frameElement", { configurable: true, value: null });
        expect(isInsideDevicePreviewFrame()).toBe(false);
    });

    it("detects the preview guest from window.name", () => {
        Object.defineProperty(window, "name", { configurable: true, value: DEVICE_PREVIEW_FRAME_NAME });
        expect(isInsideDevicePreviewFrame()).toBe(true);
    });

    it("detects the preview guest from the iframe attribute", () => {
        const iframe = document.createElement("iframe");
        iframe.setAttribute(DEVICE_PREVIEW_FRAME_ATTR, "");
        Object.defineProperty(window, "name", { configurable: true, value: "" });
        Object.defineProperty(window, "frameElement", { configurable: true, value: iframe });
        expect(isInsideDevicePreviewFrame()).toBe(true);
    });
});

describe("devicePreview host style", () => {
    it("hides the original page and keeps the overlay host", () => {
        const css = buildDevicePreviewHostStyle({ background: "#fff", line: "rgba(0,0,0,0.04)", gridSize: 16 });
        expect(css).toContain(`body > :not(#${FIVEPIXELS_HOST_ID})`);
        expect(css).toContain("display: none !important");
        expect(css).toContain(`#${FIVEPIXELS_HOST_ID}`);
    });
});

describe("guest document helpers", () => {
    it("reads capture root and scroll metrics from the iframe document", () => {
        const iframe = document.createElement("iframe");
        document.body.append(iframe);
        const doc = iframe.contentDocument;
        if (!doc) {
            iframe.remove();
            return;
        }

        doc.body.innerHTML = "<main>preview</main>";
        Object.defineProperty(iframe, "getBoundingClientRect", {
            value: () => ({ left: 40, top: 80, width: 390, height: 844, right: 430, bottom: 924 }),
        });

        expect(isGuestDocumentReady(iframe)).toBe(true);
        expect(getGuestCaptureRoot(iframe)).toBe(doc.body);
        expect(readGuestContentMetrics(iframe, 390)).toEqual(
            expect.objectContaining({
                left: 40,
                top: 80,
                width: 390,
            }),
        );

        iframe.remove();
    });

    it("injects and clears the guest status-bar padding", () => {
        const doc = document.implementation.createHTMLDocument("guest");
        syncGuestStatusBarStyle(doc, 47);
        expect(doc.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID)?.textContent).toContain("padding-top: 47px");

        syncGuestStatusBarStyle(doc, 0);
        expect(doc.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID)).toBeNull();

        syncGuestStatusBarStyle(doc, 20);
        clearGuestStatusBarStyle(doc);
        expect(doc.getElementById(DEVICE_PREVIEW_GUEST_STYLE_ID)).toBeNull();
    });

    it("ignores about:blank guest URLs and syncs a real guest path on close", () => {
        const close = vi.fn();
        const replace = vi.fn();
        vi.stubGlobal("location", { href: "http://localhost:3090/sales/details", replace });

        const blankFrame = { contentWindow: { location: { href: "about:blank" } } } as HTMLIFrameElement;
        expect(readGuestPageHref(blankFrame)).toBeNull();
        closeDevicePreviewAndSyncGuestUrl(blankFrame, close);
        expect(close).toHaveBeenCalledTimes(1);
        expect(replace).not.toHaveBeenCalled();

        const guestFrame = { contentWindow: { location: { href: "http://localhost:3090/dashboard" } } } as HTMLIFrameElement;
        closeDevicePreviewAndSyncGuestUrl(guestFrame, close);
        expect(replace).toHaveBeenCalledWith("http://localhost:3090/dashboard");
    });
});
