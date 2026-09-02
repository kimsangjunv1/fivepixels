import { describe, expect, it } from "vitest";
import {
    getOverlayMinimizedDockOrder,
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
});
