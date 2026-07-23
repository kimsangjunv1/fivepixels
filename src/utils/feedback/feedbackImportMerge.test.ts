import { describe, expect, it } from "vitest";
import type { ReportReply } from "@/types/report.js";
import { createReportCase } from "@/utils/report/reportCases.js";
import { createReportFeedback } from "@/utils/report/reportFixtures.js";
import { mergeFeedbackCollections, mergeFeedbackItem, mergeReplyCollections } from "./feedbackImportMerge.js";

function createReply(overrides: Partial<ReportReply> & Pick<ReportReply, "id" | "message">): ReportReply {
    return {
        created_at: "2026-01-01T00:00:00.000Z",
        status: "resolved",
        case_ids: [],
        author_type: "user",
        ...overrides,
    };
}

describe("mergeReplyCollections", () => {
    it("unions local-only and incoming-only replies by id", () => {
        const existing = [createReply({ id: "local-1", message: "mine" })];
        const incoming = [createReply({ id: "remote-1", message: "theirs" })];

        const result = mergeReplyCollections(existing, incoming);

        expect(result.replies.map((reply) => reply.id)).toEqual(["local-1", "remote-1"]);
        expect(result.localOnlyPreserved).toBe(1);
    });

    it("prefers the newer reply when the same id appears on both sides", () => {
        const existing = [createReply({ id: "shared", message: "old", created_at: "2026-01-01T00:00:00.000Z" })];
        const incoming = [createReply({ id: "shared", message: "new", created_at: "2026-01-02T00:00:00.000Z" })];

        const result = mergeReplyCollections(existing, incoming);

        expect(result.replies).toHaveLength(1);
        expect(result.replies[0]?.message).toBe("new");
        expect(result.localOnlyPreserved).toBe(0);
    });

    it("keeps the existing reply when it is newer than the incoming one", () => {
        const existing = [createReply({ id: "shared", message: "newer-local", created_at: "2026-01-03T00:00:00.000Z" })];
        const incoming = [createReply({ id: "shared", message: "older-remote", created_at: "2026-01-02T00:00:00.000Z" })];

        const result = mergeReplyCollections(existing, incoming);

        expect(result.replies[0]?.message).toBe("newer-local");
    });
});

describe("mergeFeedbackItem", () => {
    it("takes incoming content fields while preserving local-only replies", () => {
        const existing = createReportFeedback({
            id: "same",
            cases: [createReportCase("local case", { id: "c1", created_at: "2026-01-01T00:00:00.000Z" })],
            status: "open",
            created_at: "2026-01-01T00:00:00.000Z",
            replies: [createReply({ id: "local-reply", message: "my answer" })],
        });
        const incoming = createReportFeedback({
            id: "same",
            cases: [createReportCase("updated case", { id: "c1", created_at: "2026-01-01T00:00:00.000Z" })],
            status: "resolved",
            created_at: "2026-01-05T00:00:00.000Z",
            replies: [createReply({ id: "remote-reply", message: "author note" })],
        });

        const result = mergeFeedbackItem(existing, incoming);

        expect(result.item.cases[0]?.text).toBe("updated case");
        expect(result.item.status).toBe("resolved");
        expect(result.item.created_at).toBe("2026-01-01T00:00:00.000Z");
        expect(result.item.replies?.map((reply) => reply.id)).toEqual(["local-reply", "remote-reply"]);
        expect(result.item.reply_count).toBe(2);
        expect(result.localRepliesPreserved).toBe(1);
    });
});

describe("mergeFeedbackCollections", () => {
    it("keeps local-only feedback, inserts incoming-only, and merges matching ids", () => {
        const localOnly = createReportFeedback({
            id: "local-only",
            cases: [createReportCase("local feedback", { id: "c-local" })],
        });
        const sharedLocal = createReportFeedback({
            id: "shared",
            cases: [createReportCase("old shared", { id: "c-shared" })],
            replies: [createReply({ id: "b-reply", message: "from B" })],
        });
        const sharedIncoming = createReportFeedback({
            id: "shared",
            cases: [createReportCase("new shared", { id: "c-shared" })],
            replies: [createReply({ id: "a-reply", message: "from A" })],
        });
        const incomingOnly = createReportFeedback({
            id: "incoming-only",
            cases: [createReportCase("new from A", { id: "c-new" })],
        });

        const result = mergeFeedbackCollections([localOnly, sharedLocal], [sharedIncoming, incomingOnly]);

        expect(result.inserted).toBe(1);
        expect(result.updated).toBe(1);
        expect(result.kept).toBe(1);
        expect(result.localRepliesPreserved).toBe(1);
        expect(result.items.map((item) => item.id).sort()).toEqual(["incoming-only", "local-only", "shared"]);

        const shared = result.items.find((item) => item.id === "shared");
        expect(shared?.cases[0]?.text).toBe("new shared");
        expect(shared?.replies?.map((reply) => reply.id).sort()).toEqual(["a-reply", "b-reply"]);
    });
});
