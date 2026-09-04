import { describe, expect, it } from "vitest";
import { createDemoAdapter, createDemoNotifications, DEMO_REPORTS, DEMO_SCENE_SIZE } from "./fixtures.js";
import { FIVE_PIXELS_DEMO_SCENES } from "./types.js";

describe("FivePixels demo fixtures", () => {
    it("defines a positive stage size for every public scene", () => {
        for (const scene of FIVE_PIXELS_DEMO_SCENES) {
            expect(DEMO_SCENE_SIZE[scene].width).toBeGreaterThan(0);
            expect(DEMO_SCENE_SIZE[scene].height).toBeGreaterThan(0);
        }
    });

    it("provides localized notification data", () => {
        expect(createDemoNotifications("ko")[0].title).not.toBe(createDemoNotifications("en")[0].title);
        expect(createDemoNotifications("ko")).toHaveLength(createDemoNotifications("en").length);
    });

    it("serves reports from the in-memory adapter", async () => {
        const adapter = createDemoAdapter();
        const reports = await adapter.markers.list({ pathname: "/demo-showcase" });

        expect(reports).toHaveLength(DEMO_REPORTS.length);
        expect(await adapter.feedback.get(DEMO_REPORTS[0].id)).toMatchObject({ id: DEMO_REPORTS[0].id });
    });
});
