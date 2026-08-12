import { describe, expect, it } from "vitest";
import {
    DEFAULT_PIN_RAIL_PLACEMENT,
    pinPlacementToStyle,
    projectPointerToPinPlacement,
    sanitizePinRailPlacement,
} from "./edgeDock.js";

describe("edgeDock", () => {
    it("sanitizes invalid placements to the default free position", () => {
        expect(sanitizePinRailPlacement(null)).toEqual(DEFAULT_PIN_RAIL_PLACEMENT);
        expect(sanitizePinRailPlacement({ left: 40, top: 80 })).toEqual({ left: 40, top: 80 });
    });

    it("migrates legacy edge placements to free coordinates", () => {
        const migrated = sanitizePinRailPlacement({ edge: "left", offsetRatio: 0 });
        expect(migrated.left).toBe(16);
        expect(migrated.top).toBeGreaterThanOrEqual(16);

        const right = sanitizePinRailPlacement({ edge: "right", offsetRatio: 0.2 });
        expect(right.left).toBeGreaterThan(16);
        expect(right.top).toBeGreaterThanOrEqual(16);
    });

    it("projects pointer to a free-floating position", () => {
        expect(projectPointerToPinPlacement(100, 200, { viewportWidth: 1000, viewportHeight: 800, width: 280, height: 52 })).toEqual({
            left: expect.any(Number),
            top: expect.any(Number),
        });
    });

    it("builds fixed styles for free and dragging states", () => {
        const docked = pinPlacementToStyle({ left: 24, top: 48 }, { width: 280 });
        expect(docked).toMatchObject({ position: "fixed", left: 24, top: 48, width: 280 });

        const dragging = pinPlacementToStyle(
            { left: 24, top: 48 },
            { isDragging: true, dragLeft: 40, dragTop: 80, width: 280 },
        );
        expect(dragging).toMatchObject({ left: 40, top: 80, right: "auto" });
    });
});
