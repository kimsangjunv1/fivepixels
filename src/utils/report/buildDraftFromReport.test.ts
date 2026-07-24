import { describe, expect, it } from "vitest";
import { createReportFeedback } from "@/utils/report/reportFixtures.js";
import { buildDraftFromReport } from "@/utils/report/buildDraftFromReport.js";

describe("buildDraftFromReport", () => {
    it("hydrates draft cases, category, and position from an existing report", () => {
        const report = createReportFeedback({
            category: "problem",
            cases: [
                {
                    id: "case-1",
                    text: "첫 케이스",
                    status: "open",
                    created_at: "2026-07-24T00:00:00.000Z",
                    updated_at: "2026-07-24T00:00:00.000Z",
                },
            ],
            field_values: { note: "high" },
            position: {
                target: { x: 0.25, y: 0.75 },
                viewport: { x: 0.4, y: 0.5, width: 1200, height: 800 },
                scrollY: 120,
                anchor: null,
            },
        });

        const draft = buildDraftFromReport(report, [{ key: "note", type: "textarea", label: "Note" }]);

        expect(draft.category).toBe("problem");
        expect(draft.cases).toEqual(report.cases);
        expect(draft.cases[0]).not.toBe(report.cases[0]);
        expect(draft.fieldValues).toEqual({ note: "high" });
        expect(draft.elementXRatio).toBe(0.25);
        expect(draft.elementYRatio).toBe(0.75);
        expect(draft.xRatio).toBe(0.4);
        expect(draft.yRatio).toBe(0.5);
        expect(draft.reportId).toBe(report.report_id);
        expect(draft.targetSelector).toBe(report.target_selector ?? null);
    });
});
