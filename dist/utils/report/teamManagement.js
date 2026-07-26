export function isReportAuthorAdmin(author) {
    return author?.role === "admin" && author.isActive !== false;
}
export function resolveAuthorRole(author) {
    return author.role === "admin" ? "admin" : "reviewer";
}
export function isTeamWriteEnabled(persistenceStatus) {
    return persistenceStatus.mode === "API";
}
export function hasTeamAdminHandlers(handlers) {
    return Boolean(handlers?.onListReviewerRequests || handlers?.onResolveReviewerRequest || handlers?.onRegisterReviewer || handlers?.onUpdateReviewer);
}
export function hasTeamRequestHandler(handlers) {
    return Boolean(handlers?.onCreateReviewerRequest);
}
export function sortTeamReviewers(reviewers) {
    return [...reviewers].sort((left, right) => {
        const leftAdmin = left.role === "admin" ? 0 : 1;
        const rightAdmin = right.role === "admin" ? 0 : 1;
        if (leftAdmin !== rightAdmin) {
            return leftAdmin - rightAdmin;
        }
        return left.name.localeCompare(right.name);
    });
}
//# sourceMappingURL=teamManagement.js.map