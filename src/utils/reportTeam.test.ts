import { describe, expect, it } from "vitest";
import { resolveReportTeam } from "./reportTeam.js";

describe("resolveReportTeam", () => {
    it("resolves team object values", () => {
        expect(
            resolveReportTeam({
                team: {
                    user: { id: "team-user", name: "팀 사용자" },
                    reviewers: [{ id: "1", name: "리뷰어" }],
                },
            }),
        ).toEqual({
            user: { id: "team-user", name: "팀 사용자" },
            reviewers: [{ id: "1", name: "리뷰어" }],
            requireReviewerKey: false,
        });
    });

    it("uses empty defaults when team is omitted", () => {
        expect(resolveReportTeam({})).toEqual({
            user: undefined,
            reviewers: [],
            requireReviewerKey: false,
        });
    });

    it("enables reviewer key authentication from team config", () => {
        expect(resolveReportTeam({ team: { requireReviewerKey: true } }).requireReviewerKey).toBe(true);
    });
});
