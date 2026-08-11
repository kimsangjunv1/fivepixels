import { describe, expect, it } from "vitest";
import {
    DEFAULT_PIN_RAIL_PLACEMENT,
    pinPlacementToStyle,
    projectPointerToPinPlacement,
    resolvePanelPlacementAwayFromPin,
    resolvePinPlacementAwayFromPanel,
    resolvePlacementAwayFromOther,
    sanitizePinRailPlacement,
} from "./edgeDock.js";

describe("edgeDock", () => {
    it("sanitizes invalid placements to the default", () => {
        expect(sanitizePinRailPlacement(null)).toEqual(DEFAULT_PIN_RAIL_PLACEMENT);
        expect(sanitizePinRailPlacement({ edge: "right", offsetRatio: 2 })).toEqual({ edge: "right", offsetRatio: 1 });
        expect(sanitizePinRailPlacement({ edge: "left", offsetRatio: -1 })).toEqual({ edge: "left", offsetRatio: 0 });
    });

    it("projects pointer to the nearest edge outside the content center", () => {
        expect(projectPointerToPinPlacement(100, 200, { viewportWidth: 1000, viewportHeight: 800, height: 52 })).toEqual({
            edge: "left",
            offsetRatio: expect.any(Number),
        });
        expect(projectPointerToPinPlacement(900, 200, { viewportWidth: 1000, viewportHeight: 800, height: 52 }).edge).toBe("right");
    });

    it("nudges docks apart on the same edge", () => {
        expect(resolvePinPlacementAwayFromPanel({ edge: "right", offsetRatio: 0.1 }, { edge: "right", offsetRatio: 0.12 })).toEqual({
            edge: "right",
            offsetRatio: expect.any(Number),
        });
        expect(resolvePlacementAwayFromOther({ edge: "right", offsetRatio: 0.1 }, { edge: "right", offsetRatio: 0.12 }).offsetRatio).not.toBe(0.1);
        expect(resolvePinPlacementAwayFromPanel({ edge: "left", offsetRatio: 0.1 }, { edge: "right", offsetRatio: 0.1 })).toEqual({
            edge: "left",
            offsetRatio: 0.1,
        });
        expect(resolvePanelPlacementAwayFromPin({ edge: "left", offsetRatio: 0.2 }, { edge: "left", offsetRatio: 0.22 }).edge).toBe("left");
    });

    it("builds fixed styles for docked and dragging states", () => {
        const docked = pinPlacementToStyle(
            { edge: "right", offsetRatio: 0.2 },
            { collapsed: true, peeking: false, isDragging: false, width: 52, height: 52 },
        );
        expect(docked.position).toBe("fixed");
        expect(docked.right).toBe(16);
        expect(docked.left).toBe("auto");

        const dragging = pinPlacementToStyle(
            { edge: "right", offsetRatio: 0.2 },
            { collapsed: true, peeking: false, isDragging: true, dragLeft: 40, dragTop: 80, width: 52, height: 52 },
        );
        expect(dragging).toMatchObject({ left: 40, top: 80, right: "auto" });
    });
});
