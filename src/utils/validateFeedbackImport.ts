import type { ReportFeedback, ReportFieldValues, ReportIntegrations, ReportReply, ReportStatus, ReportTargetType } from "../types/report.js";
import { getActiveReportMessages } from "../i18n/index.js";

const STRING_FIELDS = ["id", "pathname", "report_id", "message", "created_at"] as const;
const NUMBER_FIELDS = ["x_ratio", "y_ratio", "scroll_y", "document_y", "viewport_width", "viewport_height", "design_width", "design_height"] as const;
const OPTIONAL_STRING_FIELDS = ["environment", "app_version", "author_id", "author_name"] as const;
const REPORT_TYPES = new Set<ReportTargetType>(["group", "item"]);
const REPORT_STATUSES = new Set<ReportStatus>(["open", "resolved", "archived"]);
const REPLY_STATUSES = new Set(["suggested", "found_error", "resolved"]);

function importError(index: number, detail: string) {
    const { errors } = getActiveReportMessages();

    return new Error(errors.importInvalidFormat(index, detail));
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
    const validation = getActiveReportMessages().importValidation;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.fieldValuesObjectRequired);
    }

    return Object.entries(value).reduce<ReportFieldValues>((acc, [key, itemValue]) => {
        if (typeof itemValue === "string" || typeof itemValue === "boolean") {
            acc[key] = itemValue;
            return acc;
        }

        throw importError(index, validation.fieldValuesEntryType(key));
    }, {});
}

function validateReply(value: unknown, index: number, replyIndex: number): ReportReply {
    const validation = getActiveReportMessages().importValidation;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.replyObjectRequired(replyIndex));
    }

    const reply = value as Record<string, unknown>;

    if (!isNonEmptyString(reply.id)) {
        throw importError(index, validation.replyIdRequired(replyIndex));
    }

    if (typeof reply.message !== "string") {
        throw importError(index, validation.replyMessageRequired(replyIndex));
    }

    if (!isNonEmptyString(reply.created_at) || !isIsoDateString(reply.created_at)) {
        throw importError(index, validation.replyCreatedAtRequired(replyIndex));
    }

    if (reply.status !== undefined && !REPLY_STATUSES.has(reply.status as ReportReply["status"])) {
        throw importError(index, validation.replyStatusInvalid(replyIndex));
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

function validateIntegrations(value: unknown, index: number): ReportIntegrations | undefined {
    const validation = getActiveReportMessages().importValidation;

    if (value === undefined) {
        return undefined;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.integrationsObjectInvalid);
    }

    const integrations = value as Record<string, unknown>;
    const github = integrations.github;

    if (github === undefined) {
        return undefined;
    }

    if (!github || typeof github !== "object" || Array.isArray(github)) {
        throw importError(index, validation.githubIntegrationObjectInvalid);
    }

    const githubRecord = github as Record<string, unknown>;

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

function validateReplies(value: unknown, index: number): ReportReply[] {
    const validation = getActiveReportMessages().importValidation;

    if (!Array.isArray(value)) {
        throw importError(index, validation.repliesArrayRequired);
    }

    return value.map((reply, replyIndex) => validateReply(reply, index, replyIndex));
}

export function validateFeedbackRecord(item: unknown, index: number): ReportFeedback {
    const validation = getActiveReportMessages().importValidation;

    if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw importError(index, validation.objectRequired);
    }

    const record = item as Record<string, unknown>;

    for (const field of STRING_FIELDS) {
        if (!isNonEmptyString(record[field])) {
            throw importError(index, validation.stringFieldRequired(field));
        }
    }

    if (!isIsoDateString(record.created_at as string)) {
        throw importError(index, validation.createdAtInvalid);
    }

    if (!REPORT_TYPES.has(record.report_type as ReportTargetType)) {
        throw importError(index, validation.reportTypeInvalid);
    }

    if (!REPORT_STATUSES.has(record.status as ReportStatus)) {
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
        integrations: validateIntegrations(record.integrations, index),
    };
}

export function validateFeedbackImportArray(parsed: unknown): ReportFeedback[] {
    const { errors, importValidation } = getActiveReportMessages();

    if (!Array.isArray(parsed)) {
        throw new Error(errors.feedbackArrayRequired);
    }

    if (parsed.length === 0) {
        throw new Error(errors.importDataEmpty);
    }

    const seenIds = new Set<string>();

    return parsed.map((item, index) => {
        const feedback = validateFeedbackRecord(item, index);

        if (seenIds.has(feedback.id)) {
            throw importError(index, importValidation.duplicateId(feedback.id));
        }

        seenIds.add(feedback.id);
        return feedback;
    });
}
