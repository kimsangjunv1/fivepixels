import { REPORTS_STORAGE_KEY } from "../../constants/storageKeys.js";
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
function readAll() {
    if (typeof window === "undefined") {
        return [];
    }
    const raw = window.localStorage.getItem(REPORTS_STORAGE_KEY);
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
function writeAll(items) {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(items.map(normalizeReport)));
}
export function createLocalStorageReportAdapter() {
    return {
        async list({ pathname }) {
            return readAll()
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
            const items = readAll();
            const normalized = normalizeReport(nextItem);
            writeAll([normalized, ...items]);
            return normalized;
        },
        async update(id, payload) {
            const items = readAll();
            const index = items.findIndex((item) => item.id === id);
            if (index < 0) {
                throw new Error("피드백을 찾을 수 없어요.");
            }
            const nextItem = normalizeReport({
                ...items[index],
                ...payload,
            });
            items[index] = nextItem;
            writeAll(items);
            return nextItem;
        },
        async remove(id) {
            writeAll(readAll().filter((item) => item.id !== id));
        },
    };
}
export const localStorageReportAdapter = createLocalStorageReportAdapter();
//# sourceMappingURL=localStorageAdapter.js.map