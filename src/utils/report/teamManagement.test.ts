import { describe, expect, it } from "vitest";
import type { ReportAuthor } from "@/types/report.js";
import {
    hasTeamAdminHandlers,
    hasTeamRequestHandler,
    isReportAuthorAdmin,
    isTeamWriteEnabled,
    resolveAuthorRole,
    sortTeamReviewers,
} from "@/utils/report/teamManagement.js";

describe("teamManagement", () => {
    it("detects admin role and active flag", () => {
        expect(isReportAuthorAdmin({ id: "a", name: "A", role: "admin" })).toBe(true);
        expect(isReportAuthorAdmin({ id: "a", name: "A", role: "admin", isActive: false })).toBe(false);
        expect(isReportAuthorAdmin({ id: "a", name: "A", role: "reviewer" })).toBe(false);
        expect(resolveAuthorRole({ id: "a", name: "A" })).toBe("reviewer");
    });

    it("enables writes only in API persistence mode", () => {
        expect(isTeamWriteEnabled({ mode: "API", missingHandlers: [], ignoredHandlers: [] })).toBe(true);
        expect(isTeamWriteEnabled({ mode: "localStorage", missingHandlers: [], ignoredHandlers: [] })).toBe(false);
        expect(
            isTeamWriteEnabled({
                mode: "conflict",
                missingHandlers: ["onList"],
                ignoredHandlers: ["onCreate"],
            }),
        ).toBe(false);
    });

    it("detects team handler capabilities", () => {
        expect(hasTeamRequestHandler({ onCreateReviewerRequest: async () => ({ id: "1", author_id: "a", author_name: "A", public_key: "k", status: "pending", created_at: "" }) })).toBe(true);
        expect(hasTeamAdminHandlers({ onResolveReviewerRequest: async () => ({ id: "1", author_id: "a", author_name: "A", public_key: "k", status: "approved", created_at: "" }) })).toBe(true);
        expect(hasTeamAdminHandlers({})).toBe(false);
    });

    it("sorts admins first then by name", () => {
        const reviewers: ReportAuthor[] = [
            { id: "2", name: "Bob", role: "reviewer" },
            { id: "1", name: "Ada", role: "admin" },
            { id: "3", name: "Ann", role: "reviewer" },
        ];
        expect(sortTeamReviewers(reviewers).map((item) => item.name)).toEqual(["Ada", "Ann", "Bob"]);
    });
});
