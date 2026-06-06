import { getActiveReportMessages } from "../i18n/index.js";
import { validateFeedbackImportArray, validateFeedbackRecord } from "./validateFeedbackImport.js";
export const FEEDBACK_TRANSFER_SCHEMA_VERSION = 1;
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isIsoDateString(value) {
    return !Number.isNaN(Date.parse(value));
}
function normalizeOptionalString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
export function normalizeReportProject(value) {
    if (!isRecord(value)) {
        return undefined;
    }
    const project = {
        id: normalizeOptionalString(value.id),
        env: normalizeOptionalString(value.env),
        version: normalizeOptionalString(value.version),
    };
    if (!project.id && !project.env && !project.version) {
        return undefined;
    }
    return project;
}
export function toReportProject({ projectId, environment, appVersion }) {
    return {
        id: projectId,
        env: environment,
        version: appVersion,
    };
}
export function formatProjectScopeValue(value) {
    return value?.trim() || getActiveReportMessages().common.none;
}
export function buildProjectComparisonLines(current, imported) {
    const currentProject = toReportProject(current);
    return [
        {
            label: "project.id",
            current: formatProjectScopeValue(currentProject.id),
            imported: formatProjectScopeValue(imported?.id),
            differs: (currentProject.id ?? "") !== (imported?.id ?? ""),
        },
        {
            label: "project.version",
            current: formatProjectScopeValue(currentProject.version),
            imported: formatProjectScopeValue(imported?.version),
            differs: (currentProject.version ?? "") !== (imported?.version ?? ""),
        },
        {
            label: "project.env",
            current: formatProjectScopeValue(currentProject.env),
            imported: formatProjectScopeValue(imported?.env),
            differs: (currentProject.env ?? "") !== (imported?.env ?? ""),
        },
    ];
}
export function isImportProjectCompatible(current, imported) {
    if (!imported?.id) {
        return false;
    }
    return current.projectId === imported.id && (current.appVersion ?? "") === (imported.version ?? "");
}
export function serializeFeedbackExport(project, items, exportedAt = new Date().toISOString()) {
    const payload = {
        schemaVersion: FEEDBACK_TRANSFER_SCHEMA_VERSION,
        project,
        exportedAt,
        items,
    };
    return JSON.stringify(payload, null, 2);
}
export function serializeFeedbackStorageEnvelope(project, items, updatedAt = new Date().toISOString()) {
    const envelope = {
        project,
        updatedAt,
        items,
    };
    return JSON.stringify(envelope);
}
export function parseFeedbackStorageEnvelope(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return null;
    }
    if (Array.isArray(parsed)) {
        return null;
    }
    if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
        return null;
    }
    const project = normalizeReportProject(parsed.project) ?? {};
    const updatedAt = normalizeOptionalString(parsed.updatedAt);
    if (!updatedAt || !isIsoDateString(updatedAt)) {
        return null;
    }
    return {
        project,
        updatedAt,
        items: parsed.items,
    };
}
export function serializeFeedbackItem(item) {
    return JSON.stringify(item, null, 2);
}
function isFeedbackRecordShape(value) {
    if (!isRecord(value)) {
        return false;
    }
    return typeof value.id === "string" && typeof value.pathname === "string" && typeof value.report_id === "string";
}
export function parseFeedbackCommandJson(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new Error(getActiveReportMessages().errors.invalidJson);
    }
    if (Array.isArray(parsed) || (isRecord(parsed) && Array.isArray(parsed.items))) {
        return parseFeedbackImportJson(raw);
    }
    if (isFeedbackRecordShape(parsed)) {
        return {
            items: [validateFeedbackRecord(parsed, 0)],
        };
    }
    throw new Error(getActiveReportMessages().errors.invalidFeedbackFormat);
}
export function parseFeedbackImportJson(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new Error(getActiveReportMessages().errors.invalidJson);
    }
    if (Array.isArray(parsed)) {
        return {
            items: validateFeedbackImportArray(parsed),
        };
    }
    if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
        throw new Error(getActiveReportMessages().errors.feedbackArrayRequired);
    }
    const exportedAt = normalizeOptionalString(parsed.exportedAt);
    if (exportedAt && !isIsoDateString(exportedAt)) {
        throw new Error(getActiveReportMessages().errors.invalidExportedAt);
    }
    return {
        items: validateFeedbackImportArray(parsed.items),
        project: normalizeReportProject(parsed.project),
        exportedAt,
    };
}
//# sourceMappingURL=feedbackTransferSchema.js.map