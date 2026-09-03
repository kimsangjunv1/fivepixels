import type { ApiFlowEntry } from "@/shared/types/networkMonitor.js";
import type { NotificationItem } from "@/shared/types/notification.js";
import type { ReportCase, ReportFeedback, ReportReply } from "@/shared/types/report.js";
import { getReportCases } from "@/shared/utils/report/reportCases.js";
import { formatApiFlowSummaryLine } from "@/shared/utils/network/formatApiFlowEntry.js";
import type { ReportMessages } from "@/shared/i18n/types.js";

export type NotificationActor = {
    id: string | null;
    name: string | null;
};

export type FeedbackSnapshot = {
    report: ReportFeedback;
    replies: ReportReply[];
};

function mentionsActor(userMentions: { id: string; name: string }[] | undefined, actor: NotificationActor) {
    if (!userMentions || userMentions.length === 0) {
        return false;
    }

    return userMentions.some((mention) => {
        if (actor.id && mention.id === actor.id) {
            return true;
        }

        if (actor.name && mention.name.trim() === actor.name.trim()) {
            return true;
        }

        return false;
    });
}

function isAssignedTo(caseItem: ReportCase, actor: NotificationActor) {
    const assignee = caseItem.assignee_name?.trim();

    if (!assignee || !actor.name) {
        return false;
    }

    return assignee === actor.name.trim();
}

function createNotificationId(parts: Array<string | null | undefined>) {
    return parts.filter(Boolean).join(":");
}

function pushUnique(items: NotificationItem[], next: NotificationItem, seen: Set<string>) {
    if (seen.has(next.id)) {
        return;
    }

    seen.add(next.id);
    items.push(next);
}

export function diffNotifications(args: {
    previous: Map<string, FeedbackSnapshot>;
    current: FeedbackSnapshot[];
    actor: NotificationActor;
    messages: ReportMessages;
    apiFailure?: ApiFlowEntry | null;
    previousApiFailureId?: string | null;
}): NotificationItem[] {
    const { previous, current, actor, messages, apiFailure, previousApiFailureId } = args;
    const nextItems: NotificationItem[] = [];
    const seen = new Set<string>();
    const currentById = new Map(current.map((item) => [item.report.id, item]));

    if (!actor.id && !actor.name) {
        return nextItems;
    }

    for (const [reportId, prev] of previous) {
        if (currentById.has(reportId)) {
            continue;
        }

        const assignedCases = getReportCases(prev.report).filter((item) => isAssignedTo(item, actor));

        if (assignedCases.length === 0) {
            continue;
        }

        pushUnique(
            nextItems,
            {
                id: createNotificationId(["feedback_deleted", reportId, prev.report.created_at]),
                type: "feedback_deleted",
                title: messages.notifications.feedbackDeletedTitle,
                body: messages.notifications.feedbackDeletedBody(String(prev.report.fc_number ?? reportId)),
                createdAt: new Date().toISOString(),
                read: false,
                payload: { reportId, pathname: prev.report.pathname },
            },
            seen,
        );
    }

    for (const entry of current) {
        const prev = previous.get(entry.report.id);
        const cases = getReportCases(entry.report);
        const prevCases = prev ? getReportCases(prev.report) : [];
        const prevCaseById = new Map(prevCases.map((item) => [item.id, item]));

        for (const caseItem of cases) {
            const prevCase = prevCaseById.get(caseItem.id);
            const assignedNow = isAssignedTo(caseItem, actor);
            const assignedBefore = prevCase ? isAssignedTo(prevCase, actor) : false;

            if (assignedNow && !assignedBefore) {
                pushUnique(
                    nextItems,
                    {
                        id: createNotificationId(["case_assigned", entry.report.id, caseItem.id, caseItem.updated_at]),
                        type: "case_assigned",
                        title: messages.notifications.caseAssignedTitle,
                        body: messages.notifications.caseAssignedBody(String(entry.report.fc_number ?? entry.report.id)),
                        createdAt: caseItem.updated_at,
                        read: false,
                        payload: { reportId: entry.report.id, caseId: caseItem.id, pathname: entry.report.pathname },
                    },
                    seen,
                );
            }

            if (assignedNow && prevCase?.status !== "resolved" && caseItem.status === "resolved") {
                pushUnique(
                    nextItems,
                    {
                        id: createNotificationId(["case_resolved", entry.report.id, caseItem.id, caseItem.updated_at]),
                        type: "case_resolved",
                        title: messages.notifications.caseResolvedTitle,
                        body: messages.notifications.caseResolvedBody(String(entry.report.fc_number ?? entry.report.id)),
                        createdAt: caseItem.updated_at,
                        read: false,
                        payload: { reportId: entry.report.id, caseId: caseItem.id, pathname: entry.report.pathname },
                    },
                    seen,
                );
            }

            if (
                mentionsActor(caseItem.user_mentions, actor) &&
                (!prevCase || prevCase.updated_at !== caseItem.updated_at || prevCase.text !== caseItem.text)
            ) {
                const authorIsSelf = Boolean(actor.name && entry.report.author_name?.trim() === actor.name.trim());

                if (!authorIsSelf) {
                    pushUnique(
                        nextItems,
                        {
                            id: createNotificationId(["user_mention", "case", entry.report.id, caseItem.id, caseItem.updated_at]),
                            type: "user_mention",
                            title: messages.notifications.userMentionTitle,
                            body: messages.notifications.userMentionBody(String(entry.report.fc_number ?? entry.report.id)),
                            createdAt: caseItem.updated_at,
                            read: false,
                            payload: { reportId: entry.report.id, caseId: caseItem.id, pathname: entry.report.pathname },
                        },
                        seen,
                    );
                }
            }
        }

        for (const prevCase of prevCases) {
            if (cases.some((item) => item.id === prevCase.id)) {
                continue;
            }

            if (!isAssignedTo(prevCase, actor)) {
                continue;
            }

            pushUnique(
                nextItems,
                {
                    id: createNotificationId(["case_deleted", entry.report.id, prevCase.id, prevCase.updated_at]),
                    type: "case_deleted",
                    title: messages.notifications.caseDeletedTitle,
                    body: messages.notifications.caseDeletedBody(String(entry.report.fc_number ?? entry.report.id)),
                    createdAt: new Date().toISOString(),
                    read: false,
                    payload: { reportId: entry.report.id, caseId: prevCase.id, pathname: entry.report.pathname },
                },
                seen,
            );
        }

        const hadAssignedOpen = prevCases.some((item) => isAssignedTo(item, actor));
        const stillAssigned = cases.some((item) => isAssignedTo(item, actor));

        if (
            hadAssignedOpen &&
            stillAssigned &&
            prev?.report.status !== "resolved" &&
            entry.report.status === "resolved"
        ) {
            pushUnique(
                nextItems,
                {
                    id: createNotificationId(["feedback_resolved", entry.report.id, entry.report.created_at, entry.report.status]),
                    type: "feedback_resolved",
                    title: messages.notifications.feedbackResolvedTitle,
                    body: messages.notifications.feedbackResolvedBody(String(entry.report.fc_number ?? entry.report.id)),
                    createdAt: entry.report.latest_reply?.created_at ?? entry.report.created_at,
                    read: false,
                    payload: { reportId: entry.report.id, pathname: entry.report.pathname },
                },
                seen,
            );
        }

        const prevReplyIds = new Set((prev?.replies ?? []).map((item) => item.id));

        for (const reply of entry.replies) {
            if (prevReplyIds.has(reply.id)) {
                continue;
            }

            if (!mentionsActor(reply.user_mentions, actor)) {
                continue;
            }

            if (actor.name && reply.author_name?.trim() === actor.name.trim()) {
                continue;
            }

            pushUnique(
                nextItems,
                {
                    id: createNotificationId(["user_mention", "reply", entry.report.id, reply.id]),
                    type: "user_mention",
                    title: messages.notifications.userMentionTitle,
                    body: messages.notifications.userMentionBody(String(entry.report.fc_number ?? entry.report.id)),
                    createdAt: reply.created_at,
                    read: false,
                    payload: {
                        reportId: entry.report.id,
                        caseId: reply.case_ids[0],
                        replyId: reply.id,
                        pathname: entry.report.pathname,
                    },
                },
                seen,
            );
        }
    }

    if (apiFailure && apiFailure.id !== previousApiFailureId) {
        pushUnique(
            nextItems,
            {
                id: createNotificationId(["api_error", apiFailure.id]),
                type: "api_error",
                title: messages.notifications.apiErrorTitle,
                body: formatApiFlowSummaryLine(apiFailure, messages),
                createdAt: new Date(apiFailure.timestamp).toISOString(),
                read: false,
                payload: { apiFlowEntryId: apiFailure.id },
            },
            seen,
        );
    }

    return nextItems;
}
