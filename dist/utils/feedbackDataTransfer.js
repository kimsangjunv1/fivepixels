import { getReportsStorageKey } from "../constants/storageKeys.js";
import { readAllReportsFromStorage, writeAllReportsToStorage } from "../storage/local/localStorageAdapter.js";
import { validateFeedbackImportArray } from "./validateFeedbackImport.js";
const JSON_FILE_TYPES = [
    {
        description: "JSON",
        accept: { "application/json": [".json"] },
    },
];
export function getFeedbackStorageKey({ projectId, environment }) {
    return getReportsStorageKey(projectId, environment);
}
export function readAllFeedback({ projectId, environment }) {
    return readAllReportsFromStorage(getFeedbackStorageKey({ projectId, environment }));
}
export function writeAllFeedback(scope, items) {
    writeAllReportsToStorage(getFeedbackStorageKey(scope), items);
}
export function parseFeedbackImportJson(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new Error("JSON 형식이 올바르지 않아요.");
    }
    return validateFeedbackImportArray(parsed);
}
export function createFeedbackBackupFilename(projectId, environment) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const envSuffix = environment ? `-${environment}` : "";
    return `stitchable-feedback-backup-${projectId}${envSuffix}-${timestamp}.json`;
}
function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError";
}
const SHADOW_HOST_ID = "stitchable-root";
const SHADOW_MOUNT_ATTR = "data-stitchable-mount";
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
export function downloadFeedbackJson(filename, items) {
    if (typeof window === "undefined") {
        return Promise.resolve("failed");
    }
    const json = JSON.stringify(items, null, 2);
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
//# sourceMappingURL=feedbackDataTransfer.js.map