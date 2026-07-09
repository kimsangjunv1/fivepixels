import { getActiveReportMessages } from "@/i18n/index.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ListRepliesParams,
    ReportFeedback,
    ReportFieldValues,
    ReportGitHubIntegrationState,
    ReportIntegrations,
    ReportProject,
    ReportReply,
    ReportReplyStatus,
    ReportStorageAdapter,
    ReportStatus,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import { DEFAULT_PROJECT_ID } from "@/constants/project.js";
import { getReportsStorageKey } from "@/constants/storageKeys.js";
import { parseFeedbackStorageEnvelope, serializeFeedbackStorageEnvelope } from "@/utils/feedbackTransferSchema.js";
import { paginateSortedReplies, sortRepliesChronologically } from "@/utils/replyHistory.js";
import {
    applyCaseStatusSync,
    normalizeFeedbackCases,
    normalizeReplyCaseIds,
} from "@/utils/reportCases.js";

export type LocalStorageReportAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};

function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `report-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isReportStatus(value: unknown): value is ReportStatus {
    return value === "open" || value === "git_issued" || value === "resolved" || value === "archived";
}

function normalizeFieldValues(value: unknown): ReportFieldValues {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return Object.entries(value).reduce<ReportFieldValues>((acc, [key, itemValue]) => {
        if (typeof itemValue === "string" || typeof itemValue === "boolean") {
            acc[key] = itemValue;
        }

        return acc;
    }, {});
}

function isReplyStatus(value: unknown): value is ReportReplyStatus {
    return (
        value === "suggested" ||
        value === "additional_question" ||
        value === "found_error" ||
        value === "recheck_requested" ||
        value === "resolved" ||
        value === "assignee_assigned" ||
        value === "assignee_transferred"
    );
}

function normalizeReplyStatus(value: unknown): ReportReplyStatus {
    if (isReplyStatus(value)) {
        return value;
    }

    return "suggested";
}

function normalizeReplies(value: unknown): ReportReply[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((item) => {
        if (!item || typeof item !== "object") {
            return [];
        }

        const reply = item as Partial<ReportReply>;

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

function normalizeGitHubIntegration(value: unknown): ReportGitHubIntegrationState | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }

    const github = value as Partial<ReportGitHubIntegrationState>;

    if (
        typeof github.issue_number !== "number" ||
        !Number.isFinite(github.issue_number) ||
        typeof github.issue_url !== "string" ||
        github.issue_url.trim().length === 0 ||
        typeof github.issued_at !== "string"
    ) {
        return undefined;
    }

    return {
        issue_number: github.issue_number,
        issue_url: github.issue_url,
        issued_at: github.issued_at,
    };
}

function normalizeIntegrations(value: unknown): ReportIntegrations | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }

    const integrations = value as ReportIntegrations;
    const github = normalizeGitHubIntegration(integrations.github);

    if (!github) {
        return undefined;
    }

    return { github };
}

function normalizeReport(item: ReportFeedback & { message?: string }): ReportFeedback {
    const cases = normalizeFeedbackCases(item);

    return applyCaseStatusSync({
        ...item,
        cases,
        status: isReportStatus(item.status) ? item.status : "open",
        field_values: normalizeFieldValues(item.field_values),
        replies: normalizeReplies(item.replies),
        integrations: normalizeIntegrations(item.integrations),
    });
}

export function readAllReportsFromStorage(storageKey: string) {
    if (typeof window === "undefined") {
        return [] as ReportFeedback[];
    }

    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
        return [] as ReportFeedback[];
    }

    try {
        const parsed = JSON.parse(raw) as unknown;

        if (Array.isArray(parsed)) {
            return parsed.map(normalizeReport);
        }

        const envelope = parseFeedbackStorageEnvelope(raw);

        if (envelope) {
            return envelope.items.map(normalizeReport);
        }

        return [];
    } catch {
        return [];
    }
}

export function writeAllReportsToStorage(storageKey: string, items: ReportFeedback[], project?: ReportProject) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(storageKey, serializeFeedbackStorageEnvelope(project ?? {}, items.map(normalizeReport)));
}

function readAll(storageKey: string) {
    return readAllReportsFromStorage(storageKey);
}

function writeAll(storageKey: string, items: ReportFeedback[], project: ReportProject) {
    writeAllReportsToStorage(storageKey, items, project);
}

export function createLocalStorageReportAdapter({ projectId, environment, appVersion }: LocalStorageReportAdapterOptions): ReportStorageAdapter {
    const storageKey = getReportsStorageKey(projectId, environment, appVersion);
    const project: ReportProject = {
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
        async listReplies(commentId, params?: ListRepliesParams) {
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
            const nextItem: ReportFeedback = {
                ...payload,
                id: createId(),
                created_at: new Date().toISOString(),
                replies: payload.replies ?? [],
            };
            const items = readAll(storageKey);

            const normalized = normalizeReport(nextItem);
            writeAll(storageKey, [normalized, ...items], project);
            return normalized;
        },
        async createReply(commentId, payload: CreateReplyPayload) {
            const items = readAll(storageKey);
            const index = items.findIndex((item) => item.id === commentId);

            if (index < 0) {
                throw new Error(getActiveReportMessages().errors.feedbackNotFound);
            }

            const reply: ReportReply = {
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
            writeAll(
                storageKey,
                readAll(storageKey).filter((item) => item.id !== id),
                project,
            );
        },
    };
}

/** @deprecated Use createLocalStorageReportAdapter({ projectId }) instead. */
export const localStorageReportAdapter = createLocalStorageReportAdapter({ projectId: DEFAULT_PROJECT_ID });
