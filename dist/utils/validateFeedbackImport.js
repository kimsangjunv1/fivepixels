import { getActiveReportMessages } from "../i18n/index.js";
const STRING_FIELDS = ["id", "pathname", "report_id", "message", "created_at"];
const OPTIONAL_STRING_FIELDS = ["environment", "app_version", "author_id", "author_name"];
const REPORT_TYPES = new Set(["group", "item"]);
const REPORT_STATUSES = new Set(["open", "git_issued", "resolved", "archived"]);
const REPLY_STATUSES = new Set(["suggested", "additional_question", "found_error", "recheck_requested", "resolved"]);
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
function isIsoDateString(value) {
    return !Number.isNaN(Date.parse(value));
}
function validatePositionRatio(value, index, label) {
    const validation = getActiveReportMessages().importValidation;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionRatioInvalid(label));
    }
    const ratio = value;
    if (!isFiniteNumber(ratio.x) || !isFiniteNumber(ratio.y)) {
        throw importError(index, validation.positionRatioInvalid(label));
    }
    return {
        x: ratio.x,
        y: ratio.y,
    };
}
function validatePositionViewport(value, index) {
    const validation = getActiveReportMessages().importValidation;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionViewportInvalid);
    }
    const viewport = value;
    if (!isFiniteNumber(viewport.x) || !isFiniteNumber(viewport.y) || !isFiniteNumber(viewport.width) || !isFiniteNumber(viewport.height)) {
        throw importError(index, validation.positionViewportInvalid);
    }
    return {
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: viewport.height,
    };
}
function validatePositionAnchor(value, index) {
    const validation = getActiveReportMessages().importValidation;
    if (value === null) {
        return null;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionAnchorInvalid);
    }
    const anchor = value;
    if (!isNonEmptyString(anchor.reportId)) {
        throw importError(index, validation.positionAnchorInvalid);
    }
    if (!REPORT_TYPES.has(anchor.reportType)) {
        throw importError(index, validation.positionAnchorInvalid);
    }
    if (!isFiniteNumber(anchor.x) || !isFiniteNumber(anchor.y)) {
        throw importError(index, validation.positionAnchorInvalid);
    }
    return {
        reportId: anchor.reportId,
        reportType: anchor.reportType,
        x: anchor.x,
        y: anchor.y,
    };
}
function validatePosition(value, index) {
    const validation = getActiveReportMessages().importValidation;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionObjectRequired);
    }
    const position = value;
    if (position.target !== null && position.target !== undefined) {
        validatePositionRatio(position.target, index, "position.target");
    }
    if (!isFiniteNumber(position.scrollY)) {
        throw importError(index, validation.positionScrollYInvalid);
    }
    return {
        target: position.target === null || position.target === undefined ? null : validatePositionRatio(position.target, index, "position.target"),
        viewport: validatePositionViewport(position.viewport, index),
        scrollY: position.scrollY,
        anchor: position.anchor === undefined ? null : validatePositionAnchor(position.anchor, index),
    };
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
    const parentReplyId = reply.parent_reply_id;
    return {
        id: reply.id,
        message: reply.message,
        created_at: reply.created_at,
        status: reply.status ?? "suggested",
        ...(typeof parentReplyId === "string" ? { parent_reply_id: parentReplyId } : {}),
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
    return {
        github: {
            issue_number: githubRecord.issue_number,
            issue_url: githubRecord.issue_url,
            issued_at: githubRecord.issued_at,
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
        position: validatePosition(record.position, index),
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