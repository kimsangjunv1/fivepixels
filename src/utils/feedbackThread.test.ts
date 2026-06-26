import { describe, expect, it } from "vitest";
import type { ReportFeedback } from "@/types/report.js";
import { createReportFeedback } from "./reportFixtures.js";
import {
    buildThreadTimeline,
    canAskQuestionOnLatest,
    canCheckoutReply,
    canManagerAskQuestionOnLatest,
    canReviewLatestSuggestion,
    canShowCheckoutBranchActions,
    canShowIssueEntryActions,
    canShowSuggestedBranchActions,
    createReplyStatusForSubmit,
    getFeedbackDisplayStatus,
    groupRepliesIntoBranches,
    inferParentReplyId,
    ISSUE_ROOT_PARENT_ID,
    normalizeReplyParents,
    resolveParentReplyIdForQuestion,
    shouldShowReplyComposer,
} from "./feedbackThread.js";

function createReport(overrides: Partial<ReportFeedback> = {}): ReportFeedback {
    return createReportFeedback({
        id: "f1",
        pathname: "/",
        message: "issue",
        position: {
            target: null,
            viewport: { x: 0.5, y: 0.5, width: 100, height: 100 },
            scrollY: 0,
            anchor: null,
        },
        ...overrides,
    });
}

describe("feedbackThread", () => {
    it("returns currently wait when there are no replies", () => {
        expect(getFeedbackDisplayStatus(createReport())).toBe("currently_wait");
        expect(getFeedbackDisplayStatus(createReport(), true)).toBe("wait_for_reply");
        expect(canShowIssueEntryActions(createReport())).toBe(true);
        expect(shouldShowReplyComposer(createReport(), null)).toBe(false);
        expect(shouldShowReplyComposer(createReport(), { type: "checkout", targetReplyId: ISSUE_ROOT_PARENT_ID })).toBe(true);
    });

    it("maps deny, checkout, and question submit statuses", () => {
        expect(createReplyStatusForSubmit("deny")).toBe("found_error");
        expect(createReplyStatusForSubmit("recheck")).toBe("recheck_requested");
        expect(createReplyStatusForSubmit("checkout")).toBe("suggested");
        expect(createReplyStatusForSubmit(null)).toBe("suggested");
        expect(createReplyStatusForSubmit(null, true)).toBe("additional_question");
        expect(createReplyStatusForSubmit("question")).toBe("additional_question");
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
        expect(canAskQuestionOnLatest(report)).toBe(true);
        expect(canCheckoutReply(report, report.replies[0])).toBe(false);
    });

    it("shows composer when the latest reply is found_error or recheck_requested", () => {
        const foundErrorReport = createReport({
            replies: [
                {
                    id: "r1",
                    message: "still broken",
                    created_at: "2026-01-02T00:00:00.000Z",
                    status: "found_error",
                },
            ],
        });

        expect(canManagerAskQuestionOnLatest(foundErrorReport)).toBe(true);
        expect(shouldShowReplyComposer(foundErrorReport, null)).toBe(true);

        const recheckReport = createReport({
            replies: [
                {
                    id: "r2",
                    message: "not an error",
                    created_at: "2026-01-03T00:00:00.000Z",
                    status: "recheck_requested",
                },
            ],
        });

        expect(canManagerAskQuestionOnLatest(recheckReport)).toBe(true);
        expect(shouldShowReplyComposer(recheckReport, null)).toBe(true);
    });

    it("shows composer when the latest reply is an additional question", () => {
        const report = createReport({
            replies: [
                {
                    id: "r1",
                    message: "can you clarify?",
                    created_at: "2026-01-02T00:00:00.000Z",
                    status: "additional_question",
                },
            ],
        });

        expect(getFeedbackDisplayStatus(report)).toBe("additional_question");
        expect(canReviewLatestSuggestion(report)).toBe(false);
        expect(shouldShowReplyComposer(report, null)).toBe(true);
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

        const reportWithQuestion = createReport({
            replies: [
                foundError,
                {
                    id: "r3",
                    message: "why not?",
                    created_at: "2026-01-04T00:00:00.000Z",
                    status: "additional_question",
                    parent_reply_id: "r2",
                },
            ],
        });

        expect(canCheckoutReply(reportWithQuestion, foundError)).toBe(true);
        expect(canShowCheckoutBranchActions(reportWithQuestion, foundError)).toBe(true);
        expect(canManagerAskQuestionOnLatest(reportWithQuestion)).toBe(true);

        const recheckRequested = {
            id: "r4",
            message: "please review again",
            created_at: "2026-01-05T00:00:00.000Z",
            status: "recheck_requested" as const,
        };

        expect(canCheckoutReply(createReport({ replies: [recheckRequested] }), recheckRequested)).toBe(true);
    });

    it("keeps suggested branch actions when additional questions follow", () => {
        const suggested = {
            id: "r1",
            message: "fix",
            created_at: "2026-01-02T00:00:00.000Z",
            status: "suggested" as const,
        };
        const report = createReport({
            replies: [
                suggested,
                {
                    id: "r2",
                    message: "why?",
                    created_at: "2026-01-03T00:00:00.000Z",
                    status: "additional_question",
                    parent_reply_id: "r1",
                },
            ],
        });

        expect(canReviewLatestSuggestion(report)).toBe(true);
        expect(canShowSuggestedBranchActions(report, suggested)).toBe(true);
        expect(canAskQuestionOnLatest(report)).toBe(true);
        expect(canShowIssueEntryActions(report)).toBe(false);
    });

    it("groups additional_question replies under the preceding branch root", () => {
        const report = createReport({
            replies: [
                {
                    id: "r1",
                    message: "ok fix",
                    created_at: "2026-01-02T00:00:00.000Z",
                    status: "suggested",
                },
                {
                    id: "r2",
                    message: "why?",
                    created_at: "2026-01-03T00:00:00.000Z",
                    status: "additional_question",
                },
                {
                    id: "r3",
                    message: "because",
                    created_at: "2026-01-04T00:00:00.000Z",
                    status: "suggested",
                },
                {
                    id: "r4",
                    message: "not fixed",
                    created_at: "2026-01-05T00:00:00.000Z",
                    status: "found_error",
                },
                {
                    id: "r5",
                    message: "explain?",
                    created_at: "2026-01-06T00:00:00.000Z",
                    status: "additional_question",
                },
            ],
        });

        const normalized = normalizeReplyParents(report.replies);

        expect(normalized[1].parent_reply_id).toBe("r1");
        expect(normalized[4].parent_reply_id).toBe("r4");

        const branches = buildThreadTimeline(report).branches;

        expect(branches).toHaveLength(3);
        expect(branches[0].root.id).toBe("r1");
        expect(branches[0].children.map((child) => child.id)).toEqual(["r2"]);
        expect(branches[1].root.id).toBe("r3");
        expect(branches[1].children).toHaveLength(0);
        expect(branches[2].root.id).toBe("r4");
        expect(branches[2].children.map((child) => child.id)).toEqual(["r5"]);
    });

    it("resolves parent reply id for follow-up questions", () => {
        const report = createReport({
            replies: [
                {
                    id: "r1",
                    message: "fix",
                    created_at: "2026-01-02T00:00:00.000Z",
                    status: "suggested",
                },
                {
                    id: "r2",
                    message: "why?",
                    created_at: "2026-01-03T00:00:00.000Z",
                    status: "additional_question",
                    parent_reply_id: "r1",
                },
            ],
        });

        expect(resolveParentReplyIdForQuestion(report, null)).toBe("r1");
        expect(resolveParentReplyIdForQuestion(report, { type: "question", targetReplyId: "r1" })).toBe("r1");
    });

    it("parents the first additional question to the original issue root", () => {
        const report = createReport({
            replies: [
                {
                    id: "q1",
                    message: "why is this an issue?",
                    created_at: "2026-01-02T00:00:00.000Z",
                    status: "additional_question",
                },
            ],
        });

        const normalized = normalizeReplyParents(report.replies);

        expect(normalized[0].parent_reply_id).toBe(ISSUE_ROOT_PARENT_ID);

        const timeline = buildThreadTimeline(report);

        expect(timeline.issueChildren).toHaveLength(1);
        expect(timeline.issueChildren[0]?.id).toBe("q1");
        expect(timeline.branches).toHaveLength(0);
        expect(resolveParentReplyIdForQuestion(createReport(), null)).toBe(ISSUE_ROOT_PARENT_ID);
    });
});
