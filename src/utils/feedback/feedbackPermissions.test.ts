import { describe, expect, it } from "vitest";
import { canDeleteFeedback, canRemoveCase } from "./feedbackPermissions.js";
import { createReportCase } from "@/utils/report/reportCases.js";
import type { ReportFeedback } from "@/types/report.js";

function createReport(overrides: Partial<ReportFeedback> = {}): ReportFeedback {
    const caseItem = createReportCase("case one");

    return {
        id: "fb-1",
        pathname: "/",
        report_id: "r1",
        report_type: "bug",
        cases: [caseItem],
        status: "open",
        position: { x: 0, y: 0 },
        created_at: "2026-01-01T00:00:00.000Z",
        author_id: "author-1",
        author_name: "Alice",
        ...overrides,
    };
}

describe("feedbackPermissions", () => {
    it("allows feedback delete only for the original author", () => {
        const report = createReport();

        expect(canDeleteFeedback(report, { id: "author-1", name: "Alice" })).toBe(true);
        expect(canDeleteFeedback(report, { id: "other", name: "Alice" })).toBe(false);
        expect(canDeleteFeedback(report, { id: "other", name: "Bob" })).toBe(false);
        expect(canDeleteFeedback(report, null)).toBe(false);
    });

    it("matches author by name when author_id is missing", () => {
        const report = createReport({ author_id: undefined });

        expect(canDeleteFeedback(report, { name: "Alice" })).toBe(true);
        expect(canDeleteFeedback(report, { name: "Bob" })).toBe(false);
    });

    it("allows case removal only for author without assignee or discussion", () => {
        const caseA = createReportCase("a");
        const caseB = createReportCase("b");
        const report = createReport({ cases: [caseA, caseB] });

        expect(canRemoveCase(report, caseA.id, { id: "author-1", name: "Alice" })).toBe(true);
        expect(canRemoveCase(report, caseA.id, { id: "other", name: "Bob" })).toBe(false);
        expect(canRemoveCase({ ...report, cases: [caseA] }, caseA.id, { id: "author-1", name: "Alice" })).toBe(false);
        expect(
            canRemoveCase(
                {
                    ...report,
                    cases: report.cases.map((item) => (item.id === caseA.id ? { ...item, assignee_name: "Dev" } : item)),
                },
                caseA.id,
                { id: "author-1", name: "Alice" },
            ),
        ).toBe(false);
        expect(
            canRemoveCase(
                {
                    ...report,
                    replies: [{ id: "r1", message: "hi", created_at: "2026-01-01T00:00:00.000Z", status: "additional_question", case_ids: [caseA.id] }],
                },
                caseA.id,
                { id: "author-1", name: "Alice" },
            ),
        ).toBe(false);
    });
});
