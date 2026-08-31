const ROLE_RANK = {
    member: 1,
    sub_admin: 2,
    admin: 3,
};
/** Map legacy `reviewer` (and unknown) to `member`. */
export function resolveAuthorRole(author) {
    const role = author?.role;
    if (role === "admin") {
        return "admin";
    }
    if (role === "sub_admin") {
        return "sub_admin";
    }
    return "member";
}
export function getAuthorRoleRank(role) {
    return ROLE_RANK[role];
}
export function isReportAuthorAdmin(author) {
    return resolveAuthorRole(author) === "admin" && author?.isActive !== false;
}
export function isReportAuthorSubAdmin(author) {
    return resolveAuthorRole(author) === "sub_admin" && author?.isActive !== false;
}
/** Settings → Team tab: admin and sub_admin only. */
export function canAccessTeamSettings(author) {
    if (!author || author.isActive === false) {
        return false;
    }
    const role = resolveAuthorRole(author);
    return role === "admin" || role === "sub_admin";
}
/** Can perform any team write (approve / register / update) in API mode. */
export function canManageTeamMembers(author) {
    return canAccessTeamSettings(author);
}
export function canViewTeamMember(viewer, target) {
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
/** Same-rank peers are visible but not editable. Only strictly lower ranks. */
export function canEditTeamMember(actor, target) {
    if (!canManageTeamMembers(actor)) {
        return false;
    }
    return getAuthorRoleRank(resolveAuthorRole(actor)) > getAuthorRoleRank(resolveAuthorRole(target));
}
export function canAssignTeamRole(actor, nextRole) {
    if (!canManageTeamMembers(actor)) {
        return false;
    }
    return getAuthorRoleRank(resolveAuthorRole(actor)) > getAuthorRoleRank(nextRole);
}
export function listAssignableRoles(actor) {
    return ["member", "sub_admin", "admin"].filter((role) => canAssignTeamRole(actor, role));
}
export function filterVisibleTeamMembers(viewer, members) {
    return members.filter((member) => canViewTeamMember(viewer, member));
}
export function isTeamWriteEnabled(persistenceStatus) {
    return persistenceStatus.mode === "API";
}
/**
 * Resolve the active team actor for permission checks.
 * API mode prefers `adapter.members.list` results; local mode uses `team.reviewers` only.
 */
export function resolveTeamActor(authorizedAuthorId, teamReviewers, apiTeamMembers, persistenceMode) {
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
export function hasTeamAdminHandlers(handlers) {
    return Boolean(handlers?.onListReviewerRequests || handlers?.onResolveReviewerRequest || handlers?.onRegisterReviewer || handlers?.onUpdateReviewer);
}
export function hasTeamRequestHandler(handlers) {
    return Boolean(handlers?.onCreateReviewerRequest);
}
export function sortTeamReviewers(reviewers) {
    return [...reviewers].sort((left, right) => {
        const rankDiff = getAuthorRoleRank(resolveAuthorRole(right)) - getAuthorRoleRank(resolveAuthorRole(left));
        if (rankDiff !== 0) {
            return rankDiff;
        }
        return left.name.localeCompare(right.name);
    });
}
//# sourceMappingURL=teamManagement.js.map