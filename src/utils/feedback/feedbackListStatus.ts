import type { FeedbackListStatusTag } from "@/constants/feedbackCategory.js";
import type { ReportFeedback } from "@/types/report.js";
import { allCasesResolved, getReportCases } from "@/utils/report/reportCases.js";
import { getReportReplies } from "@/utils/feedback/feedbackThread.js";

export function getFeedbackListStatusTag(report: ReportFeedback): FeedbackListStatusTag {
    if (report.status === "resolved" || allCasesResolved(report)) {
        return "resolved";
    }

    const hasAssignee = getReportCases(report).some((item) => Boolean(item.assignee_name?.trim()));
    const hasProgressReply = getReportReplies(report).some(
        (reply) =>
            reply.status === "suggested" ||
            reply.status === "found_error" ||
            reply.status === "recheck_requested" ||
            reply.status === "additional_question" ||
            reply.status === "assignee_assigned" ||
            reply.status === "assignee_transferred",
    );

    if (hasAssignee || hasProgressReply || report.status === "git_issued") {
        return "processed";
    }

    return "no_assignee";
}
