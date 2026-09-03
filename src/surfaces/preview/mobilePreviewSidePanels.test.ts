import { describe, expect, it } from "vitest";
import { isMobilePreviewSidePanelOpen, toggleMobilePreviewSidePanel } from "./mobilePreviewSidePanels.js";

describe("toggleMobilePreviewSidePanel", () => {
    it("appends a panel in open order", () => {
        expect(toggleMobilePreviewSidePanel([], "capture")).toEqual(["capture"]);
        expect(toggleMobilePreviewSidePanel(["capture"], "qr")).toEqual(["capture", "qr"]);
    });

    it("removes a panel without reordering the rest", () => {
        expect(toggleMobilePreviewSidePanel(["capture", "qr"], "capture")).toEqual(["qr"]);
        expect(toggleMobilePreviewSidePanel(["capture", "qr"], "qr")).toEqual(["capture"]);
    });
});

describe("isMobilePreviewSidePanelOpen", () => {
    it("reports whether a panel is open", () => {
        expect(isMobilePreviewSidePanelOpen(["qr"], "qr")).toBe(true);
        expect(isMobilePreviewSidePanelOpen(["qr"], "capture")).toBe(false);
    });
});
