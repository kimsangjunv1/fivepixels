import { describe, expect, it } from "vitest";
import type { ReportAuthor } from "@/types/report.js";
import {
    canAccessTeamSettings,
    canAssignTeamRole,
    canEditTeamMember,
    canViewTeamMember,
    filterVisibleTeamMembers,
    hasTeamAdminHandlers,
    isReportAuthorAdmin,
    isTeamWriteEnabled,
    listAssignableRoles,
    resolveAuthorRole,
    resolveTeamActor,
    sortTeamReviewers,
} from "@/utils/report/teamManagement.js";

const admin: ReportAuthor = { id: "a", name: "Admin", role: "admin" };
const sub: ReportAuthor = { id: "s", name: "Sub", role: "sub_admin" };
const member: ReportAuthor = { id: "m", name: "Member", role: "member" };
const peerAdmin: ReportAuthor = { id: "a2", name: "Admin2", role: "admin" };
const peerSub: ReportAuthor = { id: "s2", name: "Sub2", role: "sub_admin" };

describe("teamManagement hierarchy", () => {
    it("resolves roles and legacy reviewer → member", () => {
        expect(resolveAuthorRole({ role: "admin" })).toBe("admin");
        expect(resolveAuthorRole({ role: "sub_admin" })).toBe("sub_admin");
        expect(resolveAuthorRole({ role: "member" })).toBe("member");
        expect(resolveAuthorRole({ role: "reviewer" as never })).toBe("member");
        expect(resolveAuthorRole({})).toBe("member");
        expect(isReportAuthorAdmin(admin)).toBe(true);
        expect(isReportAuthorAdmin(sub)).toBe(false);
    });

    it("gates Settings → Team to admin/sub_admin", () => {
        expect(canAccessTeamSettings(admin)).toBe(true);
        expect(canAccessTeamSettings(sub)).toBe(true);
        expect(canAccessTeamSettings(member)).toBe(false);
        expect(canAccessTeamSettings({ ...admin, isActive: false })).toBe(false);
    });

    it("applies visibility rules", () => {
        expect(canViewTeamMember(admin, peerAdmin)).toBe(true);
        expect(canViewTeamMember(admin, sub)).toBe(true);
        expect(canViewTeamMember(admin, member)).toBe(true);
        expect(canViewTeamMember(sub, peerSub)).toBe(true);
        expect(canViewTeamMember(sub, member)).toBe(true);
        expect(canViewTeamMember(sub, admin)).toBe(false);
        expect(canViewTeamMember(member, member)).toBe(false);
        expect(filterVisibleTeamMembers(sub, [admin, sub, peerSub, member]).map((item) => item.id)).toEqual(["s", "s2", "m"]);
    });

    it("allows edits only for strictly lower ranks", () => {
        expect(canEditTeamMember(admin, peerAdmin)).toBe(false);
        expect(canEditTeamMember(admin, sub)).toBe(true);
        expect(canEditTeamMember(admin, member)).toBe(true);
        expect(canEditTeamMember(sub, peerSub)).toBe(false);
        expect(canEditTeamMember(sub, member)).toBe(true);
        expect(canEditTeamMember(sub, admin)).toBe(false);
        expect(canAssignTeamRole(admin, "sub_admin")).toBe(true);
        expect(canAssignTeamRole(admin, "admin")).toBe(false);
        expect(canAssignTeamRole(sub, "member")).toBe(true);
        expect(canAssignTeamRole(sub, "sub_admin")).toBe(false);
        expect(listAssignableRoles(admin)).toEqual(["member", "sub_admin"]);
        expect(listAssignableRoles(sub)).toEqual(["member"]);
    });

    it("enables writes only in API persistence mode", () => {
        expect(isTeamWriteEnabled({ mode: "API", missingHandlers: [], ignoredHandlers: [] })).toBe(true);
        expect(isTeamWriteEnabled({ mode: "localStorage", missingHandlers: [], ignoredHandlers: [] })).toBe(false);
        expect(hasTeamAdminHandlers({ onUpdateReviewer: async () => member })).toBe(true);
    });

    it("sorts by rank then name", () => {
        expect(sortTeamReviewers([member, admin, sub]).map((item) => item.role)).toEqual(["admin", "sub_admin", "member"]);
    });

    it("resolves team actor from API members in API mode", () => {
        const apiMembers = [
            { id: "u1", name: "API Admin", role: "admin" as const },
            { id: "u2", name: "API Member", role: "member" as const },
        ];

        expect(resolveTeamActor("u1", [], apiMembers, "API")).toEqual(apiMembers[0]);
        expect(resolveTeamActor("u2", [], apiMembers, "API")).toEqual(apiMembers[1]);
        expect(resolveTeamActor("u1", [], null, "API")).toBeNull();
    });

    it("falls back to team.reviewers when API member is missing", () => {
        const apiMembers = [{ id: "u2", name: "API Member", role: "member" as const }];

        expect(resolveTeamActor("a", [admin], apiMembers, "API")).toEqual(admin);
        expect(resolveTeamActor("u2", [admin], apiMembers, "API")).toEqual(apiMembers[0]);
    });

    it("uses team.reviewers only in local persistence mode", () => {
        const apiMembers = [{ id: "a", name: "API Admin", role: "member" as const }];

        expect(resolveTeamActor("a", [admin], apiMembers, "localStorage")).toEqual(admin);
    });
});
