import { DEFAULT_PROJECT_ID } from "../../constants/project.js";
import { getReportsStorageKey } from "../../constants/storageKeys.js";
function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `report-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function isReportStatus(value) {
    return value === "open" || value === "resolved" || value === "archived";
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
    return value === "suggested" || value === "found_error" || value === "verified";
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
function normalizeReport(item) {
    return {
        ...item,
        status: isReportStatus(item.status) ? item.status : "open",
        field_values: normalizeFieldValues(item.field_values),
        replies: normalizeReplies(item.replies),
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
        return Array.isArray(parsed) ? parsed.map(normalizeReport) : [];
    }
    catch {
        return [];
    }
}
export function writeAllReportsToStorage(storageKey, items) {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(items.map(normalizeReport)));
}
function readAll(storageKey) {
    return readAllReportsFromStorage(storageKey);
}
function writeAll(storageKey, items) {
    writeAllReportsToStorage(storageKey, items);
}
export function createLocalStorageReportAdapter({ projectId, environment, appVersion }) {
    const storageKey = getReportsStorageKey(projectId, environment, appVersion);
    return {
        async list({ pathname }) {
            return readAll(storageKey)
                .filter((item) => item.pathname === pathname)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
            writeAll(storageKey, [normalized, ...items]);
            return normalized;
        },
        async update(id, payload) {
            const items = readAll(storageKey);
            const index = items.findIndex((item) => item.id === id);
            if (index < 0) {
                throw new Error("피드백을 찾을 수 없어요.");
            }
            const nextItem = normalizeReport({
                ...items[index],
                ...payload,
            });
            items[index] = nextItem;
            writeAll(storageKey, items);
            return nextItem;
        },
        async remove(id) {
            writeAll(storageKey, readAll(storageKey).filter((item) => item.id !== id));
        },
    };
}
/** @deprecated Use createLocalStorageReportAdapter({ projectId }) instead. */
export const localStorageReportAdapter = createLocalStorageReportAdapter({ projectId: DEFAULT_PROJECT_ID });
//# sourceMappingURL=localStorageAdapter.js.map