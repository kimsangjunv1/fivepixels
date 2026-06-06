import { getReportsStorageKey } from "../constants/storageKeys.js";
import { readAllReportsFromStorage, writeAllReportsToStorage } from "../storage/local/localStorageAdapter.js";
import type { ReportFeedback, ReportProject } from "../types/report.js";
import {
    parseFeedbackImportJson,
    serializeFeedbackExport,
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
    parseFeedbackImportJson,
    serializeFeedbackExport,
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
