import { getActiveReportMessages } from "../i18n/index.js";
import { validateFeedbackImportArray, validateFeedbackRecord } from "./validateFeedbackImport.js";
import type { ReportFeedback, ReportProject } from "../types/report.js";
import type { ResolvedReportProject } from "./reportProject.js";

export const FEEDBACK_TRANSFER_SCHEMA_VERSION = 1;

export type FeedbackExportPayload = {
    schemaVersion: typeof FEEDBACK_TRANSFER_SCHEMA_VERSION;
    project: ReportProject;
    exportedAt: string;
    items: ReportFeedback[];
};

export type FeedbackStorageEnvelope = {
    project: ReportProject;
    updatedAt: string;
    items: ReportFeedback[];
};

export type FeedbackImportPayload = {
    items: ReportFeedback[];
    project?: ReportProject;
    exportedAt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoDateString(value: string) {
    return !Number.isNaN(Date.parse(value));
}

function normalizeOptionalString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function normalizeReportProject(value: unknown): ReportProject | undefined {
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

export function toReportProject({ projectId, environment, appVersion }: ResolvedReportProject): ReportProject {
    return {
        id: projectId,
        env: environment,
        version: appVersion,
    };
}

export function formatProjectScopeValue(value?: string) {
    return value?.trim() || getActiveReportMessages().common.none;
}

export type ProjectComparisonLine = {
    label: string;
    current: string;
    imported: string;
    differs: boolean;
};

export function buildProjectComparisonLines(current: ResolvedReportProject, imported?: ReportProject): ProjectComparisonLine[] {
    const currentProject = toReportProject(current);
    const labels = getActiveReportMessages().projectComparison;

    return [
        {
            label: labels.projectId,
            current: formatProjectScopeValue(currentProject.id),
            imported: formatProjectScopeValue(imported?.id),
            differs: (currentProject.id ?? "") !== (imported?.id ?? ""),
        },
        {
            label: labels.projectVersion,
            current: formatProjectScopeValue(currentProject.version),
            imported: formatProjectScopeValue(imported?.version),
            differs: (currentProject.version ?? "") !== (imported?.version ?? ""),
        },
        {
            label: labels.projectEnv,
            current: formatProjectScopeValue(currentProject.env),
            imported: formatProjectScopeValue(imported?.env),
            differs: (currentProject.env ?? "") !== (imported?.env ?? ""),
        },
    ];
}

export function isImportProjectCompatible(current: ResolvedReportProject, imported?: ReportProject) {
    if (!imported?.id) {
        return false;
    }

    return current.projectId === imported.id && (current.appVersion ?? "") === (imported.version ?? "");
}

export function serializeFeedbackExport(project: ReportProject, items: ReportFeedback[], exportedAt = new Date().toISOString()): string {
    const payload: FeedbackExportPayload = {
        schemaVersion: FEEDBACK_TRANSFER_SCHEMA_VERSION,
        project,
        exportedAt,
        items,
    };

    return JSON.stringify(payload, null, 2);
}

export function serializeFeedbackStorageEnvelope(project: ReportProject, items: ReportFeedback[], updatedAt = new Date().toISOString()): string {
    const envelope: FeedbackStorageEnvelope = {
        project,
        updatedAt,
        items,
    };

    return JSON.stringify(envelope);
}

export function parseFeedbackStorageEnvelope(raw: string): FeedbackStorageEnvelope | null {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
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
        items: parsed.items as ReportFeedback[],
    };
}

export function serializeFeedbackItem(item: ReportFeedback): string {
    return JSON.stringify(item, null, 2);
}

function isFeedbackRecordShape(value: unknown): value is Record<string, unknown> {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value.id === "string" && typeof value.pathname === "string" && typeof value.report_id === "string";
}

export function parseFeedbackCommandJson(raw: string): FeedbackImportPayload {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
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

export function parseFeedbackImportJson(raw: string): FeedbackImportPayload {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
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
