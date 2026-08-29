import { createReportCase, normalizeReportCase } from "./reportCases.js";
import { normalizeReportPosition } from "./reportPosition.js";
import { normalizeListReport } from "./reportSummary.js";
const REPORT_STATUSES = new Set(["open", "git_issued", "resolved", "archived"]);
const CASE_STATUSES = new Set(["open", "resolved"]);
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function normalizeReportStatus(value) {
    if (typeof value !== "string") {
        return "open";
    }
    const normalized = value.trim().toLowerCase();
    return REPORT_STATUSES.has(normalized) ? normalized : "open";
}
function normalizeCaseStatus(value) {
    if (typeof value !== "string") {
        return "open";
    }
    const normalized = value.trim().toLowerCase();
    return CASE_STATUSES.has(normalized) ? normalized : "open";
}
function normalizeFieldValues(value) {
    if (!isRecord(value)) {
        return {};
    }
    const next = {};
    for (const [key, fieldValue] of Object.entries(value)) {
        if (typeof fieldValue === "string" || typeof fieldValue === "boolean") {
            next[key] = fieldValue;
        }
    }
    return next;
}
/**
 * Marker list payloads may ship stub cases (`{ status, version }`) without id/text.
 * Fill the minimum fields so marker UI can render without crashing.
 */
export function normalizeMarkersListCases(value, fallbackTimestamp) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.flatMap((item) => {
        const full = normalizeReportCase(item, fallbackTimestamp);
        if (full) {
            return [full];
        }
        if (!isRecord(item)) {
            return [];
        }
        return [
            createReportCase("", {
                id: typeof item.id === "string" && item.id.trim() ? item.id : undefined,
                status: normalizeCaseStatus(item.status),
                created_at: fallbackTimestamp,
                updated_at: fallbackTimestamp,
            }),
        ];
    });
}
/**
 * Normalize backend markers.list snake_case (possibly abbreviated) payloads into `ReportFeedback`.
 */
export function normalizeMarkersListItem(value, options = {}) {
    if (!isRecord(value)) {
        return null;
    }
    if (typeof value.id !== "string" || !value.id.trim()) {
        return null;
    }
    const reportId = typeof value.report_id === "string" ? value.report_id.trim() : "";
    const targetSelector = typeof value.target_selector === "string" && value.target_selector.trim() ? value.target_selector.trim() : undefined;
    if (!reportId && !targetSelector) {
        return null;
    }
    const createdAt = typeof value.created_at === "string" && value.created_at.trim() ? value.created_at : new Date(0).toISOString();
    const pathname = typeof value.pathname === "string" && value.pathname.trim()
        ? value.pathname
        : typeof options.pathname === "string" && options.pathname.trim()
            ? options.pathname
            : "/";
    const reportType = value.report_type === "group" ? "group" : "item";
    return normalizeListReport({
        id: value.id,
        pathname,
        report_id: reportId || value.id,
        report_type: reportType,
        ...(targetSelector ? { target_selector: targetSelector } : {}),
        status: normalizeReportStatus(value.status),
        field_values: normalizeFieldValues(value.field_values),
        cases: normalizeMarkersListCases(value.cases, createdAt),
        position: normalizeReportPosition(value.position),
        created_at: createdAt,
        replies: Array.isArray(value.replies) ? value.replies : [],
        ...(typeof value.reply_count === "number" ? { reply_count: value.reply_count } : {}),
        ...(value.latest_reply ? { latest_reply: value.latest_reply } : {}),
        ...(typeof value.fc_number === "number" ? { fc_number: value.fc_number } : {}),
        ...(typeof value.environment === "string" ? { environment: value.environment } : {}),
        ...(typeof value.app_version === "string" ? { app_version: value.app_version } : {}),
        ...(typeof value.author_id === "string" ? { author_id: value.author_id } : {}),
        ...(typeof value.author_name === "string" ? { author_name: value.author_name } : {}),
    });
}
export function normalizeMarkersListItems(values, options = {}) {
    if (!Array.isArray(values)) {
        return [];
    }
    return values.flatMap((item) => {
        const normalized = normalizeMarkersListItem(item, options);
        return normalized ? [normalized] : [];
    });
}
//# sourceMappingURL=normalizeMarkersListItem.js.map