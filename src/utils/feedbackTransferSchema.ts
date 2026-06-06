import type { ReportFeedback, ReportProject } from "../types/report.js";
import { validateFeedbackImportArray } from "./validateFeedbackImport.js";
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
    return value?.trim() || "(없음)";
}

export type ProjectComparisonLine = {
    label: string;
    current: string;
    imported: string;
    differs: boolean;
};

export function buildProjectComparisonLines(current: ResolvedReportProject, imported?: ReportProject): ProjectComparisonLine[] {
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

export function parseFeedbackImportJson(raw: string): FeedbackImportPayload {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error("JSON 형식이 올바르지 않아요.");
    }

    if (Array.isArray(parsed)) {
        return {
            items: validateFeedbackImportArray(parsed),
        };
    }

    if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
        throw new Error("피드백 배열(JSON array) 또는 export envelope 형식이어야 해요.");
    }

    const exportedAt = normalizeOptionalString(parsed.exportedAt);

    if (exportedAt && !isIsoDateString(exportedAt)) {
        throw new Error("exportedAt 날짜 형식이 올바르지 않아요.");
    }

    return {
        items: validateFeedbackImportArray(parsed.items),
        project: normalizeReportProject(parsed.project),
        exportedAt,
    };
}
