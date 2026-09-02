import { describe, expect, it } from "vitest";
import {
    getMarkerDockWindowId,
    getOverlayMinimizedDockOrder,
    parseMarkerDockWindowId,
    registerOverlayMinimizedDock,
    reorderOverlayMinimizedDock,
    resetOverlayMinimizedDockRegistryForTests,
    unregisterOverlayMinimizedDock,
} from "@/utils/overlay/overlayMinimizedDockRegistry.js";

describe("overlayMinimizedDockRegistry", () => {
    it("registers and unregisters windows in order", () => {
        resetOverlayMinimizedDockRegistryForTests();

        registerOverlayMinimizedDock("a");
        registerOverlayMinimizedDock("b");

        expect(getOverlayMinimizedDockOrder()).toEqual(["a", "b"]);

        unregisterOverlayMinimizedDock("a");

        expect(getOverlayMinimizedDockOrder()).toEqual(["b"]);
    });

    it("reorders dock items", () => {
        resetOverlayMinimizedDockRegistryForTests();

        registerOverlayMinimizedDock("a");
        registerOverlayMinimizedDock("b");
        registerOverlayMinimizedDock("c");

        reorderOverlayMinimizedDock(2, 0);

        expect(getOverlayMinimizedDockOrder()).toEqual(["c", "a", "b"]);
    });

    it("builds marker dock ids and interleaves overlay windows", () => {
        resetOverlayMinimizedDockRegistryForTests();

        registerOverlayMinimizedDock(getMarkerDockWindowId("report-a"));
        registerOverlayMinimizedDock("device-preview-toolbar");
        registerOverlayMinimizedDock(getMarkerDockWindowId("report-b"));

        expect(getOverlayMinimizedDockOrder()).toEqual(["marker:report-a", "device-preview-toolbar", "marker:report-b"]);
        expect(parseMarkerDockWindowId("marker:report-a")).toBe("report-a");
        expect(parseMarkerDockWindowId("device-preview-toolbar")).toBeNull();
    });
});
