import { describe, expect, it } from "vitest";
import { buildRouteDetailsSummary } from "@/shared/utils/panel/panelBootstrap.js";
import {
    createDemoAdapter,
    createDemoNotifications,
    DEMO_API_FLOW_ENTRIES,
    DEMO_FEATURED_REPORTS,
    DEMO_REPORTS,
    DEMO_SCENE_SIZE,
} from "./fixtures.js";
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

    it("covers successful, HTTP failure, and network failure requests", () => {
        expect(DEMO_API_FLOW_ENTRIES.some((entry) => entry.ok)).toBe(true);
        expect(DEMO_API_FLOW_ENTRIES.some((entry) => entry.failureKind === "http")).toBe(true);
        expect(DEMO_API_FLOW_ENTRIES.some((entry) => entry.failureKind === "network")).toBe(true);
    });

    it("serves reports from the in-memory adapter", async () => {
        const adapter = createDemoAdapter();
        const reports = await adapter.markers.list({ pathname: "/demo-showcase" });

        expect(reports).toHaveLength(DEMO_REPORTS.length);
        expect(await adapter.feedback.get(DEMO_REPORTS[0].id)).toMatchObject({ id: DEMO_REPORTS[0].id });
    });

    it("keeps featured reports short while activity reports diversify panel counts", () => {
        expect(DEMO_FEATURED_REPORTS.length).toBeLessThanOrEqual(20);
        expect(DEMO_REPORTS.length).toBeGreaterThan(100);

        const summary = buildRouteDetailsSummary(DEMO_REPORTS, [], "/demo-showcase");
        const activeRows = summary.statusRows.filter((row) => row.today > 0 || row.yesterday > 0);
        expect(activeRows.length).toBeGreaterThan(5);
        expect(activeRows.some((row) => row.today >= 10 || row.yesterday >= 10)).toBe(true);
        expect(activeRows.every((row) => row.today <= 50 && row.yesterday <= 50)).toBe(true);
    });
});
