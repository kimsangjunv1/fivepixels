import { afterEach, describe, expect, it } from "vitest";
import { MOBILE_PREVIEW_FRAME_ATTR, MOBILE_PREVIEW_FRAME_NAME, isInsideMobilePreviewFrame, syncMobilePreviewGuestViewport } from "./mobilePreviewFrame.js";

describe("isInsideMobilePreviewFrame", () => {
    const originalName = window.name;

    afterEach(() => {
        window.name = originalName;
    });

    it("returns false in the host window", () => {
        window.name = "";
        expect(isInsideMobilePreviewFrame()).toBe(false);
    });

    it("returns true when window.name matches the mobile preview guest frame", () => {
        window.name = MOBILE_PREVIEW_FRAME_NAME;
        expect(isInsideMobilePreviewFrame()).toBe(true);
    });

    it("returns true when frameElement has the mobile preview frame attribute", () => {
        const iframe = document.createElement("iframe");
        iframe.setAttribute(MOBILE_PREVIEW_FRAME_ATTR, "");
        Object.defineProperty(window, "frameElement", {
            configurable: true,
            value: iframe,
        });

        expect(isInsideMobilePreviewFrame()).toBe(true);

        Object.defineProperty(window, "frameElement", {
            configurable: true,
            value: null,
        });
    });
});

describe("syncMobilePreviewGuestViewport", () => {
    it("updates the viewport meta to the device logical width", () => {
        const doc = document.implementation.createHTMLDocument("guest");
        const existing = doc.createElement("meta");
        existing.setAttribute("name", "viewport");
        existing.setAttribute("content", "width=1280");
        doc.head.append(existing);

        syncMobilePreviewGuestViewport(doc, 390);

        expect(existing.getAttribute("content")).toBe("width=390, initial-scale=1, viewport-fit=cover");
    });

    it("creates a viewport meta when one is missing", () => {
        const doc = document.implementation.createHTMLDocument("guest");

        syncMobilePreviewGuestViewport(doc, 390);

        const meta = doc.querySelector('meta[name="viewport"]');
        expect(meta?.getAttribute("content")).toBe("width=390, initial-scale=1, viewport-fit=cover");
    });
});
