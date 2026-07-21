import { describe, expect, it } from "vitest";
import type { ReportReply } from "@/types/report.js";
import { paginateSortedReplies, prependReplies, sortRepliesChronologically } from "./replyHistory.js";

function createReply(id: string, createdAt: string): ReportReply {
    return {
        id,
        message: id,
        created_at: createdAt,
        status: "suggested",
    };
}

describe("replyHistory", () => {
    it("returns the latest replies for the initial page", () => {
        const sorted = sortRepliesChronologically([
            createReply("r1", "2026-01-01T00:00:00.000Z"),
            createReply("r2", "2026-01-02T00:00:00.000Z"),
            createReply("r3", "2026-01-03T00:00:00.000Z"),
        ]);

        const page = paginateSortedReplies(sorted, { limit: 2 });

        expect(page.items.map((reply) => reply.id)).toEqual(["r2", "r3"]);
        expect(page.hasMore).toBe(true);
        expect(page.nextCursor).toBe("r2");
    });

    it("loads older replies using the cursor", () => {
        const sorted = sortRepliesChronologically([
            createReply("r1", "2026-01-01T00:00:00.000Z"),
            createReply("r2", "2026-01-02T00:00:00.000Z"),
            createReply("r3", "2026-01-03T00:00:00.000Z"),
        ]);

        const olderPage = paginateSortedReplies(sorted, {
            limit: 2,
            cursor: "r2",
            direction: "older",
        });

        expect(olderPage.items.map((reply) => reply.id)).toEqual(["r1"]);
        expect(olderPage.hasMore).toBe(false);
    });

    it("prepends older replies without duplicates", () => {
        const existing = [createReply("r2", "2026-01-02T00:00:00.000Z")];
        const older = [createReply("r1", "2026-01-01T00:00:00.000Z"), createReply("r2", "2026-01-02T00:00:00.000Z")];

        expect(prependReplies(existing, older).map((reply) => reply.id)).toEqual(["r1", "r2"]);
    });
});
