import type {
    ReportCase,
    ReportFeedback,
    ReportFieldValues,
    ReportIntegrations,
    ReportPosition,
    ReportPositionAnchor,
    ReportPositionRatio,
    ReportPositionViewport,
    ReportReply,
    ReportStatus,
    ReportTargetType,
} from "@/types/report.js";
import { normalizeReportCase, normalizeReplyCaseIds } from "@/utils/reportCases.js";
import { getActiveReportMessages } from "@/i18n/index.js";

const STRING_FIELDS = ["id", "pathname", "report_id", "created_at"] as const;
const OPTIONAL_STRING_FIELDS = ["environment", "app_version", "author_id", "author_name", "target_selector"] as const;
const REPORT_TYPES = new Set<ReportTargetType>(["group", "item"]);
const REPORT_STATUSES = new Set<ReportStatus>(["open", "git_issued", "resolved", "archived"]);
const REPLY_STATUSES = new Set([
    "suggested",
    "additional_question",
    "found_error",
    "recheck_requested",
    "resolved",
    "assignee_assigned",
    "assignee_transferred",
]);

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

function isIsoDateString(value: string) {
    return !Number.isNaN(Date.parse(value));
}

function validatePositionRatio(value: unknown, index: number, label: string): ReportPositionRatio {
    const validation = getActiveReportMessages().importValidation;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionRatioInvalid(label));
    }

    const ratio = value as Record<string, unknown>;

    if (!isFiniteNumber(ratio.x) || !isFiniteNumber(ratio.y)) {
        throw importError(index, validation.positionRatioInvalid(label));
    }

    return {
        x: ratio.x,
        y: ratio.y,
    };
}

function validatePositionViewport(value: unknown, index: number): ReportPositionViewport {
    const validation = getActiveReportMessages().importValidation;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionViewportInvalid);
    }

    const viewport = value as Record<string, unknown>;

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

function validatePositionAnchor(value: unknown, index: number): ReportPositionAnchor | null {
    const validation = getActiveReportMessages().importValidation;

    if (value === null) {
        return null;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionAnchorInvalid);
    }

    const anchor = value as Record<string, unknown>;

    if (!isNonEmptyString(anchor.reportId)) {
        throw importError(index, validation.positionAnchorInvalid);
    }

    if (!REPORT_TYPES.has(anchor.reportType as ReportTargetType)) {
        throw importError(index, validation.positionAnchorInvalid);
    }

    if (!isFiniteNumber(anchor.x) || !isFiniteNumber(anchor.y)) {
        throw importError(index, validation.positionAnchorInvalid);
    }

    return {
        reportId: anchor.reportId,
        reportType: anchor.reportType as ReportTargetType,
        x: anchor.x,
        y: anchor.y,
    };
}

function validatePosition(value: unknown, index: number): ReportPosition {
    const validation = getActiveReportMessages().importValidation;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw importError(index, validation.positionObjectRequired);
    }

    const position = value as Record<string, unknown>;

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
    const parentReplyId = reply.parent_reply_id;

    return {
        id: reply.id,
        message: reply.message,
        created_at: reply.created_at,
        status: (reply.status as ReportReply["status"] | undefined) ?? "suggested",
        case_ids: normalizeReplyCaseIds(reply.case_ids),
        ...(typeof parentReplyId === "string" ? { parent_reply_id: parentReplyId } : {}),
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

    return {
        github: {
            issue_number: githubRecord.issue_number,
            issue_url: githubRecord.issue_url,
            issued_at: githubRecord.issued_at,
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

export function validateCases(value: unknown, index: number, createdAt: string): ReportCase[] {
    const validation = getActiveReportMessages().importValidation;

    if (!Array.isArray(value) || value.length === 0) {
        throw importError(index, validation.casesRequired);
    }

    const cases = value.flatMap((item, caseIndex) => {
        const normalized = normalizeReportCase(item, createdAt);

        if (!normalized) {
            throw importError(index, validation.caseInvalid(caseIndex));
        }

        if (!normalized.text.trim()) {
            throw importError(index, validation.caseTextRequired(caseIndex));
        }

        return [normalized];
    });

    return cases;
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
        cases: validateCases(record.cases, index, record.created_at as string),
        status: record.status as ReportStatus,
        field_values: validateFieldValues(record.field_values, index),
        replies: validateReplies(record.replies, index),
        position: validatePosition(record.position, index),
        created_at: record.created_at as string,
        environment: record.environment as string | undefined,
        app_version: record.app_version as string | undefined,
        author_id: record.author_id as string | undefined,
        author_name: record.author_name as string | undefined,
        target_selector: record.target_selector as string | undefined,
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
