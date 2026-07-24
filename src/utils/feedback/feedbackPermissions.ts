import type { ReportFeedback } from "@/types/report.js";
import { canEditReportCases, getCaseAssigneeName, getReportCases, hasCaseDiscussion } from "@/utils/report/reportCases.js";

export type FeedbackActor = {
    id?: string;
    name?: string;
} | null;

export function canDeleteFeedback(report: Pick<ReportFeedback, "author_id" | "author_name">, actor: FeedbackActor): boolean {
    if (!actor) {
        return false;
    }

    const authorId = report.author_id?.trim();
    const actorId = actor.id?.trim();

    if (authorId && actorId) {
        return authorId === actorId;
    }

    const authorName = report.author_name?.trim();
    const actorName = actor.name?.trim();

    return Boolean(authorName && actorName && authorName === actorName);
}

export function canRemoveCase(
    report: Pick<ReportFeedback, "author_id" | "author_name" | "status" | "cases" | "replies">,
    caseId: string,
    actor: FeedbackActor,
): boolean {
    if (!canEditReportCases(report) || !canDeleteFeedback(report, actor)) {
        return false;
    }

    if (getReportCases(report).length <= 1) {
        return false;
    }

    if (getCaseAssigneeName(report, caseId)) {
        return false;
    }

    if (hasCaseDiscussion(report, caseId)) {
        return false;
    }

    return getReportCases(report).some((item) => item.id === caseId);
}
