import type { ReportAuthor, ReportAuthorRole, ReportTeamHandlers } from "@/types/report.js";
import type { PersistenceStatus } from "@/utils/shared/storage.js";

const ROLE_RANK: Record<ReportAuthorRole, number> = {
    member: 1,
    sub_admin: 2,
    admin: 3,
};

/** Map legacy `reviewer` (and unknown) to `member`. */
export function resolveAuthorRole(author: Pick<ReportAuthor, "role"> | null | undefined): ReportAuthorRole {
    const role = author?.role as string | undefined;
    if (role === "admin") {
        return "admin";
    }
    if (role === "sub_admin") {
        return "sub_admin";
    }
    return "member";
}

export function getAuthorRoleRank(role: ReportAuthorRole): number {
    return ROLE_RANK[role];
}

export function isReportAuthorAdmin(author: ReportAuthor | null | undefined): boolean {
    return resolveAuthorRole(author) === "admin" && author?.isActive !== false;
}

export function isReportAuthorSubAdmin(author: ReportAuthor | null | undefined): boolean {
    return resolveAuthorRole(author) === "sub_admin" && author?.isActive !== false;
}

/** Settings → Team tab: admin and sub_admin only. */
export function canAccessTeamSettings(author: ReportAuthor | null | undefined): boolean {
    if (!author || author.isActive === false) {
        return false;
    }
    const role = resolveAuthorRole(author);
    return role === "admin" || role === "sub_admin";
}

/** Can perform any team write (approve / register / update) in API mode. */
export function canManageTeamMembers(author: ReportAuthor | null | undefined): boolean {
    return canAccessTeamSettings(author);
}

export function canViewTeamMember(viewer: ReportAuthor | null | undefined, target: ReportAuthor): boolean {
    if (!canAccessTeamSettings(viewer)) {
        return false;
    }
    const viewerRole = resolveAuthorRole(viewer);
    const targetRole = resolveAuthorRole(target);
    if (viewerRole === "admin") {
        return true;
    }
    // sub_admin: peers + members (not admins)
    return targetRole === "sub_admin" || targetRole === "member";
}

/** `isJoined` omitted means joined (legacy `members.list` responses). */
export function isJoinedTeamMember(author: Pick<ReportAuthor, "isJoined"> | null | undefined): boolean {
    return author?.isJoined !== false;
}

export function filterJoinedTeamMembers(members: ReportAuthor[]): ReportAuthor[] {
    return members.filter((member) => isJoinedTeamMember(member));
}

/** Same-rank peers are visible but not editable. Only strictly lower ranks. */
export function canEditTeamMember(actor: ReportAuthor | null | undefined, target: ReportAuthor): boolean {
    if (!canManageTeamMembers(actor) || !isJoinedTeamMember(target)) {
        return false;
    }
    return getAuthorRoleRank(resolveAuthorRole(actor)) > getAuthorRoleRank(resolveAuthorRole(target));
}

export function canAssignTeamRole(actor: ReportAuthor | null | undefined, nextRole: ReportAuthorRole): boolean {
    if (!canManageTeamMembers(actor)) {
        return false;
    }
    return getAuthorRoleRank(resolveAuthorRole(actor)) > getAuthorRoleRank(nextRole);
}

export function listAssignableRoles(actor: ReportAuthor | null | undefined): ReportAuthorRole[] {
    return (["member", "sub_admin", "admin"] as const).filter((role) => canAssignTeamRole(actor, role));
}

export function filterVisibleTeamMembers(viewer: ReportAuthor | null | undefined, members: ReportAuthor[]): ReportAuthor[] {
    return members.filter((member) => canViewTeamMember(viewer, member));
}

export function isTeamWriteEnabled(persistenceStatus: PersistenceStatus): boolean {
    return persistenceStatus.mode === "API";
}

/**
 * Resolve the active team actor for permission checks.
 * API mode prefers `adapter.members.list` results; local mode uses `team.reviewers` only.
 */
export function resolveTeamActor(
    authorizedAuthorId: string | null | undefined,
    teamReviewers: ReportAuthor[],
    apiTeamMembers: ReportAuthor[] | null,
    persistenceMode: PersistenceStatus["mode"],
): ReportAuthor | null {
    if (!authorizedAuthorId) {
        return null;
    }

    if (persistenceMode === "API" && apiTeamMembers) {
        const fromApi = apiTeamMembers.find((member) => member.id === authorizedAuthorId);
        if (fromApi) {
            return fromApi;
        }
    }

    return teamReviewers.find((reviewer) => reviewer.id === authorizedAuthorId) ?? null;
}

export function hasTeamAdminHandlers(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean {
    return Boolean(handlers?.onListReviewerRequests || handlers?.onResolveReviewerRequest || handlers?.onRegisterReviewer || handlers?.onUpdateReviewer);
}

export function hasTeamRequestHandler(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean {
    return Boolean(handlers?.onCreateReviewerRequest);
}

export function sortTeamReviewers(reviewers: ReportAuthor[]): ReportAuthor[] {
    return [...reviewers].sort((left, right) => {
        const rankDiff = getAuthorRoleRank(resolveAuthorRole(right)) - getAuthorRoleRank(resolveAuthorRole(left));
        if (rankDiff !== 0) {
            return rankDiff;
        }
        return left.name.localeCompare(right.name);
    });
}
