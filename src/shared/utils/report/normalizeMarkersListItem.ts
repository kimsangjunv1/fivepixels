import type { ReportCase, ReportCaseStatus, ReportFeedback, ReportFieldValues, ReportStatus, ReportTargetType } from "@/shared/types/report.js";
import { createReportCase, normalizeReportCase } from "./reportCases.js";
import { normalizeReportPosition } from "./reportPosition.js";
import { normalizeListReport } from "./reportSummary.js";

export type NormalizeMarkersListOptions = {
    pathname?: string;
};

const REPORT_STATUSES = new Set<ReportStatus>(["open", "git_issued", "resolved", "archived"]);
const CASE_STATUSES = new Set<ReportCaseStatus>(["open", "resolved"]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeReportStatus(value: unknown): ReportStatus {
    if (typeof value !== "string") {
        return "open";
    }

    const normalized = value.trim().toLowerCase() as ReportStatus;

    return REPORT_STATUSES.has(normalized) ? normalized : "open";
}

function normalizeCaseStatus(value: unknown): ReportCaseStatus {
    if (typeof value !== "string") {
        return "open";
    }

    const normalized = value.trim().toLowerCase() as ReportCaseStatus;

    return CASE_STATUSES.has(normalized) ? normalized : "open";
}

function normalizeFieldValues(value: unknown): ReportFieldValues {
    if (!isRecord(value)) {
        return {};
    }

    const next: ReportFieldValues = {};

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
export function normalizeMarkersListCases(value: unknown, fallbackTimestamp: string): ReportCase[] {
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
export function normalizeMarkersListItem(value: unknown, options: NormalizeMarkersListOptions = {}): ReportFeedback | null {
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

    const createdAt =
        typeof value.created_at === "string" && value.created_at.trim() ? value.created_at : new Date(0).toISOString();
    const pathname =
        typeof value.pathname === "string" && value.pathname.trim()
            ? value.pathname
            : typeof options.pathname === "string" && options.pathname.trim()
              ? options.pathname
              : "/";
    const reportType: ReportTargetType = value.report_type === "group" ? "group" : "item";

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
        replies: Array.isArray(value.replies) ? (value.replies as ReportFeedback["replies"]) : [],
        ...(typeof value.reply_count === "number" ? { reply_count: value.reply_count } : {}),
        ...(value.latest_reply ? { latest_reply: value.latest_reply as ReportFeedback["latest_reply"] } : {}),
        ...(typeof value.fc_number === "number" ? { fc_number: value.fc_number } : {}),
        ...(typeof value.environment === "string" ? { environment: value.environment } : {}),
        ...(typeof value.app_version === "string" ? { app_version: value.app_version } : {}),
        ...(typeof value.author_id === "string" ? { author_id: value.author_id } : {}),
        ...(typeof value.author_name === "string" ? { author_name: value.author_name } : {}),
    });
}

export function normalizeMarkersListItems(values: unknown, options: NormalizeMarkersListOptions = {}): ReportFeedback[] {
    if (!Array.isArray(values)) {
        return [];
    }

    return values.flatMap((item) => {
        const normalized = normalizeMarkersListItem(item, options);

        return normalized ? [normalized] : [];
    });
}
