import { describe, expect, it } from "vitest";
import { createReportFeedback } from "@/utils/reportFixtures.js";
import {
    allCasesResolved,
    applyCaseStatusSync,
    buildResolvedCasesUpdate,
    createReportCase,
    getCaseLabels,
    getIssueProgressLabel,
    getIssueSummary,
    getOpenCaseIds,
    getOpenCases,
    isValidCaseSelection,
    normalizeFeedbackCases,
    normalizeReplyCaseIds,
    resolveCases,
    syncIssueStatusFromCases,
    validateCasesForSubmit,
    canEditReportCases,
} from "@/utils/reportCases.js";

describe("reportCases", () => {
    it("creates and summarizes cases", () => {
        const report = createReportFeedback({
            cases: [createReportCase("색상 틀림"), createReportCase("API 연동 필요")],
        });

        expect(getIssueSummary(report)).toBe("색상 틀림 외 1건");
        expect(getIssueProgressLabel(report)).toBe("0/2");
        expect(getOpenCases(report)).toHaveLength(2);
    });

    it("resolves selected cases and syncs issue status", () => {
        const cases = [createReportCase("A"), createReportCase("B"), createReportCase("C")];
        const resolved = resolveCases(cases, [cases[0].id, cases[1].id]);

        expect(resolved[0]?.status).toBe("resolved");
        expect(resolved[1]?.status).toBe("resolved");
        expect(resolved[2]?.status).toBe("open");

        const partialReport = createReportFeedback({ cases: resolved, status: "open" });
        expect(allCasesResolved(partialReport)).toBe(false);
        expect(syncIssueStatusFromCases(partialReport)).toBe("open");

        const allResolved = resolveCases(resolved, [cases[2].id]);
        const completedReport = createReportFeedback({ cases: allResolved, status: "open" });

        expect(allCasesResolved(completedReport)).toBe(true);
        expect(applyCaseStatusSync(completedReport).status).toBe("resolved");
    });

    it("reopens resolved issues when open cases remain after sync", () => {
        const report = createReportFeedback({
            status: "resolved",
            cases: [createReportCase("done", { status: "resolved" }), createReportCase("new")],
        });

        expect(syncIssueStatusFromCases(report)).toBe("open");
    });

    it("normalizes legacy message into a single case", () => {
        const cases = normalizeFeedbackCases({
            created_at: "2026-05-31T00:00:00.000Z",
            message: "legacy message",
            cases: [],
        });

        expect(cases).toHaveLength(1);
        expect(cases[0]?.text).toBe("legacy message");
    });

    it("validates submit cases", () => {
        expect(
            validateCasesForSubmit([], {
                casesRequired: "required",
                caseTextRequired: (index) => `empty ${index}`,
            }),
        ).toBe("required");

        expect(
            validateCasesForSubmit([{ text: "   " }], {
                casesRequired: "required",
                caseTextRequired: (index) => `empty ${index}`,
            }),
        ).toBe("empty 1");
    });

    it("normalizes reply case ids", () => {
        expect(normalizeReplyCaseIds(["a", "", "b"])).toEqual(["a", "b"]);
        expect(normalizeReplyCaseIds(undefined)).toEqual([]);
    });

    it("allows case edits except for archived issues", () => {
        expect(canEditReportCases(createReportFeedback({ status: "open" }))).toBe(true);
        expect(canEditReportCases(createReportFeedback({ status: "resolved" }))).toBe(true);
        expect(canEditReportCases(createReportFeedback({ status: "archived" }))).toBe(false);
    });

    it("validates open case selection for scoped replies", () => {
        const cases = [createReportCase("A"), createReportCase("B"), createReportCase("done", { status: "resolved" })];
        const report = createReportFeedback({ cases });

        expect(getOpenCaseIds(report)).toEqual([cases[0].id, cases[1].id]);
        expect(isValidCaseSelection(report, [])).toBe(false);
        expect(isValidCaseSelection(report, [cases[0].id])).toBe(true);
        expect(isValidCaseSelection(report, [cases[0].id, cases[1].id])).toBe(true);
        expect(isValidCaseSelection(report, [cases[2].id])).toBe(false);
        expect(isValidCaseSelection(report, ["missing"])).toBe(false);
    });

    it("builds partial resolve updates and case labels", () => {
        const cases = [createReportCase("A"), createReportCase("B")];
        const report = createReportFeedback({ cases, status: "open" });
        const nextCases = buildResolvedCasesUpdate(report, [cases[0].id]);

        expect(nextCases[0]?.status).toBe("resolved");
        expect(nextCases[1]?.status).toBe("open");
        expect(getCaseLabels(report, [cases[0].id, cases[1].id])).toEqual(["A", "B"]);
    });
});
