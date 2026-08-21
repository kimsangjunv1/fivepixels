import { describe, expect, it } from "vitest";
import { MARKER_MINIMIZED_WINDOW_WIDTH, resolveMinimizedDockPosition } from "./markerWindowDock.js";

describe("resolveMinimizedDockPosition", () => {
    it("centers a single minimized window", () => {
        const position = resolveMinimizedDockPosition(0, 1, 1000, 800);

        expect(position.left).toBe(Math.round((1000 - MARKER_MINIMIZED_WINDOW_WIDTH) / 2));
        expect(position.top).toBe(800 - 16 - 42);
    });

    it("places additional windows to the right in order while keeping the group centered", () => {
        const first = resolveMinimizedDockPosition(0, 2, 1000, 800);
        const second = resolveMinimizedDockPosition(1, 2, 1000, 800);

        expect(second.left).toBe(first.left + MARKER_MINIMIZED_WINDOW_WIDTH + 8);
        expect(first.left).toBeLessThan(Math.round((1000 - MARKER_MINIMIZED_WINDOW_WIDTH) / 2));
        expect(second.top).toBe(first.top);
    });
});
