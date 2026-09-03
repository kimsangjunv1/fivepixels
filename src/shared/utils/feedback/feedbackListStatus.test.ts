import { describe, expect, it } from "vitest";
import { getFeedbackListStatusTag } from "./feedbackListStatus.js";
import { createReportCase, createReportFeedback } from "../report/reportFixtures.js";

describe("getFeedbackListStatusTag", () => {
    it("returns resolved when report is resolved", () => {
        const report = createReportFeedback({ status: "resolved" });

        expect(getFeedbackListStatusTag(report)).toBe("resolved");
    });

    it("returns no_assignee when open without assignee or replies", () => {
        const report = createReportFeedback({
            status: "open",
            cases: [createReportCase("hello")],
            replies: [],
        });

        expect(getFeedbackListStatusTag(report)).toBe("no_assignee");
    });

    it("returns processed when assignee exists", () => {
        const report = createReportFeedback({
            status: "open",
            cases: [createReportCase("hello", { assignee_name: "Kim" })],
            replies: [],
        });

        expect(getFeedbackListStatusTag(report)).toBe("processed");
    });

    it("returns processed when progress replies exist", () => {
        const report = createReportFeedback({
            status: "open",
            replies: [
                {
                    id: "r1",
                    message: "done",
                    created_at: "2026-07-01T00:00:00.000Z",
                    status: "suggested",
                    case_ids: [],
                },
            ],
        });

        expect(getFeedbackListStatusTag(report)).toBe("processed");
    });
});
