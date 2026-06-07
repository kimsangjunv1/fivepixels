import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import type { ReportFeedback, ReportReply, ReportReplyStatus } from "@/types/report.js";

export function getLatestReply(report: ReportFeedback): ReportReply | null {
    if (report.replies.length === 0) {
        return null;
    }

    return report.replies[report.replies.length - 1] ?? null;
}

export function getFeedbackDisplayStatus(report: ReportFeedback, expanded = false): FeedbackDisplayStatus {
    if (report.status === "git_issued") {
        return "git_issued";
    }

    if (report.status === "resolved") {
        return "resolved";
    }

    const latest = getLatestReply(report);

    if (!latest) {
        return expanded ? "wait_for_reply" : "currently_wait";
    }

    return latest.status;
}

export function getCheckboxFieldsFromValues(fieldValues: ReportFeedback["field_values"], labels: Map<string, string>): { key: string; label: string }[] {
    return Object.entries(fieldValues).flatMap(([key, value]) => {
        if (key === "message" || value !== true) {
            return [];
        }

        return [{ key, label: labels.get(key) ?? key }];
    });
}

export function canReviewLatestSuggestion(report: ReportFeedback): boolean {
    if (report.status !== "open") {
        return false;
    }

    const latest = getLatestReply(report);
    return latest?.status === "suggested";
}

export function canCheckoutReply(report: ReportFeedback, reply: ReportReply): boolean {
    if (reply.status !== "found_error") {
        return false;
    }

    const latest = getLatestReply(report);
    return latest?.id === reply.id;
}

export function resolveOriginalFeedbackAuthorName(report: ReportFeedback) {
    return report.author_name?.trim() ?? "";
}

export function createReplyStatusForSubmit(pending: "deny" | "checkout" | null): ReportReplyStatus {
    if (pending === "deny") {
        return "found_error";
    }

    return "suggested";
}
