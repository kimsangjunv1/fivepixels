import type { ReportFeedback, ReportFieldValues, ReportReply, ReportStatus, ReportTargetType } from "../types/report.js";

const STRING_FIELDS = ["id", "pathname", "report_id", "message", "created_at"] as const;
const NUMBER_FIELDS = ["x_ratio", "y_ratio", "scroll_y", "document_y", "viewport_width", "viewport_height", "design_width", "design_height"] as const;
const OPTIONAL_STRING_FIELDS = ["environment", "app_version", "author_id", "author_name"] as const;
const REPORT_TYPES = new Set<ReportTargetType>(["group", "item"]);
const REPORT_STATUSES = new Set<ReportStatus>(["open", "resolved", "archived"]);
const REPLY_STATUSES = new Set(["suggested", "found_error", "resolved"]);

function importError(index: number, detail: string) {
    return new Error(`피드백 데이터 형식이 올바르지 않아요. (index ${index}: ${detail})`);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function isNullableFiniteNumber(value: unknown): value is number | null {
    return value === null || isFiniteNumber(value);
}

function isIsoDateString(value: string) {
    return !Number.isNaN(Date.parse(value));
}

function validateFieldValues(value: unknown, index: number): ReportFieldValues {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, "field_values 객체가 필요합니다");
    }

    return Object.entries(value).reduce<ReportFieldValues>((acc, [key, itemValue]) => {
        if (typeof itemValue === "string" || typeof itemValue === "boolean") {
            acc[key] = itemValue;
            return acc;
        }

        throw importError(index, `field_values.${key}는 string 또는 boolean이어야 합니다`);
    }, {});
}

function validateReply(value: unknown, index: number, replyIndex: number): ReportReply {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, `replies[${replyIndex}] 객체가 필요합니다`);
    }

    const reply = value as Record<string, unknown>;

    if (!isNonEmptyString(reply.id)) {
        throw importError(index, `replies[${replyIndex}].id 문자열이 필요합니다`);
    }

    if (typeof reply.message !== "string") {
        throw importError(index, `replies[${replyIndex}].message 문자열이 필요합니다`);
    }

    if (!isNonEmptyString(reply.created_at) || !isIsoDateString(reply.created_at)) {
        throw importError(index, `replies[${replyIndex}].created_at 날짜 문자열이 필요합니다`);
    }

    if (reply.status !== undefined && !REPLY_STATUSES.has(reply.status as ReportReply["status"])) {
        throw importError(index, `replies[${replyIndex}].status 값이 올바르지 않습니다`);
    }

    const authorName = reply.author_name;

    return {
        id: reply.id,
        message: reply.message,
        created_at: reply.created_at,
        status: (reply.status as ReportReply["status"] | undefined) ?? "suggested",
        author_type: reply.author_type as ReportReply["author_type"],
        author_name: authorName === null || typeof authorName === "string" ? authorName : undefined,
    };
}

function validateReplies(value: unknown, index: number): ReportReply[] {
    if (!Array.isArray(value)) {
        throw importError(index, "replies 배열이 필요합니다");
    }

    return value.map((reply, replyIndex) => validateReply(reply, index, replyIndex));
}

export function validateFeedbackRecord(item: unknown, index: number): ReportFeedback {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw importError(index, "객체가 필요합니다");
    }

    const record = item as Record<string, unknown>;

    for (const field of STRING_FIELDS) {
        if (!isNonEmptyString(record[field])) {
            throw importError(index, `${field} 문자열이 필요합니다`);
        }
    }

    if (!isIsoDateString(record.created_at as string)) {
        throw importError(index, "created_at 날짜 형식이 올바르지 않습니다");
    }

    if (!REPORT_TYPES.has(record.report_type as ReportTargetType)) {
        throw importError(index, "report_type은 group 또는 item이어야 합니다");
    }

    if (!REPORT_STATUSES.has(record.status as ReportStatus)) {
        throw importError(index, "status는 open, resolved, archived 중 하나여야 합니다");
    }

    for (const field of NUMBER_FIELDS) {
        if (!isFiniteNumber(record[field])) {
            throw importError(index, `${field} 숫자가 필요합니다`);
        }
    }

    if (!isNullableFiniteNumber(record.element_x_ratio)) {
        throw importError(index, "element_x_ratio는 number 또는 null이어야 합니다");
    }

    if (!isNullableFiniteNumber(record.element_y_ratio)) {
        throw importError(index, "element_y_ratio는 number 또는 null이어야 합니다");
    }

    for (const field of OPTIONAL_STRING_FIELDS) {
        if (record[field] !== undefined && typeof record[field] !== "string") {
            throw importError(index, `${field}는 string이어야 합니다`);
        }
    }

    return {
        id: record.id as string,
        pathname: record.pathname as string,
        report_id: record.report_id as string,
        report_type: record.report_type as ReportTargetType,
        message: record.message as string,
        status: record.status as ReportStatus,
        field_values: validateFieldValues(record.field_values, index),
        replies: validateReplies(record.replies, index),
        x_ratio: record.x_ratio as number,
        y_ratio: record.y_ratio as number,
        element_x_ratio: record.element_x_ratio as number | null,
        element_y_ratio: record.element_y_ratio as number | null,
        scroll_y: record.scroll_y as number,
        document_y: record.document_y as number,
        viewport_width: record.viewport_width as number,
        viewport_height: record.viewport_height as number,
        design_width: record.design_width as number,
        design_height: record.design_height as number,
        created_at: record.created_at as string,
        environment: record.environment as string | undefined,
        app_version: record.app_version as string | undefined,
        author_id: record.author_id as string | undefined,
        author_name: record.author_name as string | undefined,
    };
}

export function validateFeedbackImportArray(parsed: unknown): ReportFeedback[] {
    if (!Array.isArray(parsed)) {
        throw new Error("피드백 배열(JSON array) 형식이어야 해요.");
    }

    if (parsed.length === 0) {
        throw new Error("가져올 피드백 데이터가 비어 있어요.");
    }

    const seenIds = new Set<string>();

    return parsed.map((item, index) => {
        const feedback = validateFeedbackRecord(item, index);

        if (seenIds.has(feedback.id)) {
            throw importError(index, `중복된 id (${feedback.id})`);
        }

        seenIds.add(feedback.id);
        return feedback;
    });
}
