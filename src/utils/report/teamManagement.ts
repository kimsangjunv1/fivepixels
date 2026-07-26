import type { ReportAuthor, ReportAuthorRole, ReportTeamHandlers } from "@/types/report.js";
import type { PersistenceStatus } from "@/utils/shared/storage.js";

export function isReportAuthorAdmin(author: ReportAuthor | null | undefined): boolean {
    return author?.role === "admin" && author.isActive !== false;
}

export function resolveAuthorRole(author: ReportAuthor): ReportAuthorRole {
    return author.role === "admin" ? "admin" : "reviewer";
}

export function isTeamWriteEnabled(persistenceStatus: PersistenceStatus): boolean {
    return persistenceStatus.mode === "API";
}

export function hasTeamAdminHandlers(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean {
    return Boolean(handlers?.onListReviewerRequests || handlers?.onResolveReviewerRequest || handlers?.onRegisterReviewer || handlers?.onUpdateReviewer);
}

export function hasTeamRequestHandler(handlers: Partial<ReportTeamHandlers> | null | undefined): boolean {
    return Boolean(handlers?.onCreateReviewerRequest);
}

export function sortTeamReviewers(reviewers: ReportAuthor[]): ReportAuthor[] {
    return [...reviewers].sort((left, right) => {
        const leftAdmin = left.role === "admin" ? 0 : 1;
        const rightAdmin = right.role === "admin" ? 0 : 1;
        if (leftAdmin !== rightAdmin) {
            return leftAdmin - rightAdmin;
        }
        return left.name.localeCompare(right.name);
    });
}
