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

    it("builds route details with current/selected/delta", () => {
        const referenceDate = new Date(2026, 6, 12);
        const selectedAt = new Date(2026, 6, 12, 12, 0, 0).toISOString();
        const previousAt = new Date(2026, 6, 11, 12, 0, 0).toISOString();
        const reports = [
            createFeedback({ created_at: selectedAt }),
            createFeedback({ id: "feedback-2", created_at: selectedAt }),
            createFeedback({ id: "feedback-3", created_at: previousAt }),
        ];
        const fields = [
            { key: "message", label: "Message", type: "textarea" as const },
            { key: "bug", label: "Bug", type: "checkbox" as const },
        ];

        const routeDetails = buildRouteDetailsSummary(reports, fields, "/edgecase?test=1", {
            selectedDateKey: "2026-07-12",
            referenceDate,
        });
        const bootstrap = buildPanelBootstrapFromReports(reports, fields, "/edgecase");
        const activeRow = routeDetails.statusRows.find((row) => row.current > 0);

        expect(routeDetails.pathname).toBe("/edgecase?test=1");
        expect(routeDetails.selectedDateKey).toBe("2026-07-12");
        expect(activeRow).toEqual(
            expect.objectContaining({
                current: 3,
                selected: 2,
                delta: 1,
            }),
        );
        expect(bootstrap.stats.found).toBe(3);
        expect(bootstrap.routeDetails.pathname).toBe("/edgecase");
        expect(bootstrap.routeDetails.selectedDateKey).toBeTruthy();
    });
});
