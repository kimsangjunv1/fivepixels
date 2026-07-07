import { describe, expect, it } from "vitest";
import type { ReportFeedback } from "@/types/report.js";
import { buildPanelBootstrapFromReports, buildPanelStats, buildRouteDetailsSummary } from "./panelBootstrap.js";

function createFeedback(overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "created_at">): ReportFeedback {
    return {
        id: "feedback-1",
        report_id: "report-1",
        report_type: "item",
        pathname: "/edgecase",
        status: "open",
        created_at: overrides.created_at,
        field_values: {},
        cases: [],
        replies: [],
        ...overrides,
    };
}

describe("panelBootstrap", () => {
    it("builds panel stats from reports", () => {
        const stats = buildPanelStats([
            createFeedback({ created_at: "2026-07-01T12:00:00.000Z", status: "resolved" }),
            createFeedback({ id: "feedback-2", created_at: "2026-07-02T12:00:00.000Z", status: "open" }),
        ]);

        expect(stats).toEqual({
            found: 2,
            resolved: 1,
            inProgress: 1,
        });
    });

    it("builds route details and bootstrap payload", () => {
        const reports = [createFeedback({ created_at: "2026-07-01T12:00:00.000Z" })];
        const fields = [
            { key: "message", label: "Message", type: "textarea" as const },
            { key: "bug", label: "Bug", type: "checkbox" as const },
        ];

        const routeDetails = buildRouteDetailsSummary(reports, fields, "/edgecase");
        const bootstrap = buildPanelBootstrapFromReports(reports, fields, "/edgecase");

        expect(routeDetails.pathname).toBe("/edgecase");
        expect(routeDetails.statusRows.some((row) => row.all > 0)).toBe(true);
        expect(bootstrap.stats.found).toBe(1);
        expect(bootstrap.routeDetails.pathname).toBe("/edgecase");
    });
});
