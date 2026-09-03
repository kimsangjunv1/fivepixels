import { describe, expect, it } from "vitest";
import { measureMinimizedDockRegion } from "@/shared/utils/overlay/minimizedDockPanelBounds.js";

describe("measureMinimizedDockRegion", () => {
    it("returns the full viewport width when no panel is present", () => {
        expect(measureMinimizedDockRegion(1200, 800)).toEqual({
            regionLeft: 16,
            regionWidth: 1168,
        });
    });
});
