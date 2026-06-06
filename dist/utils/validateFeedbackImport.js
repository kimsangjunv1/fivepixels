import { getActiveReportMessages } from "../i18n/index.js";
const STRING_FIELDS = ["id", "pathname", "report_id", "message", "created_at"];
const NUMBER_FIELDS = ["x_ratio", "y_ratio", "scroll_y", "document_y", "viewport_width", "viewport_height", "design_width", "design_height"];
const OPTIONAL_STRING_FIELDS = ["environment", "app_version", "author_id", "author_name"];
const REPORT_TYPES = new Set(["group", "item"]);
const REPORT_STATUSES = new Set(["open", "resolved", "archived"]);
const REPLY_STATUSES = new Set(["suggested", "found_error", "resolved"]);
function importError(index, detail) {
    const { errors } = getActiveReportMessages();
    return new Error(errors.importInvalidFormat(index, detail));
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
    const validation = getActiveReportMessages().importValidation;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.fieldValuesObjectRequired);
    }
    return Object.entries(value).reduce((acc, [key, itemValue]) => {
        if (typeof itemValue === "string" || typeof itemValue === "boolean") {
            acc[key] = itemValue;
            return acc;
        }
        throw importError(index, validation.fieldValuesEntryType(key));
    }, {});
}
function validateReply(value, index, replyIndex) {
    const validation = getActiveReportMessages().importValidation;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.replyObjectRequired(replyIndex));
    }
    const reply = value;
    if (!isNonEmptyString(reply.id)) {
        throw importError(index, validation.replyIdRequired(replyIndex));
    }
    if (typeof reply.message !== "string") {
        throw importError(index, validation.replyMessageRequired(replyIndex));
    }
    if (!isNonEmptyString(reply.created_at) || !isIsoDateString(reply.created_at)) {
        throw importError(index, validation.replyCreatedAtRequired(replyIndex));
    }
    if (reply.status !== undefined && !REPLY_STATUSES.has(reply.status)) {
        throw importError(index, validation.replyStatusInvalid(replyIndex));
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
function validateIntegrations(value, index) {
    const validation = getActiveReportMessages().importValidation;
    if (value === undefined) {
        return undefined;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.integrationsObjectInvalid);
    }
    const integrations = value;
    const github = integrations.github;
    if (github === undefined) {
        return undefined;
    }
    if (!github || typeof github !== "object" || Array.isArray(github)) {
        throw importError(index, validation.githubIntegrationObjectInvalid);
    }
    const githubRecord = github;
    if (!isFiniteNumber(githubRecord.issue_number)) {
        throw importError(index, validation.githubIssueNumberInvalid);
    }
    if (!isNonEmptyString(githubRecord.issue_url)) {
        throw importError(index, validation.githubIssueUrlInvalid);
    }
    if (!isNonEmptyString(githubRecord.issued_at) || !isIsoDateString(githubRecord.issued_at)) {
        throw importError(index, validation.githubIssuedAtInvalid);
    }
    if (githubRecord.state !== "open" && githubRecord.state !== "closed") {
        throw importError(index, validation.githubIssueStateInvalid);
    }
    return {
        github: {
            issue_number: githubRecord.issue_number,
            issue_url: githubRecord.issue_url,
            issued_at: githubRecord.issued_at,
            state: githubRecord.state,
        },
    };
}
function validateReplies(value, index) {
    const validation = getActiveReportMessages().importValidation;
    if (!Array.isArray(value)) {
        throw importError(index, validation.repliesArrayRequired);
    }
    return value.map((reply, replyIndex) => validateReply(reply, index, replyIndex));
}
export function validateFeedbackRecord(item, index) {
    const validation = getActiveReportMessages().importValidation;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw importError(index, validation.objectRequired);
    }
    const record = item;
    for (const field of STRING_FIELDS) {
        if (!isNonEmptyString(record[field])) {
            throw importError(index, validation.stringFieldRequired(field));
        }
    }
    if (!isIsoDateString(record.created_at)) {
        throw importError(index, validation.createdAtInvalid);
    }
    if (!REPORT_TYPES.has(record.report_type)) {
        throw importError(index, validation.reportTypeInvalid);
    }
    if (!REPORT_STATUSES.has(record.status)) {
        throw importError(index, validation.statusInvalid);
    }
    for (const field of NUMBER_FIELDS) {
        if (!isFiniteNumber(record[field])) {
            throw importError(index, validation.numberFieldRequired(field));
        }
    }
    if (!isNullableFiniteNumber(record.element_x_ratio)) {
        throw importError(index, validation.elementXRatioInvalid);
    }
    if (!isNullableFiniteNumber(record.element_y_ratio)) {
        throw importError(index, validation.elementYRatioInvalid);
    }
    for (const field of OPTIONAL_STRING_FIELDS) {
        if (record[field] !== undefined && typeof record[field] !== "string") {
            throw importError(index, validation.optionalStringFieldInvalid(field));
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
        integrations: validateIntegrations(record.integrations, index),
    };
}
export function validateFeedbackImportArray(parsed) {
    const { errors, importValidation } = getActiveReportMessages();
    if (!Array.isArray(parsed)) {
        throw new Error(errors.feedbackArrayRequired);
    }
    if (parsed.length === 0) {
        throw new Error(errors.importDataEmpty);
    }
    const seenIds = new Set();
    return parsed.map((item, index) => {
        const feedback = validateFeedbackRecord(item, index);
        if (seenIds.has(feedback.id)) {
            throw importError(index, importValidation.duplicateId(feedback.id));
        }
        seenIds.add(feedback.id);
        return feedback;
    });
}
//# sourceMappingURL=validateFeedbackImport.js.map