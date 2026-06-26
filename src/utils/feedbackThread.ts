import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import type { ReportAuthor, ReportFeedback, ReportReply, ReportReplyStatus } from "@/types/report.js";

export function getLatestReply(report: ReportFeedback): ReportReply | null {
    if (report.replies.length === 0) {
        return null;
    }

    return report.replies[report.replies.length - 1] ?? null;
}

export function getRemainingReplyCount(report: ReportFeedback) {
    return Math.max(0, report.replies.length - 1);
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

    const latestRoot = getLatestBranchRoot(report.replies);
    return latestRoot?.id === reply.id;
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

    const latestRoot = getLatestBranchRoot(report.replies);
    return latestRoot?.status === "suggested";
}

export function canAskQuestionOnLatest(report: ReportFeedback): boolean {
    return canReviewLatestSuggestion(report) || canManagerAskQuestionOnLatest(report);
}

export function canManagerAskQuestionOnLatest(report: ReportFeedback): boolean {
    if (report.status !== "open") {
        return false;
    }

    const latestRoot = getLatestBranchRoot(report.replies);
    return latestRoot?.status === "found_error" || latestRoot?.status === "recheck_requested";
}

export function canCheckoutReply(report: ReportFeedback, reply: ReportReply): boolean {
    return canShowCheckoutBranchActions(report, reply);
}

export function canShowIssueEntryActions(report: ReportFeedback): boolean {
    if (report.status !== "open") {
        return false;
    }

    return getLatestBranchRoot(report.replies) === null;
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

    if (report.replies.length === 0) {
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
    const normalized = normalizeReplyParents(report.replies);
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

        const target = report.replies.find((reply) => reply.id === pendingComposer.targetReplyId);

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

    for (let index = report.replies.length - 1; index >= 0; index -= 1) {
        const reply = report.replies[index];

        if (isBranchRootStatus(reply.status)) {
            return reply.id;
        }
    }

    return ISSUE_ROOT_PARENT_ID;
}
