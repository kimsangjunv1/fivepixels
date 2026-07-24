import type { ReportFeedback, ReportReply } from "@/types/report.js";
import { sortRepliesChronologically } from "@/utils/feedback/replyHistory.js";
import { mergeRepliesIntoReport } from "@/utils/report/reportSummary.js";

export type FeedbackMergeStats = {
    inserted: number;
    updated: number;
    kept: number;
    localRepliesPreserved: number;
};

export type FeedbackMergeResult = FeedbackMergeStats & {
    items: ReportFeedback[];
};

function pickNewerReply(existing: ReportReply, incoming: ReportReply): ReportReply {
    const existingTime = Date.parse(existing.created_at);
    const incomingTime = Date.parse(incoming.created_at);

    if (Number.isNaN(existingTime) && Number.isNaN(incomingTime)) {
        return incoming;
    }

    if (Number.isNaN(existingTime)) {
        return incoming;
    }

    if (Number.isNaN(incomingTime)) {
        return existing;
    }

    // Same timestamp: prefer incoming (exporter is source of truth for shared reply ids).
    return incomingTime >= existingTime ? incoming : existing;
}

export function mergeReplyCollections(existing: ReportReply[], incoming: ReportReply[]): {
    replies: ReportReply[];
    localOnlyPreserved: number;
} {
    const byId = new Map<string, ReportReply>();
    const existingIds = new Set(existing.map((reply) => reply.id));
    const incomingIds = new Set(incoming.map((reply) => reply.id));

    for (const reply of existing) {
        byId.set(reply.id, reply);
    }

    for (const reply of incoming) {
        const previous = byId.get(reply.id);

        if (!previous) {
            byId.set(reply.id, reply);
            continue;
        }

        byId.set(reply.id, pickNewerReply(previous, reply));
    }

    let localOnlyPreserved = 0;

    for (const id of existingIds) {
        if (!incomingIds.has(id)) {
            localOnlyPreserved += 1;
        }
    }

    return {
        replies: sortRepliesChronologically([...byId.values()]),
        localOnlyPreserved,
    };
}

export function mergeFeedbackItem(existing: ReportFeedback, incoming: ReportFeedback): {
    item: ReportFeedback;
    localRepliesPreserved: number;
} {
    const { replies, localOnlyPreserved } = mergeReplyCollections(existing.replies ?? [], incoming.replies ?? []);

    return {
        item: mergeRepliesIntoReport(
            {
                ...existing,
                ...incoming,
                id: existing.id,
                created_at: existing.created_at,
            },
            replies,
        ),
        localRepliesPreserved: localOnlyPreserved,
    };
}

/**
 * Merge localStorage feedback with an import payload.
 * - local-only ids are kept
 * - incoming-only ids are inserted
 * - matching ids take incoming content fields, and union replies by reply id
 */
export function mergeFeedbackCollections(existing: ReportFeedback[], incoming: ReportFeedback[]): FeedbackMergeResult {
    const existingById = new Map(existing.map((item) => [item.id, item]));
    const incomingById = new Map(incoming.map((item) => [item.id, item]));
    const merged: ReportFeedback[] = [];
    let inserted = 0;
    let updated = 0;
    let kept = 0;
    let localRepliesPreserved = 0;

    for (const item of existing) {
        const next = incomingById.get(item.id);

        if (!next) {
            merged.push(item);
            kept += 1;
            continue;
        }

        const result = mergeFeedbackItem(item, next);
        merged.push(result.item);
        updated += 1;
        localRepliesPreserved += result.localRepliesPreserved;
    }

    for (const item of incoming) {
        if (existingById.has(item.id)) {
            continue;
        }

        merged.push(
            mergeRepliesIntoReport(item, sortRepliesChronologically(item.replies ?? [])),
        );
        inserted += 1;
    }

    return {
        items: merged,
        inserted,
        updated,
        kept,
        localRepliesPreserved,
    };
}
