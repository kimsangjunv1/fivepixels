import { getActiveReportMessages } from "../../i18n/index.js";
import { isFeedbackCategory } from "../../constants/feedbackCategory.js";
import { getReportsStorageKey } from "../../constants/storageKeys.js";
import { parseFeedbackStorageEnvelope, serializeFeedbackStorageEnvelope } from "../../utils/feedback/feedbackTransferSchema.js";
import { allocateNextFcNumber, backfillFcNumbers } from "../../utils/feedback/feedbackCaseId.js";
import { paginateSortedReplies, sortRepliesChronologically } from "../../utils/feedback/replyHistory.js";
import { applyCaseStatusSync, normalizeFeedbackCases, normalizeReplyCaseIds, } from "../../utils/report/reportCases.js";
function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `report-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function isReportStatus(value) {
    return value === "open" || value === "git_issued" || value === "resolved" || value === "archived";
}
function normalizeFieldValues(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return Object.entries(value).reduce((acc, [key, itemValue]) => {
        if (typeof itemValue === "string" || typeof itemValue === "boolean") {
            acc[key] = itemValue;
        }
        return acc;
    }, {});
}
function isReplyStatus(value) {
    return (value === "suggested" ||
        value === "additional_question" ||
        value === "found_error" ||
        value === "recheck_requested" ||
        value === "resolved" ||
        value === "assignee_assigned" ||
        value === "assignee_transferred");
}
function normalizeReplyStatus(value) {
    if (isReplyStatus(value)) {
        return value;
    }
    return "suggested";
}
function normalizeReplies(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.flatMap((item) => {
        if (!item || typeof item !== "object") {
            return [];
        }
        const reply = item;
        if (typeof reply.id !== "string" || typeof reply.message !== "string" || typeof reply.created_at !== "string") {
            return [];
        }
        return [
            {
                id: reply.id,
                message: reply.message,
                created_at: reply.created_at,
                status: normalizeReplyStatus(reply.status),
                case_ids: normalizeReplyCaseIds(reply.case_ids),
                parent_reply_id: typeof reply.parent_reply_id === "string" ? reply.parent_reply_id : null,
                author_type: reply.author_type,
                author_name: reply.author_name ?? null,
                auth: reply.auth,
            },
        ];
    });
}
function normalizeGitHubIntegration(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }
    const github = value;
    if (typeof github.issue_number !== "number" ||
        !Number.isFinite(github.issue_number) ||
        typeof github.issue_url !== "string" ||
        github.issue_url.trim().length === 0 ||
        typeof github.issued_at !== "string") {
        return undefined;
    }
    return {
        issue_number: github.issue_number,
        issue_url: github.issue_url,
        issued_at: github.issued_at,
    };
}
function normalizeIntegrations(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }
    const integrations = value;
    const github = normalizeGitHubIntegration(integrations.github);
    if (!github) {
        return undefined;
    }
    return { github };
}
function normalizeReport(item) {
    const cases = normalizeFeedbackCases(item);
    const fcNumber = typeof item.fc_number === "number" && Number.isFinite(item.fc_number) && item.fc_number > 0 ? Math.trunc(item.fc_number) : undefined;
    const category = isFeedbackCategory(item.category) ? item.category : null;
    return applyCaseStatusSync({
        ...item,
        cases,
        status: isReportStatus(item.status) ? item.status : "open",
        ...(fcNumber !== undefined ? { fc_number: fcNumber } : {}),
        category,
        field_values: normalizeFieldValues(item.field_values),
        replies: normalizeReplies(item.replies),
        integrations: normalizeIntegrations(item.integrations),
    });
}
export function readAllReportsFromStorage(storageKey) {
    if (typeof window === "undefined") {
        return [];
    }
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        let items = [];
        let project;
        if (Array.isArray(parsed)) {
            items = parsed.map(normalizeReport);
        }
        else {
            const envelope = parseFeedbackStorageEnvelope(raw);
            if (envelope) {
                items = envelope.items.map(normalizeReport);
                project = envelope.project;
            }
        }
        const backfilled = backfillFcNumbers(items);
        const needsPersist = backfilled.some((item, index) => item.fc_number !== items[index]?.fc_number);
        if (needsPersist) {
            writeAllReportsToStorage(storageKey, backfilled, project);
        }
        return backfilled;
    }
    catch {
        return [];
    }
}
export function writeAllReportsToStorage(storageKey, items, project) {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.setItem(storageKey, serializeFeedbackStorageEnvelope(project ?? {}, items.map(normalizeReport)));
}
function readAll(storageKey) {
    return readAllReportsFromStorage(storageKey);
}
function writeAll(storageKey, items, project) {
    writeAllReportsToStorage(storageKey, items, project);
}
export function createLocalStorageReportAdapter({ projectId, environment, appVersion }) {
    const storageKey = getReportsStorageKey(projectId, environment, appVersion);
    const project = {
        id: projectId,
        env: environment,
        version: appVersion,
    };
    return {
        async list({ pathname }) {
            return readAll(storageKey)
                .filter((item) => item.pathname === pathname)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        },
        async listAll({ cursor, limit }) {
            const offset = Math.max(0, Number.parseInt(cursor ?? "0", 10) || 0);
            const items = readAll(storageKey).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const nextOffset = offset + limit;
            return {
                items: items.slice(offset, nextOffset),
                nextCursor: nextOffset < items.length ? String(nextOffset) : undefined,
            };
        },
        async listReplies(commentId, params) {
            const item = readAll(storageKey).find((entry) => entry.id === commentId);
            if (!item) {
                throw new Error(getActiveReportMessages().errors.feedbackNotFound);
            }
            const sorted = sortRepliesChronologically(normalizeReplies(item.replies));
            if (!params) {
                return sorted;
            }
            return paginateSortedReplies(sorted, params);
        },
        async create(payload) {
            const items = readAll(storageKey);
            const fcNumber = typeof payload.fc_number === "number" && payload.fc_number > 0 ? Math.trunc(payload.fc_number) : allocateNextFcNumber(items);
            const nextItem = {
                ...payload,
                id: createId(),
                fc_number: fcNumber,
                category: isFeedbackCategory(payload.category) ? payload.category : null,
                created_at: new Date().toISOString(),
                replies: payload.replies ?? [],
            };
            const normalized = normalizeReport(nextItem);
            writeAll(storageKey, [normalized, ...items], project);
            return normalized;
        },
        async createReply(commentId, payload) {
            const items = readAll(storageKey);
            const index = items.findIndex((item) => item.id === commentId);
            if (index < 0) {
                throw new Error(getActiveReportMessages().errors.feedbackNotFound);
            }
            const reply = {
                id: createId(),
                comment_id: commentId,
                message: payload.message,
                created_at: new Date().toISOString(),
                status: normalizeReplyStatus(payload.status),
                case_ids: normalizeReplyCaseIds(payload.case_ids),
                parent_reply_id: typeof payload.parent_reply_id === "string" ? payload.parent_reply_id : null,
                author_type: payload.author_type,
                author_name: payload.author_name ?? null,
                auth: payload.auth,
            };
            const currentReplies = normalizeReplies(items[index].replies);
            const nextItem = normalizeReport({
                ...items[index],
                replies: [...currentReplies, reply],
            });
            items[index] = nextItem;
            writeAll(storageKey, items, project);
            return reply;
        },
        async update(id, payload) {
            const items = readAll(storageKey);
            const index = items.findIndex((item) => item.id === id);
            if (index < 0) {
                throw new Error(getActiveReportMessages().errors.feedbackNotFound);
            }
            const nextItem = normalizeReport({
                ...items[index],
                ...payload,
            });
            items[index] = nextItem;
            writeAll(storageKey, items, project);
            return nextItem;
        },
        async remove(id) {
            writeAll(storageKey, readAll(storageKey).filter((item) => item.id !== id), project);
        },
    };
}
//# sourceMappingURL=localStorageAdapter.js.map