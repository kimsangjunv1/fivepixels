import { describe, expect, it } from "vitest";
import { DEMO_SCENE_SIZE, getDemoCopy } from "./fixtures.js";
import { FIVE_PIXELS_DEMO_SCENES } from "./types.js";

describe("FivePixels demo fixtures", () => {
    it("defines a positive stage size for every public scene", () => {
        for (const scene of FIVE_PIXELS_DEMO_SCENES) {
            expect(DEMO_SCENE_SIZE[scene].width).toBeGreaterThan(0);
            expect(DEMO_SCENE_SIZE[scene].height).toBeGreaterThan(0);
        }
    });

    it("provides localized fixture copy", () => {
        expect(getDemoCopy("ko").composer.placeholder).not.toBe(getDemoCopy("en").composer.placeholder);
        expect(getDemoCopy("ko").panel.statuses).toHaveLength(getDemoCopy("en").panel.statuses.length);
    });
});
