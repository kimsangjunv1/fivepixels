import { describe, expect, it } from "vitest";
import type { ReportFeedback } from "@/types/report.js";
import {
    canCheckoutReply,
    canReviewLatestSuggestion,
    createReplyStatusForSubmit,
    getFeedbackDisplayStatus,
} from "./feedbackThread.js";

function createReport(overrides: Partial<ReportFeedback> = {}): ReportFeedback {
    return {
        id: "f1",
        pathname: "/",
        report_id: "hero",
        report_type: "group",
        message: "issue",
        status: "open",
        field_values: {},
        replies: [],
        x_ratio: 0.5,
        y_ratio: 0.5,
        element_x_ratio: null,
        element_y_ratio: null,
        scroll_y: 0,
        document_y: 0,
        viewport_width: 100,
        viewport_height: 100,
        design_width: 100,
        design_height: 100,
        created_at: "2026-01-01T00:00:00.000Z",
        ...overrides,
    };
}

describe("feedbackThread", () => {
    it("returns currently wait when there are no replies", () => {
        expect(getFeedbackDisplayStatus(createReport())).toBe("currently_wait");
        expect(getFeedbackDisplayStatus(createReport(), true)).toBe("wait_for_reply");
    });

    it("maps deny and checkout submit statuses", () => {
        expect(createReplyStatusForSubmit("deny")).toBe("found_error");
        expect(createReplyStatusForSubmit("recheck")).toBe("recheck_requested");
        expect(createReplyStatusForSubmit("checkout")).toBe("suggested");
        expect(createReplyStatusForSubmit(null)).toBe("suggested");
    });

    it("shows review actions only on latest suggested reply", () => {
        const report = createReport({
            replies: [
                {
                    id: "r1",
                    message: "fix",
                    created_at: "2026-01-02T00:00:00.000Z",
                    status: "suggested",
                },
            ],
        });

        expect(canReviewLatestSuggestion(report)).toBe(true);
        expect(canCheckoutReply(report, report.replies[0])).toBe(false);
    });

    it("allows checkout on the latest found_error or recheck_requested reply", () => {
        const foundError = {
            id: "r2",
            message: "still broken",
            created_at: "2026-01-03T00:00:00.000Z",
            status: "found_error" as const,
        };
        const reportWithFoundError = createReport({ replies: [foundError] });

        expect(canCheckoutReply(reportWithFoundError, foundError)).toBe(true);

        const reportWithFollowUp = createReport({
            replies: [
                foundError,
                {
                    id: "r3",
                    message: "fixed again",
                    created_at: "2026-01-04T00:00:00.000Z",
                    status: "suggested",
                },
            ],
        });

        expect(canCheckoutReply(reportWithFollowUp, foundError)).toBe(false);

        const recheckRequested = {
            id: "r4",
            message: "please review again",
            created_at: "2026-01-05T00:00:00.000Z",
            status: "recheck_requested" as const,
        };

        expect(canCheckoutReply(createReport({ replies: [recheckRequested] }), recheckRequested)).toBe(true);
    });
});
