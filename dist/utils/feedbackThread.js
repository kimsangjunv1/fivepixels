export function getLatestReply(report) {
    if (report.replies.length === 0) {
        return null;
    }
    return report.replies[report.replies.length - 1] ?? null;
}
export function getFeedbackDisplayStatus(report, expanded = false) {
    if (report.status === "resolved") {
        return "verified";
    }
    const latest = getLatestReply(report);
    if (!latest) {
        return expanded ? "wait_for_reply" : "currently_wait";
    }
    return latest.status;
}
export function getCheckboxFieldsFromValues(fieldValues, labels) {
    return Object.entries(fieldValues).flatMap(([key, value]) => {
        if (key === "message" || value !== true) {
            return [];
        }
        return [{ key, label: labels.get(key) ?? key }];
    });
}
export function canReviewLatestSuggestion(report) {
    if (report.status !== "open") {
        return false;
    }
    const latest = getLatestReply(report);
    return latest?.status === "suggested";
}
export function canCheckoutReply(reply) {
    return reply.status === "found_error";
}
export function createReplyStatusForSubmit(pending) {
    if (pending === "deny") {
        return "found_error";
    }
    return "suggested";
}
//# sourceMappingURL=feedbackThread.js.map