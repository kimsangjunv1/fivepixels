import { getActiveReportMessages } from "../../i18n/index.js";
import { getReportsStorageKey } from "../../constants/storageKeys.js";
import { readAllReportsFromStorage, writeAllReportsToStorage } from "../../storage/local/localStorageAdapter.js";
import { parseFeedbackImportJson, serializeFeedbackExport, toReportProject, } from "./feedbackTransferSchema.js";
export { buildProjectComparisonLines, isImportProjectCompatible, parseFeedbackCommandJson, parseFeedbackImportJson, serializeFeedbackExport, serializeFeedbackItem, toReportProject, } from "./feedbackTransferSchema.js";
const JSON_FILE_TYPES = [
    {
        description: "JSON",
        accept: { "application/json": [".json"] },
    },
];
export function getFeedbackStorageKey({ projectId, environment, appVersion }) {
    return getReportsStorageKey(projectId, environment, appVersion);
}
export function readAllFeedback({ projectId, environment, appVersion }) {
    return readAllReportsFromStorage(getFeedbackStorageKey({ projectId, environment, appVersion }));
}
export function writeAllFeedback(scope, items) {
    writeAllReportsToStorage(getFeedbackStorageKey(scope), items, toReportProject(scope));
}
export function findFeedbackInsertConflicts(scope, incoming) {
    const existingById = new Map(readAllFeedback(scope).map((item) => [item.id, item]));
    return incoming.flatMap((item) => {
        const existing = existingById.get(item.id);
        if (!existing) {
            return [];
        }
        return [{ id: item.id, existing, incoming: item }];
    });
}
export function insertFeedbackItems(scope, incoming) {
    const existing = readAllFeedback(scope);
    const existingIds = new Set(existing.map((item) => item.id));
    if (incoming.some((item) => existingIds.has(item.id))) {
        throw new Error(getActiveReportMessages().errors.duplicateIdIncluded);
    }
    writeAllFeedback(scope, [...existing, ...incoming]);
    return {
        inserted: incoming.length,
        replaced: 0,
    };
}
export function upsertFeedbackItems(scope, incoming) {
    const existing = readAllFeedback(scope);
    const existingIds = new Set(existing.map((item) => item.id));
    const incomingById = new Map(incoming.map((item) => [item.id, item]));
    let replaced = 0;
    let inserted = 0;
    for (const item of incoming) {
        if (existingIds.has(item.id)) {
            replaced += 1;
        }
        else {
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
export async function copyTextToClipboard(text) {
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
        throw new Error(getActiveReportMessages().errors.clipboardCopyFailed);
    }
}
export function createFeedbackBackupFilename(projectId, environment, appVersion) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const envSuffix = environment ? `-${environment}` : "";
    const versionSuffix = appVersion ? `-${appVersion}` : "";
    return `fivepixels-feedback-backup-${projectId}${envSuffix}${versionSuffix}-${timestamp}.json`;
}
function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError";
}
const SHADOW_HOST_ID = "fivepixels-root";
const SHADOW_MOUNT_ATTR = "data-fivepixels-mount";
function getShadowDomMount() {
    const host = document.getElementById(SHADOW_HOST_ID);
    const mount = host?.shadowRoot?.querySelector(`[${SHADOW_MOUNT_ATTR}]`);
    return mount instanceof HTMLElement ? mount : null;
}
function getFileTransferParent() {
    return getShadowDomMount() ?? document.body;
}
function downloadFeedbackJsonWithAnchor(filename, json) {
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
function pickFeedbackJsonFileWithBodyInput() {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.multiple = false;
        input.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
        const cleanup = () => {
            input.remove();
        };
        input.addEventListener("change", () => {
            const file = input.files?.[0] ?? null;
            cleanup();
            resolve(file);
        }, { once: true });
        getFileTransferParent().appendChild(input);
        input.click();
    });
}
export function pickFeedbackJsonFile() {
    if (typeof window === "undefined") {
        return Promise.resolve(null);
    }
    const pickerWindow = window;
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
export function downloadFeedbackJson(filename, project, items) {
    if (typeof window === "undefined") {
        return Promise.resolve("failed");
    }
    const json = serializeFeedbackExport(project, items);
    const pickerWindow = window;
    if (typeof pickerWindow.showSaveFilePicker === "function") {
        return pickerWindow
            .showSaveFilePicker({
            suggestedName: filename,
            types: JSON_FILE_TYPES,
        })
            .then(async (handle) => {
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
            return "saved";
        })
            .catch((error) => {
            if (isAbortError(error)) {
                return "cancelled";
            }
            try {
                downloadFeedbackJsonWithAnchor(filename, json);
                return "downloaded";
            }
            catch {
                return "failed";
            }
        });
    }
    try {
        downloadFeedbackJsonWithAnchor(filename, json);
        return Promise.resolve("downloaded");
    }
    catch {
        return Promise.resolve("failed");
    }
}
export async function readFeedbackJsonFile(file) {
    const raw = await file.text();
    return parseFeedbackImportJson(raw);
}
const FPKEY_EXTENSION = ".fpkey";
const FPKEY_FILE_TYPES = [
    {
        description: "fivepixels key",
        accept: { "text/plain": [FPKEY_EXTENSION] },
    },
];
export function createPersonalKeyBackupFilename(projectId, environment, appVersion) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const envSuffix = environment ? `-${environment}` : "";
    const versionSuffix = appVersion ? `-${appVersion}` : "";
    return `fivepixels-key-${projectId}${envSuffix}${versionSuffix}-${timestamp}${FPKEY_EXTENSION}`;
}
function downloadTextWithAnchor(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
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
export function downloadPersonalKeyBackup(filename, key) {
    if (typeof window === "undefined") {
        return Promise.resolve("failed");
    }
    const pickerWindow = window;
    if (typeof pickerWindow.showSaveFilePicker === "function") {
        return pickerWindow
            .showSaveFilePicker({
            suggestedName: filename,
            types: FPKEY_FILE_TYPES,
        })
            .then(async (handle) => {
            const writable = await handle.createWritable();
            await writable.write(key);
            await writable.close();
            return "saved";
        })
            .catch((error) => {
            if (isAbortError(error)) {
                return "cancelled";
            }
            try {
                downloadTextWithAnchor(filename, key, "text/plain");
                return "downloaded";
            }
            catch {
                return "failed";
            }
        });
    }
    try {
        downloadTextWithAnchor(filename, key, "text/plain");
        return Promise.resolve("downloaded");
    }
    catch {
        return Promise.resolve("failed");
    }
}
export function isPersonalKeyFile(file) {
    return file.name.toLowerCase().endsWith(FPKEY_EXTENSION);
}
export async function readPersonalKeyFile(file) {
    const raw = await file.text();
    return raw.trim();
}
//# sourceMappingURL=feedbackDataTransfer.js.map