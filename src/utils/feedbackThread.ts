import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import type { ReportAuthor, ReportFeedback, ReportReply, ReportReplyStatus } from "@/types/report.js";
import { getCaseAssigneeName, getCaseById, getRepliesForCase } from "@/utils/reportCases.js";
import { summaryToReply } from "@/utils/reportSummary.js";

export function getReportReplies(report: ReportFeedback): ReportReply[] {
    return report.replies ?? [];
}

export function getReplyCount(report: ReportFeedback): number {
    if (typeof report.reply_count === "number") {
        return report.reply_count;
    }

    return report.replies?.length ?? 0;
}

export function getLatestReply(report: ReportFeedback): ReportReply | null {
    const replies = getReportReplies(report);

    if (replies.length > 0) {
        return replies[replies.length - 1] ?? null;
    }

    if (report.latest_reply) {
        return summaryToReply(report.latest_reply, report.id);
    }

    return null;
}

export function getRemainingReplyCount(report: ReportFeedback) {
    return Math.max(0, getReplyCount(report) - 1);
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

export function getCaseLatestStatus(report: ReportFeedback, caseId: string): FeedbackDisplayStatus {
    const caseItem = getCaseById(report, caseId);

    if (caseItem?.status === "resolved") {
        return "resolved";
    }

    const replies = getRepliesForCase(report, caseId);
    const latest = replies[replies.length - 1] ?? null;

    if (!latest) {
        return "issue_apply";
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

export function isAssigneeEventStatus(status: ReportReplyStatus): boolean {
    return status === "assignee_assigned" || status === "assignee_transferred";
}

export function isBranchRootStatus(status: ReportReplyStatus): boolean {
    return status === "suggested" || status === "found_error" || status === "recheck_requested";
}

export function getLatestBranchRoot(replies: ReportReply[]): ReportReply | null {
    for (let index = replies.length - 1; index >= 0; index -= 1) {
        const reply = replies[index];

        if (isBranchRootStatus(reply.status)) {
            return reply;
        }
    }

    return null;
}

export function isActiveBranchRoot(report: ReportFeedback, reply: ReportReply): boolean {
    if (report.status !== "open") {
        return false;
    }

    const latestRoot = getLatestBranchRoot(getReportReplies(report));
    return latestRoot?.id === reply.id;
}

export function isBranchReplyAuthor(reply: ReportReply, actorName: string): boolean {
    const actor = actorName.trim();
    const author = reply.author_name?.trim() ?? "";

    return Boolean(actor && author && actor === author);
}

export function canShowAdjudicationActionsOnBranchReply(reply: ReportReply, actorName: string): boolean {
    return !isBranchReplyAuthor(reply, actorName);
}

export function canShowSuggestedBranchActions(report: ReportFeedback, reply: ReportReply): boolean {
    return reply.status === "suggested" && isActiveBranchRoot(report, reply);
}

export function canShowCheckoutBranchActions(report: ReportFeedback, reply: ReportReply): boolean {
    return (reply.status === "found_error" || reply.status === "recheck_requested") && isActiveBranchRoot(report, reply);
}

export function canReviewLatestSuggestion(report: ReportFeedback): boolean {
    if (report.status !== "open") {
        return false;
    }

    const latestRoot = getLatestBranchRoot(getReportReplies(report));
    return latestRoot?.status === "suggested";
}

export function canAskQuestionOnLatest(report: ReportFeedback): boolean {
    return canReviewLatestSuggestion(report) || canManagerAskQuestionOnLatest(report);
}

export function canManagerAskQuestionOnLatest(report: ReportFeedback): boolean {
    if (report.status !== "open") {
        return false;
    }

    const latestRoot = getLatestBranchRoot(getReportReplies(report));
    return latestRoot?.status === "found_error" || latestRoot?.status === "recheck_requested";
}

export function canCheckoutReply(report: ReportFeedback, reply: ReportReply): boolean {
    return canShowCheckoutBranchActions(report, reply);
}

export function canShowIssueEntryActions(report: ReportFeedback): boolean {
    if (report.status !== "open") {
        return false;
    }

    return getLatestBranchRoot(getReportReplies(report)) === null;
}

export function resolveOriginalFeedbackAuthorName(report: ReportFeedback) {
    return report.author_name?.trim() ?? "";
}

export function buildConfirmAuthorOptions(report: ReportFeedback, authors: ReportAuthor[]): ReportAuthor[] {
    const byName = new Map<string, ReportAuthor>();

    for (const author of authors) {
        byName.set(author.name, author);
    }

    const originalName = resolveOriginalFeedbackAuthorName(report);

    if (originalName && !byName.has(originalName)) {
        byName.set(originalName, { id: "__original_feedback_author__", name: originalName });
    }

    return Array.from(byName.values());
}

export function createReplyStatusForSubmit(
    pending: "deny" | "recheck" | "checkout" | "question" | null,
    asQuestion = false,
): ReportReplyStatus {
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

export function shouldShowReplyComposer(report: ReportFeedback, pendingComposer: { type: string } | null) {
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
    return (
        latest?.status === "additional_question" ||
        latest?.status === "found_error" ||
        latest?.status === "recheck_requested"
    );
}

export const ISSUE_ROOT_PARENT_ID = "__issue_root__";

export type FeedbackReplyBranch = {
    root: ReportReply;
    children: ReportReply[];
};

export type FeedbackThreadTimeline = {
    issueChildren: ReportReply[];
    branches: FeedbackReplyBranch[];
};

export function inferParentReplyId(replies: ReportReply[], replyIndex: number): string | null {
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

export function normalizeReplyParents(replies: ReportReply[]): ReportReply[] {
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

export function buildThreadTimeline(report: ReportFeedback): FeedbackThreadTimeline {
    const normalized = normalizeReplyParents(getReportReplies(report));
    const issueChildren: ReportReply[] = [];
    const branchMap = new Map<string, FeedbackReplyBranch>();
    const branches: FeedbackReplyBranch[] = [];

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

export function buildCaseThreadTimeline(report: ReportFeedback, caseId: string): FeedbackThreadTimeline {
    return buildThreadTimeline({
        ...report,
        replies: getRepliesForCase(report, caseId),
    });
}

export function getLatestBranchRootForCase(report: ReportFeedback, caseId: string): ReportReply | null {
    return getLatestBranchRoot(getRepliesForCase(report, caseId));
}

export function isActiveCaseBranchRoot(report: ReportFeedback, reply: ReportReply, caseId: string): boolean {
    const caseItem = report.cases?.find((item) => item.id === caseId);

    if (report.status !== "open" || !caseItem || caseItem.status === "resolved") {
        return false;
    }

    const latestRoot = getLatestBranchRootForCase(report, caseId);

    return latestRoot?.id === reply.id;
}

export function canShowSuggestedBranchActionsForCase(report: ReportFeedback, reply: ReportReply, caseId: string): boolean {
    return reply.status === "suggested" && isActiveCaseBranchRoot(report, reply, caseId);
}

export function canShowCheckoutBranchActionsForCase(report: ReportFeedback, reply: ReportReply, caseId: string): boolean {
    return (reply.status === "found_error" || reply.status === "recheck_requested") && isActiveCaseBranchRoot(report, reply, caseId);
}

export function getLatestAssigneeEventForCase(report: ReportFeedback, caseId: string): ReportReply | null {
    const replies = getRepliesForCase(report, caseId);

    for (let index = replies.length - 1; index >= 0; index -= 1) {
        const reply = replies[index];

        if (isAssigneeEventStatus(reply.status)) {
            return reply;
        }
    }

    return null;
}

export function isActiveAssigneeEvent(report: ReportFeedback, reply: ReportReply, caseId: string): boolean {
    if (getLatestAssigneeEventForCase(report, caseId)?.id !== reply.id) {
        return false;
    }

    return getLatestBranchRootForCase(report, caseId) === null;
}

export type AssigneeEntryActionRole = "assignee" | "takeover";

export function resolveAssigneeEntryActionRole(
    report: ReportFeedback,
    reply: ReportReply,
    caseId: string,
    actorName: string,
): AssigneeEntryActionRole | null {
    if (!isAssigneeEventStatus(reply.status) || !isActiveAssigneeEvent(report, reply, caseId)) {
        return null;
    }

    const actor = actorName.trim();

    if (!actor) {
        return null;
    }

    const authorName = resolveOriginalFeedbackAuthorName(report);

    if (authorName && actor === authorName) {
        return null;
    }

    const assigneeName = getCaseAssigneeName(report, caseId);

    if (!assigneeName) {
        return null;
    }

    if (actor === assigneeName) {
        return "assignee";
    }

    return "takeover";
}

export function canShowCaseClaimAction(report: ReportFeedback, caseId: string, actorName: string): boolean {
    if (!canShowCaseEntryActions(report, caseId)) {
        return false;
    }

    const actor = actorName.trim();

    if (!actor) {
        return false;
    }

    const authorName = resolveOriginalFeedbackAuthorName(report);

    if (authorName && actor === authorName) {
        return false;
    }

    return true;
}

export function canShowCaseEntryActions(report: ReportFeedback, caseId: string): boolean {
    if (report.status !== "open") {
        return false;
    }

    const caseItem = report.cases?.find((item) => item.id === caseId);

    if (!caseItem || caseItem.status === "resolved") {
        return false;
    }

    if (getCaseAssigneeName(report, caseId)) {
        return false;
    }

    return getLatestBranchRootForCase(report, caseId) === null;
}

export function shouldShowCaseReplyComposer(_report: ReportFeedback, caseId: string, pendingComposer: { type: string } | null) {
    if (!caseId || pendingComposer === null) {
        return false;
    }

    const caseItem = _report.cases?.find((item) => item.id === caseId);

    if (!caseItem || caseItem.status === "resolved" || _report.status === "resolved") {
        return false;
    }

    return true;
}

export function resolveParentReplyIdForCaseQuestion(
    report: ReportFeedback,
    caseId: string,
    pendingComposer: { type: string; targetReplyId: string } | null,
): string | null {
    return resolveParentReplyIdForQuestion(
        {
            ...report,
            replies: getRepliesForCase(report, caseId),
        },
        pendingComposer,
    );
}

/** @deprecated Use buildThreadTimeline instead. */
export function groupRepliesIntoBranches(replies: ReportReply[]): FeedbackReplyBranch[] {
    return buildThreadTimeline({ replies } as ReportFeedback).branches;
}

export function resolveParentReplyIdForQuestion(
    report: ReportFeedback,
    pendingComposer: { type: string; targetReplyId: string } | null,
): string | null {
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

export function shouldForceExpandQuestionGroup(
    report: ReportFeedback,
    caseId: string,
    questions: ReportReply[],
    options?: { composerTargetsGroup?: boolean },
): boolean {
    if (options?.composerTargetsGroup) {
        return true;
    }

    if (questions.length === 0) {
        return false;
    }

    const caseReplies = getRepliesForCase(report, caseId);
    const latestReply = caseReplies[caseReplies.length - 1];

    if (!latestReply || latestReply.status !== "additional_question") {
        return false;
    }

    return questions.some((question) => question.id === latestReply.id);
}
