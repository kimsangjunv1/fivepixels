import type { ReportFeedback, ReportReply, ReportReplySummary } from "@/types/report.js";

export function toReplySummary(reply: ReportReply): ReportReplySummary {
    return {
        id: reply.id,
        message: reply.message,
        created_at: reply.created_at,
        status: reply.status,
        case_ids: reply.case_ids,
        author_type: reply.author_type,
        author_name: reply.author_name,
    };
}

export function summaryToReply(summary: ReportReplySummary, commentId: string): ReportReply {
    return {
        ...summary,
        comment_id: commentId,
        case_ids: summary.case_ids ?? [],
    };
}

export function normalizeListReport(item: ReportFeedback): ReportFeedback {
    const embeddedReplies = item.replies;
    const reply_count = item.reply_count ?? embeddedReplies?.length ?? 0;
    const latest_reply =
        item.latest_reply ??
        (embeddedReplies && embeddedReplies.length > 0 ? toReplySummary(embeddedReplies[embeddedReplies.length - 1]) : null);

    return {
        ...item,
        replies: embeddedReplies ?? [],
        reply_count,
        latest_reply,
    };
}

export function mergeRepliesIntoReport(report: ReportFeedback, replies: ReportReply[]): ReportFeedback {
    return {
        ...report,
        replies,
        reply_count: replies.length,
        latest_reply: replies.length > 0 ? toReplySummary(replies[replies.length - 1]) : null,
    };
}

export function needsReplyLoad(report: ReportFeedback, canListReplies: boolean): boolean {
    if (!canListReplies) {
        return false;
    }

    const count = typeof report.reply_count === "number" ? report.reply_count : (report.replies?.length ?? 0);

    if (count === 0) {
        return false;
    }

    return (report.replies?.length ?? 0) < count;
}
