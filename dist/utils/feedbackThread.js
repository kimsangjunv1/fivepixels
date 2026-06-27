import { getRepliesForCase } from "../utils/reportCases.js";
import { summaryToReply } from "../utils/reportSummary.js";
export function getReportReplies(report) {
    return report.replies ?? [];
}
export function getReplyCount(report) {
    if (typeof report.reply_count === "number") {
        return report.reply_count;
    }
    return report.replies?.length ?? 0;
}
export function getLatestReply(report) {
    const replies = getReportReplies(report);
    if (replies.length > 0) {
        return replies[replies.length - 1] ?? null;
    }
    if (report.latest_reply) {
        return summaryToReply(report.latest_reply, report.id);
    }
    return null;
}
export function getRemainingReplyCount(report) {
    return Math.max(0, getReplyCount(report) - 1);
}
export function getFeedbackDisplayStatus(report, expanded = false) {
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
export function getCheckboxFieldsFromValues(fieldValues, labels) {
    return Object.entries(fieldValues).flatMap(([key, value]) => {
        if (key === "message" || value !== true) {
            return [];
        }
        return [{ key, label: labels.get(key) ?? key }];
    });
}
export function isBranchRootStatus(status) {
    return status === "suggested" || status === "found_error" || status === "recheck_requested";
}
export function getLatestBranchRoot(replies) {
    for (let index = replies.length - 1; index >= 0; index -= 1) {
        const reply = replies[index];
        if (isBranchRootStatus(reply.status)) {
            return reply;
        }
    }
    return null;
}
export function isActiveBranchRoot(report, reply) {
    if (report.status !== "open") {
        return false;
    }
    const latestRoot = getLatestBranchRoot(getReportReplies(report));
    return latestRoot?.id === reply.id;
}
export function canShowSuggestedBranchActions(report, reply) {
    return reply.status === "suggested" && isActiveBranchRoot(report, reply);
}
export function canShowCheckoutBranchActions(report, reply) {
    return (reply.status === "found_error" || reply.status === "recheck_requested") && isActiveBranchRoot(report, reply);
}
export function canReviewLatestSuggestion(report) {
    if (report.status !== "open") {
        return false;
    }
    const latestRoot = getLatestBranchRoot(getReportReplies(report));
    return latestRoot?.status === "suggested";
}
export function canAskQuestionOnLatest(report) {
    return canReviewLatestSuggestion(report) || canManagerAskQuestionOnLatest(report);
}
export function canManagerAskQuestionOnLatest(report) {
    if (report.status !== "open") {
        return false;
    }
    const latestRoot = getLatestBranchRoot(getReportReplies(report));
    return latestRoot?.status === "found_error" || latestRoot?.status === "recheck_requested";
}
export function canCheckoutReply(report, reply) {
    return canShowCheckoutBranchActions(report, reply);
}
export function canShowIssueEntryActions(report) {
    if (report.status !== "open") {
        return false;
    }
    return getLatestBranchRoot(getReportReplies(report)) === null;
}
export function resolveOriginalFeedbackAuthorName(report) {
    return report.author_name?.trim() ?? "";
}
export function buildConfirmAuthorOptions(report, authors) {
    const byName = new Map();
    for (const author of authors) {
        byName.set(author.name, author);
    }
    const originalName = resolveOriginalFeedbackAuthorName(report);
    if (originalName && !byName.has(originalName)) {
        byName.set(originalName, { id: "__original_feedback_author__", name: originalName });
    }
    return Array.from(byName.values());
}
export function createReplyStatusForSubmit(pending, asQuestion = false) {
    if (pending === "recheck") {
        return "recheck_requested";
    }
    if (pending === "deny") {
        return "found_error";
    }
    if (pending === "question" || asQuestion) {
        return "additional_question";
    }
    return "suggested";
}
export function shouldShowReplyComposer(report, pendingComposer) {
    if (report.status === "resolved") {
        return false;
    }
    if (getReplyCount(report) === 0) {
        return pendingComposer !== null;
    }
    if (pendingComposer !== null) {
        return true;
    }
    const latest = getLatestReply(report);
    return (latest?.status === "additional_question" ||
        latest?.status === "found_error" ||
        latest?.status === "recheck_requested");
}
export const ISSUE_ROOT_PARENT_ID = "__issue_root__";
export function inferParentReplyId(replies, replyIndex) {
    const reply = replies[replyIndex];
    if (reply.status !== "additional_question") {
        return null;
    }
    for (let index = replyIndex - 1; index >= 0; index -= 1) {
        const candidate = replies[index];
        if (isBranchRootStatus(candidate.status)) {
            return candidate.id;
        }
    }
    return ISSUE_ROOT_PARENT_ID;
}
export function normalizeReplyParents(replies) {
    return replies.map((reply, index) => {
        if (reply.status !== "additional_question") {
            return reply;
        }
        const parentReplyId = reply.parent_reply_id ?? inferParentReplyId(replies, index);
        if (!parentReplyId || parentReplyId === reply.parent_reply_id) {
            return parentReplyId ? { ...reply, parent_reply_id: parentReplyId } : reply;
        }
        return { ...reply, parent_reply_id: parentReplyId };
    });
}
export function buildThreadTimeline(report) {
    const normalized = normalizeReplyParents(getReportReplies(report));
    const issueChildren = [];
    const branchMap = new Map();
    const branches = [];
    for (const reply of normalized) {
        if (reply.status === "additional_question") {
            const parentId = reply.parent_reply_id;
            const branch = parentId && parentId !== ISSUE_ROOT_PARENT_ID ? branchMap.get(parentId) : undefined;
            if (parentId === ISSUE_ROOT_PARENT_ID || !branch) {
                issueChildren.push(reply);
                continue;
            }
            branch.children.push(reply);
            continue;
        }
        const branch = { root: reply, children: [] };
        branches.push(branch);
        branchMap.set(reply.id, branch);
    }
    return { issueChildren, branches };
}
export function buildCaseThreadTimeline(report, caseId) {
    return buildThreadTimeline({
        ...report,
        replies: getRepliesForCase(report, caseId),
    });
}
export function getLatestBranchRootForCase(report, caseId) {
    return getLatestBranchRoot(getRepliesForCase(report, caseId));
}
export function isActiveCaseBranchRoot(report, reply, caseId) {
    if (report.status !== "open") {
        return false;
    }
    const latestRoot = getLatestBranchRootForCase(report, caseId);
    return latestRoot?.id === reply.id;
}
export function canShowSuggestedBranchActionsForCase(report, reply, caseId) {
    return reply.status === "suggested" && isActiveCaseBranchRoot(report, reply, caseId);
}
export function canShowCheckoutBranchActionsForCase(report, reply, caseId) {
    return (reply.status === "found_error" || reply.status === "recheck_requested") && isActiveCaseBranchRoot(report, reply, caseId);
}
export function canShowCaseEntryActions(report, caseId) {
    if (report.status !== "open") {
        return false;
    }
    const caseItem = report.cases?.find((item) => item.id === caseId);
    if (!caseItem || caseItem.status === "resolved") {
        return false;
    }
    return getLatestBranchRootForCase(report, caseId) === null;
}
export function shouldShowCaseReplyComposer(report, caseId, pendingComposer) {
    const caseItem = report.cases?.find((item) => item.id === caseId);
    if (!caseItem || caseItem.status === "resolved" || report.status === "resolved") {
        return false;
    }
    return shouldShowReplyComposer({
        ...report,
        replies: getRepliesForCase(report, caseId),
    }, pendingComposer);
}
export function resolveParentReplyIdForCaseQuestion(report, caseId, pendingComposer) {
    return resolveParentReplyIdForQuestion({
        ...report,
        replies: getRepliesForCase(report, caseId),
    }, pendingComposer);
}
/** @deprecated Use buildThreadTimeline instead. */
export function groupRepliesIntoBranches(replies) {
    return buildThreadTimeline({ replies }).branches;
}
export function resolveParentReplyIdForQuestion(report, pendingComposer) {
    if (pendingComposer?.type === "question") {
        if (pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID) {
            return ISSUE_ROOT_PARENT_ID;
        }
        const target = getReportReplies(report).find((reply) => reply.id === pendingComposer.targetReplyId);
        if (target && isBranchRootStatus(target.status)) {
            return target.id;
        }
        if (target?.parent_reply_id) {
            return target.parent_reply_id;
        }
    }
    const latest = getLatestReply(report);
    if (!latest) {
        return ISSUE_ROOT_PARENT_ID;
    }
    if (latest.status === "additional_question" && latest.parent_reply_id) {
        return latest.parent_reply_id;
    }
    if (isBranchRootStatus(latest.status)) {
        return latest.id;
    }
    const replies = getReportReplies(report);
    for (let index = replies.length - 1; index >= 0; index -= 1) {
        const reply = replies[index];
        if (isBranchRootStatus(reply.status)) {
            return reply.id;
        }
    }
    return ISSUE_ROOT_PARENT_ID;
}
//# sourceMappingURL=feedbackThread.js.map