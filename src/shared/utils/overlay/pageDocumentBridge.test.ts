import { afterEach, describe, expect, it, vi } from "vitest";
import { DEVICE_PREVIEW_FRAME_ATTR } from "./devicePreviewFrame.js";
import {
    clearPageDocumentBridge,
    getElementHostRect,
    getPageDocument,
    getPageElementsFromPoint,
    getPagePathname,
    getPageScrollY,
    getPageViewportSize,
    isHtmlElement,
    isPageDocumentBridged,
    mapHostPointToPage,
    mapPageRectToHost,
    setPageDocumentBridge,
} from "./pageDocumentBridge.js";

describe("pageDocumentBridge", () => {
    afterEach(() => {
        clearPageDocumentBridge();
        vi.restoreAllMocks();
    });

    it("treats cross-realm element-like nodes as HTMLElements", () => {
        const element = document.createElement("div");
        expect(isHtmlElement(element)).toBe(true);
        expect(isHtmlElement(document.createTextNode("x"))).toBe(false);
        expect(isHtmlElement(null)).toBe(false);
    });

    it("maps host points into the preview iframe coordinate space", () => {
        const iframe = document.createElement("iframe");
        iframe.setAttribute(DEVICE_PREVIEW_FRAME_ATTR, "");
        Object.defineProperty(iframe, "getBoundingClientRect", {
            value: () => ({ left: 100, top: 50, width: 215, height: 466, right: 315, bottom: 516 }),
        });
        Object.defineProperty(iframe, "offsetWidth", { value: 430 });
        Object.defineProperty(iframe, "offsetHeight", { value: 932 });
        Object.defineProperty(iframe, "contentDocument", { value: document });
        Object.defineProperty(iframe, "contentWindow", {
            value: {
                scrollY: 20,
                innerWidth: 430,
                innerHeight: 932,
                location: { pathname: "/sales/details" },
            },
        });

        setPageDocumentBridge({ iframe, fitScale: 0.5 });

        expect(isPageDocumentBridged()).toBe(true);
        expect(getPageDocument()).toBe(document);
        expect(getPageScrollY()).toBe(20);
        expect(getPageViewportSize()).toEqual({ width: 430, height: 932 });
        expect(getPagePathname()).toBe("/sales/details");
        expect(mapHostPointToPage(100, 50)).toEqual({ x: 0, y: 0 });
        expect(mapHostPointToPage(207.5, 283)).toEqual({ x: 215, y: 466 });
        expect(mapHostPointToPage(10, 10)).toBeNull();
    });

    it("maps page rects back to host overlay coordinates", () => {
        const iframe = document.createElement("iframe");
        Object.defineProperty(iframe, "getBoundingClientRect", {
            value: () => ({ left: 40, top: 80, width: 195, height: 422, right: 235, bottom: 502 }),
        });
        Object.defineProperty(iframe, "contentDocument", { value: document });
        setPageDocumentBridge({ iframe, fitScale: 0.5 });

        const mapped = mapPageRectToHost({
            x: 10,
            y: 20,
            left: 10,
            top: 20,
            width: 100,
            height: 50,
            right: 110,
            bottom: 70,
            toJSON() {
                return this;
            },
        });

        expect(mapped.left).toBe(45);
        expect(mapped.top).toBe(90);
        expect(mapped.width).toBe(50);
        expect(mapped.height).toBe(25);
    });

    it("queries guest elementsFromPoint with mapped coordinates", () => {
        const iframe = document.createElement("iframe");
        const target = document.createElement("button");
        Object.defineProperty(iframe, "getBoundingClientRect", {
            value: () => ({ left: 0, top: 0, width: 390, height: 844, right: 390, bottom: 844 }),
        });
        Object.defineProperty(iframe, "offsetWidth", { value: 390 });
        Object.defineProperty(iframe, "offsetHeight", { value: 844 });
        Object.defineProperty(iframe, "contentDocument", {
            value: {
                elementsFromPoint: vi.fn(() => [target]),
                documentElement: document.documentElement,
            },
        });
        setPageDocumentBridge({ iframe, fitScale: 1 });

        expect(getPageElementsFromPoint(12, 24)).toEqual([target]);
        expect(iframe.contentDocument?.elementsFromPoint).toHaveBeenCalledWith(12, 24);
    });

    it("returns host rects for bridged elements", () => {
        const iframe = document.createElement("iframe");
        const element = document.createElement("div");
        Object.defineProperty(iframe, "getBoundingClientRect", {
            value: () => ({ left: 30, top: 40, width: 200, height: 400, right: 230, bottom: 440 }),
        });
        Object.defineProperty(iframe, "contentDocument", { value: document });
        Object.defineProperty(element, "getBoundingClientRect", {
            value: () => ({ left: 10, top: 20, width: 40, height: 60, right: 50, bottom: 80 }),
        });
        setPageDocumentBridge({ iframe, fitScale: 2 });

        const rect = getElementHostRect(element);
        expect(rect.left).toBe(50);
        expect(rect.top).toBe(80);
        expect(rect.width).toBe(80);
        expect(rect.height).toBe(120);
    });
});
