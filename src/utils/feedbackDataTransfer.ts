import { getReportsStorageKey } from "../constants/storageKeys.js";
import { readAllReportsFromStorage, writeAllReportsToStorage } from "../storage/local/localStorageAdapter.js";
import type { ReportFeedback, ReportProject } from "../types/report.js";
import {
    parseFeedbackCommandJson,
    parseFeedbackImportJson,
    serializeFeedbackExport,
    serializeFeedbackItem,
    toReportProject,
    type FeedbackImportPayload,
} from "./feedbackTransferSchema.js";

export type FeedbackTransferScope = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};

export type { FeedbackImportPayload } from "./feedbackTransferSchema.js";
export {
    buildProjectComparisonLines,
    isImportProjectCompatible,
    parseFeedbackCommandJson,
    parseFeedbackImportJson,
    serializeFeedbackExport,
    serializeFeedbackItem,
    toReportProject,
} from "./feedbackTransferSchema.js";

export type FeedbackDownloadResult = "saved" | "downloaded" | "cancelled" | "failed";

type FilePickerWindow = Window & {
    showOpenFilePicker?: (options?: {
        multiple?: boolean;
        types?: Array<{
            description?: string;
            accept: Record<string, string[]>;
        }>;
    }) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: Array<{
            description?: string;
            accept: Record<string, string[]>;
        }>;
    }) => Promise<FileSystemFileHandle>;
};

const JSON_FILE_TYPES = [
    {
        description: "JSON",
        accept: { "application/json": [".json"] },
    },
];

export function getFeedbackStorageKey({ projectId, environment, appVersion }: FeedbackTransferScope) {
    return getReportsStorageKey(projectId, environment, appVersion);
}

export function readAllFeedback({ projectId, environment, appVersion }: FeedbackTransferScope) {
    return readAllReportsFromStorage(getFeedbackStorageKey({ projectId, environment, appVersion }));
}

export function writeAllFeedback(scope: FeedbackTransferScope, items: ReportFeedback[]) {
    writeAllReportsToStorage(getFeedbackStorageKey(scope), items, toReportProject(scope));
}

export type FeedbackInsertResult = {
    inserted: number;
    replaced: number;
};

export type FeedbackInsertConflict = {
    id: string;
    existing: ReportFeedback;
    incoming: ReportFeedback;
};

export function findFeedbackInsertConflicts(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertConflict[] {
    const existingById = new Map(readAllFeedback(scope).map((item) => [item.id, item]));

    return incoming.flatMap((item) => {
        const existing = existingById.get(item.id);

        if (!existing) {
            return [];
        }

        return [{ id: item.id, existing, incoming: item }];
    });
}

export function insertFeedbackItems(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertResult {
    const existing = readAllFeedback(scope);
    const existingIds = new Set(existing.map((item) => item.id));

    if (incoming.some((item) => existingIds.has(item.id))) {
        throw new Error("이미 등록된 id가 포함되어 있어요.");
    }

    writeAllFeedback(scope, [...existing, ...incoming]);

    return {
        inserted: incoming.length,
        replaced: 0,
    };
}

export function upsertFeedbackItems(scope: FeedbackTransferScope, incoming: ReportFeedback[]): FeedbackInsertResult {
    const existing = readAllFeedback(scope);
    const existingIds = new Set(existing.map((item) => item.id));
    const incomingById = new Map(incoming.map((item) => [item.id, item]));
    let replaced = 0;
    let inserted = 0;

    for (const item of incoming) {
        if (existingIds.has(item.id)) {
            replaced += 1;
        } else {
            inserted += 1;
        }
    }

    const kept = existing.filter((item) => !incomingById.has(item.id));

    writeAllFeedback(scope, [...kept, ...incoming]);

    return {
        inserted,
        replaced,
    };
}

export async function copyTextToClipboard(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    getFileTransferParent().appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand("copy");

    textarea.remove();

    if (!copied) {
        throw new Error("클립보드 복사에 실패했어요.");
    }
}

export function createFeedbackBackupFilename(projectId: string, environment?: string, appVersion?: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const envSuffix = environment ? `-${environment}` : "";
    const versionSuffix = appVersion ? `-${appVersion}` : "";

    return `stitchable-feedback-backup-${projectId}${envSuffix}${versionSuffix}-${timestamp}.json`;
}

function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === "AbortError";
}

const SHADOW_HOST_ID = "stitchable-root";
const SHADOW_MOUNT_ATTR = "data-stitchable-mount";

function getShadowDomMount(): HTMLElement | null {
    const host = document.getElementById(SHADOW_HOST_ID);
    const mount = host?.shadowRoot?.querySelector(`[${SHADOW_MOUNT_ATTR}]`);

    return mount instanceof HTMLElement ? mount : null;
}

function getFileTransferParent(): HTMLElement {
    return getShadowDomMount() ?? document.body;
}

function downloadFeedbackJsonWithAnchor(filename: string, json: string) {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    getFileTransferParent().appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function pickFeedbackJsonFileWithBodyInput(): Promise<File | null> {
    return new Promise((resolve) => {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = ".json,application/json";
        input.multiple = false;
        input.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";

        const cleanup = () => {
            input.remove();
        };

        input.addEventListener(
            "change",
            () => {
                const file = input.files?.[0] ?? null;
                cleanup();
                resolve(file);
            },
            { once: true },
        );

        getFileTransferParent().appendChild(input);
        input.click();
    });
}

export function pickFeedbackJsonFile(): Promise<File | null> {
    if (typeof window === "undefined") {
        return Promise.resolve(null);
    }

    const pickerWindow = window as FilePickerWindow;

    if (typeof pickerWindow.showOpenFilePicker === "function") {
        return pickerWindow
            .showOpenFilePicker({
                multiple: false,
                types: JSON_FILE_TYPES,
            })
            .then(async ([handle]) => handle.getFile())
            .catch((error) => {
                if (isAbortError(error)) {
                    return null;
                }

                return pickFeedbackJsonFileWithBodyInput();
            });
    }

    return pickFeedbackJsonFileWithBodyInput();
}

export function downloadFeedbackJson(filename: string, project: ReportProject, items: ReportFeedback[]): Promise<FeedbackDownloadResult> {
    if (typeof window === "undefined") {
        return Promise.resolve("failed");
    }

    const json = serializeFeedbackExport(project, items);
    const pickerWindow = window as FilePickerWindow;

    if (typeof pickerWindow.showSaveFilePicker === "function") {
        return pickerWindow
            .showSaveFilePicker({
                suggestedName: filename,
                types: JSON_FILE_TYPES,
            })
            .then(async (handle): Promise<FeedbackDownloadResult> => {
                const writable = await handle.createWritable();

                await writable.write(json);
                await writable.close();
                return "saved";
            })
            .catch((error): FeedbackDownloadResult => {
                if (isAbortError(error)) {
                    return "cancelled";
                }

                try {
                    downloadFeedbackJsonWithAnchor(filename, json);
                    return "downloaded";
                } catch {
                    return "failed";
                }
            });
    }

    try {
        downloadFeedbackJsonWithAnchor(filename, json);
        return Promise.resolve("downloaded");
    } catch {
        return Promise.resolve("failed");
    }
}

export async function readFeedbackJsonFile(file: File): Promise<FeedbackImportPayload> {
    const raw = await file.text();
    return parseFeedbackImportJson(raw);
}
