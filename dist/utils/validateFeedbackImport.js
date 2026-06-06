const STRING_FIELDS = ["id", "pathname", "report_id", "message", "created_at"];
const NUMBER_FIELDS = ["x_ratio", "y_ratio", "scroll_y", "document_y", "viewport_width", "viewport_height", "design_width", "design_height"];
const OPTIONAL_STRING_FIELDS = ["environment", "app_version", "author_id", "author_name"];
const REPORT_TYPES = new Set(["group", "item"]);
const REPORT_STATUSES = new Set(["open", "resolved", "archived"]);
const REPLY_STATUSES = new Set(["suggested", "found_error", "resolved"]);
function importError(index, detail) {
    return new Error(`피드백 데이터 형식이 올바르지 않아요. (index ${index}: ${detail})`);
}
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function isNullableFiniteNumber(value) {
    return value === null || isFiniteNumber(value);
}
function isIsoDateString(value) {
    return !Number.isNaN(Date.parse(value));
}
function validateFieldValues(value, index) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, "field_values 객체가 필요합니다");
    }
    return Object.entries(value).reduce((acc, [key, itemValue]) => {
        if (typeof itemValue === "string" || typeof itemValue === "boolean") {
            acc[key] = itemValue;
            return acc;
        }
        throw importError(index, `field_values.${key}는 string 또는 boolean이어야 합니다`);
    }, {});
}
function validateReply(value, index, replyIndex) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, `replies[${replyIndex}] 객체가 필요합니다`);
    }
    const reply = value;
    if (!isNonEmptyString(reply.id)) {
        throw importError(index, `replies[${replyIndex}].id 문자열이 필요합니다`);
    }
    if (typeof reply.message !== "string") {
        throw importError(index, `replies[${replyIndex}].message 문자열이 필요합니다`);
    }
    if (!isNonEmptyString(reply.created_at) || !isIsoDateString(reply.created_at)) {
        throw importError(index, `replies[${replyIndex}].created_at 날짜 문자열이 필요합니다`);
    }
    if (reply.status !== undefined && !REPLY_STATUSES.has(reply.status)) {
        throw importError(index, `replies[${replyIndex}].status 값이 올바르지 않습니다`);
    }
    const authorName = reply.author_name;
    return {
        id: reply.id,
        message: reply.message,
        created_at: reply.created_at,
        status: reply.status ?? "suggested",
        author_type: reply.author_type,
        author_name: authorName === null || typeof authorName === "string" ? authorName : undefined,
    };
}
function validateReplies(value, index) {
    if (!Array.isArray(value)) {
        throw importError(index, "replies 배열이 필요합니다");
    }
    return value.map((reply, replyIndex) => validateReply(reply, index, replyIndex));
}
export function validateFeedbackRecord(item, index) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw importError(index, "객체가 필요합니다");
    }
    const record = item;
    for (const field of STRING_FIELDS) {
        if (!isNonEmptyString(record[field])) {
            throw importError(index, `${field} 문자열이 필요합니다`);
        }
    }
    if (!isIsoDateString(record.created_at)) {
        throw importError(index, "created_at 날짜 형식이 올바르지 않습니다");
    }
    if (!REPORT_TYPES.has(record.report_type)) {
        throw importError(index, "report_type은 group 또는 item이어야 합니다");
    }
    if (!REPORT_STATUSES.has(record.status)) {
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
        id: record.id,
        pathname: record.pathname,
        report_id: record.report_id,
        report_type: record.report_type,
        message: record.message,
        status: record.status,
        field_values: validateFieldValues(record.field_values, index),
        replies: validateReplies(record.replies, index),
        x_ratio: record.x_ratio,
        y_ratio: record.y_ratio,
        element_x_ratio: record.element_x_ratio,
        element_y_ratio: record.element_y_ratio,
        scroll_y: record.scroll_y,
        document_y: record.document_y,
        viewport_width: record.viewport_width,
        viewport_height: record.viewport_height,
        design_width: record.design_width,
        design_height: record.design_height,
        created_at: record.created_at,
        environment: record.environment,
        app_version: record.app_version,
        author_id: record.author_id,
        author_name: record.author_name,
    };
}
export function validateFeedbackImportArray(parsed) {
    if (!Array.isArray(parsed)) {
        throw new Error("피드백 배열(JSON array) 형식이어야 해요.");
    }
    if (parsed.length === 0) {
        throw new Error("가져올 피드백 데이터가 비어 있어요.");
    }
    const seenIds = new Set();
    return parsed.map((item, index) => {
        const feedback = validateFeedbackRecord(item, index);
        if (seenIds.has(feedback.id)) {
            throw importError(index, `중복된 id (${feedback.id})`);
        }
        seenIds.add(feedback.id);
        return feedback;
    });
}
//# sourceMappingURL=validateFeedbackImport.js.map