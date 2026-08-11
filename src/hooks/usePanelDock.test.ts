import { describe, expect, it } from "vitest";
import { clampPanelPlacement, placementToPanelCorner, placementToPanelStyle, projectPointerToPlacement } from "./usePanelDock.js";

describe("usePanelDock placement helpers", () => {
    it("clamps edge dock placements", () => {
        expect(clampPanelPlacement({ edge: "right", offsetRatio: 2 })).toEqual({ edge: "right", offsetRatio: 1 });
        expect(clampPanelPlacement({ edge: "left", offsetRatio: -0.5 })).toEqual({ edge: "left", offsetRatio: 0 });
    });

    it("projects pointer onto left/right edges only", () => {
        expect(projectPointerToPlacement(120, 240, 200).edge).toBe("left");
        expect(projectPointerToPlacement(1800, 240, 200).edge).toBe("right");
    });

    it("derives a resize corner from vertical ratio", () => {
        expect(placementToPanelCorner({ edge: "left", offsetRatio: 0.1 })).toBe("top-left");
        expect(placementToPanelCorner({ edge: "right", offsetRatio: 0.8 })).toBe("bottom-right");
    });

    it("builds docked panel styles along an edge", () => {
        const style = placementToPanelStyle({ edge: "right", offsetRatio: 0 }, { height: 300 });
        expect(style.position).toBe("fixed");
        expect(style.right).toBe(16);
        expect(style.left).toBe("auto");
        expect(typeof style.top).toBe("number");
    });
});
