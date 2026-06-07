import { describe, expect, it, beforeEach } from "vitest";
import { ko, setActiveReportMessages } from "@/i18n/index.js";
import { createReportPayload } from "./reportFixtures.js";
import { validateFeedbackImportArray } from "./validateFeedbackImport.js";

function createValidRecord(overrides: Record<string, unknown> = {}) {
    return {
        ...createReportPayload(),
        id: "report-1",
        created_at: "2026-01-01T00:00:00.000Z",
        replies: [],
        ...overrides,
    };
}

describe("validateFeedbackImportArray", () => {
    beforeEach(() => {
        setActiveReportMessages(ko);
    });

    it("accepts valid stitchable feedback arrays", () => {
        const result = validateFeedbackImportArray([createValidRecord()]);

        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe("report-1");
    });

    it("rejects non-array payloads", () => {
        expect(() => validateFeedbackImportArray({})).toThrow("피드백 배열");
    });

    it("rejects records missing required fields", () => {
        expect(() => validateFeedbackImportArray([{ id: "only-id" }])).toThrow("pathname");
    });

    it("rejects invalid report_type and status", () => {
        expect(() => validateFeedbackImportArray([createValidRecord({ report_type: "page" })])).toThrow("report_type");
        expect(() => validateFeedbackImportArray([createValidRecord({ status: "pending" })])).toThrow("status");
    });

    it("rejects duplicate ids", () => {
        const record = createValidRecord();
        expect(() => validateFeedbackImportArray([record, { ...record, message: "other" }])).toThrow("중복된 id");
    });

    it("rejects invalid replies", () => {
        expect(() =>
            validateFeedbackImportArray([
                createValidRecord({
                    replies: [{ id: "r1", message: "ok", created_at: "invalid-date", status: "suggested" }],
                }),
            ]),
        ).toThrow("replies[0].created_at");
    });
});
