import { describe, expect, it } from "vitest";
import { resolveReportTeam } from "./reportTeam.js";

describe("resolveReportTeam", () => {
    it("prefers team object values over legacy flat props", () => {
        expect(
            resolveReportTeam({
                team: {
                    user: { id: "team-user", name: "팀 사용자" },
                    reviewers: [{ id: "1", name: "리뷰어" }],
                },
                identify: { id: "legacy-user", name: "레거시" },
                authors: [{ id: "2", name: "작성자" }],
            }),
        ).toEqual({
            user: { id: "team-user", name: "팀 사용자" },
            reviewers: [{ id: "1", name: "리뷰어" }],
        });
    });

    it("falls back to legacy flat props", () => {
        expect(
            resolveReportTeam({
                identify: { id: "legacy-user", name: "레거시" },
                authors: [{ id: "2", name: "작성자" }],
            }),
        ).toEqual({
            user: { id: "legacy-user", name: "레거시" },
            reviewers: [{ id: "2", name: "작성자" }],
        });
    });
});
