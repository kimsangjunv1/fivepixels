import { describe, expect, it } from "vitest";
import { allocateNextFcNumber, backfillFcNumbers, formatFeedbackCaseId, getFeedbackCaseId } from "./feedbackCaseId.js";
import type { ReportFeedback } from "@/types/report.js";
import { createReportFeedback } from "./reportFixtures.js";

describe("feedbackCaseId", () => {
    it("formats and reads case ids", () => {
        expect(formatFeedbackCaseId(192)).toBe("#FC-192");
        expect(getFeedbackCaseId({ fc_number: 192 })).toBe("#FC-192");
        expect(getFeedbackCaseId({})).toBeNull();
    });

    it("allocates the next fc number", () => {
        expect(allocateNextFcNumber([])).toBe(1);
        expect(allocateNextFcNumber([{ fc_number: 3 }, { fc_number: 12 }])).toBe(13);
    });

    it("backfills missing fc numbers in created order", () => {
        const reports: ReportFeedback[] = [
            createReportFeedback({ id: "b", created_at: "2026-07-02T00:00:00.000Z" }),
            createReportFeedback({ id: "a", created_at: "2026-07-01T00:00:00.000Z", fc_number: 5 }),
        ];

        const result = backfillFcNumbers(reports);

        expect(result.find((item) => item.id === "a")?.fc_number).toBe(5);
        expect(result.find((item) => item.id === "b")?.fc_number).toBe(6);
    });
});
