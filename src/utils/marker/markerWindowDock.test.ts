import { describe, expect, it } from "vitest";
import {
    MARKER_MINIMIZED_WINDOW_WIDTH,
    moveMinimizedDockItem,
    resolveMinimizedDockIndexFromPointer,
    resolveMinimizedDockPosition,
} from "./markerWindowDock.js";

describe("resolveMinimizedDockPosition", () => {
    it("centers a single minimized window", () => {
        const position = resolveMinimizedDockPosition(0, 1, 1000, 800);

        expect(position.left).toBe(Math.round((1000 - MARKER_MINIMIZED_WINDOW_WIDTH) / 2));
        expect(position.top).toBe(800 - 16 - 56);
    });

    it("places additional windows to the right in order while keeping the group centered", () => {
        const first = resolveMinimizedDockPosition(0, 2, 1000, 800);
        const second = resolveMinimizedDockPosition(1, 2, 1000, 800);

        expect(second.left).toBe(first.left + MARKER_MINIMIZED_WINDOW_WIDTH + 8);
        expect(first.left).toBeLessThan(Math.round((1000 - MARKER_MINIMIZED_WINDOW_WIDTH) / 2));
        expect(second.top).toBe(first.top);
    });

    it("centers within a reduced region when the panel occupies the right side", () => {
        const region = { regionLeft: 16, regionWidth: 600 };
        const first = resolveMinimizedDockPosition(0, 2, 1200, 800, MARKER_MINIMIZED_WINDOW_WIDTH, undefined, undefined, undefined, region);
        const second = resolveMinimizedDockPosition(1, 2, 1200, 800, MARKER_MINIMIZED_WINDOW_WIDTH, undefined, undefined, undefined, region);

        expect(first.left).toBeGreaterThanOrEqual(region.regionLeft);
        expect(second.left + MARKER_MINIMIZED_WINDOW_WIDTH).toBeLessThanOrEqual(region.regionLeft + region.regionWidth);
        expect(second.left).toBe(first.left + MARKER_MINIMIZED_WINDOW_WIDTH + 8);
    });
});

describe("resolveMinimizedDockIndexFromPointer", () => {
    it("maps the pointer to the nearest dock slot", () => {
        const first = resolveMinimizedDockPosition(0, 3, 1000, 800);
        const second = resolveMinimizedDockPosition(1, 3, 1000, 800);
        const third = resolveMinimizedDockPosition(2, 3, 1000, 800);

        expect(resolveMinimizedDockIndexFromPointer(first.left + MARKER_MINIMIZED_WINDOW_WIDTH / 2, 3, 1000)).toBe(0);
        expect(resolveMinimizedDockIndexFromPointer(second.left + MARKER_MINIMIZED_WINDOW_WIDTH / 2, 3, 1000)).toBe(1);
        expect(resolveMinimizedDockIndexFromPointer(third.left + MARKER_MINIMIZED_WINDOW_WIDTH / 2, 3, 1000)).toBe(2);
    });
});

describe("moveMinimizedDockItem", () => {
    it("reorders items without mutating the source", () => {
        const source = ["a", "b", "c"];

        expect(moveMinimizedDockItem(source, 0, 2)).toEqual(["b", "c", "a"]);
        expect(moveMinimizedDockItem(source, 2, 0)).toEqual(["c", "a", "b"]);
        expect(source).toEqual(["a", "b", "c"]);
    });
});
