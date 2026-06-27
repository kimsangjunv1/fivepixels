export function toReplySummary(reply) {
    return {
        id: reply.id,
        message: reply.message,
        created_at: reply.created_at,
        status: reply.status,
        author_type: reply.author_type,
        author_name: reply.author_name,
    };
}
export function summaryToReply(summary, commentId) {
    return {
        ...summary,
        comment_id: commentId,
    };
}
export function normalizeListReport(item) {
    const embeddedReplies = item.replies;
    const reply_count = item.reply_count ?? embeddedReplies?.length ?? 0;
    const latest_reply = item.latest_reply ??
        (embeddedReplies && embeddedReplies.length > 0 ? toReplySummary(embeddedReplies[embeddedReplies.length - 1]) : null);
    return {
        ...item,
        replies: embeddedReplies ?? [],
        reply_count,
        latest_reply,
    };
}
export function mergeRepliesIntoReport(report, replies) {
    return {
        ...report,
        replies,
        reply_count: replies.length,
        latest_reply: replies.length > 0 ? toReplySummary(replies[replies.length - 1]) : null,
    };
}
export function needsReplyLoad(report, canListReplies) {
    if (!canListReplies) {
        return false;
    }
    const count = typeof report.reply_count === "number" ? report.reply_count : (report.replies?.length ?? 0);
    if (count === 0) {
        return false;
    }
    return (report.replies?.length ?? 0) < count;
}
//# sourceMappingURL=reportSummary.js.map