import { getActiveReportMessages } from "../../i18n/index.js";
import { DEFAULT_PROJECT_ID } from "../../constants/project.js";
import { getReportsStorageKey } from "../../constants/storageKeys.js";
import { parseFeedbackStorageEnvelope, serializeFeedbackStorageEnvelope } from "../../utils/feedbackTransferSchema.js";
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
    return value === "suggested" || value === "found_error" || value === "recheck_requested" || value === "resolved";
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
                author_type: reply.author_type,
                author_name: reply.author_name ?? null,
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
    return {
        ...item,
        status: isReportStatus(item.status) ? item.status : "open",
        field_values: normalizeFieldValues(item.field_values),
        replies: normalizeReplies(item.replies),
        integrations: normalizeIntegrations(item.integrations),
    };
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
        if (Array.isArray(parsed)) {
            return parsed.map(normalizeReport);
        }
        const envelope = parseFeedbackStorageEnvelope(raw);
        if (envelope) {
            return envelope.items.map(normalizeReport);
        }
        return [];
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
        async create(payload) {
            const nextItem = {
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
/** @deprecated Use createLocalStorageReportAdapter({ projectId }) instead. */
export const localStorageReportAdapter = createLocalStorageReportAdapter({ projectId: DEFAULT_PROJECT_ID });
//# sourceMappingURL=localStorageAdapter.js.map