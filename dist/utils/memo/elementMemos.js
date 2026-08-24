import { getElementMemosStorageKey } from "../../constants/storageKeys.js";
import { resolveProjectId } from "../../utils/report/projectId.js";
const DEFAULT_POSITION = {
    elementXRatio: 0.5,
    elementYRatio: 0.5,
};
function normalizePosition(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return DEFAULT_POSITION;
    }
    const elementXRatio = "elementXRatio" in value && typeof value.elementXRatio === "number" ? value.elementXRatio : DEFAULT_POSITION.elementXRatio;
    const elementYRatio = "elementYRatio" in value && typeof value.elementYRatio === "number" ? value.elementYRatio : DEFAULT_POSITION.elementYRatio;
    return {
        elementXRatio: Math.min(1, Math.max(0, elementXRatio)),
        elementYRatio: Math.min(1, Math.max(0, elementYRatio)),
    };
}
function readMemoMap(projectId, pathname) {
    if (typeof window === "undefined") {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(getElementMemosStorageKey(resolveProjectId(projectId), pathname));
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }
        const next = {};
        for (const [elementKey, value] of Object.entries(parsed)) {
            if (!value || typeof value !== "object" || Array.isArray(value)) {
                continue;
            }
            const text = "text" in value && typeof value.text === "string" ? value.text.trim() : "";
            const updatedAt = "updatedAt" in value && typeof value.updatedAt === "string" ? value.updatedAt : "";
            if (!text) {
                continue;
            }
            const position = normalizePosition(value);
            next[elementKey] = {
                text,
                updatedAt: updatedAt || new Date(0).toISOString(),
                ...position,
            };
        }
        return next;
    }
    catch {
        return {};
    }
}
function writeMemoMap(projectId, pathname, memos) {
    if (typeof window === "undefined") {
        return;
    }
    try {
        const storageKey = getElementMemosStorageKey(resolveProjectId(projectId), pathname);
        if (Object.keys(memos).length === 0) {
            window.localStorage.removeItem(storageKey);
            return;
        }
        window.localStorage.setItem(storageKey, JSON.stringify(memos));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function readElementMemos(projectId, pathname) {
    return readMemoMap(projectId, pathname);
}
export function saveElementMemo(projectId, pathname, elementKey, text, position) {
    const trimmed = text.trim();
    const current = readMemoMap(projectId, pathname);
    const existing = current[elementKey];
    if (!trimmed) {
        delete current[elementKey];
    }
    else {
        current[elementKey] = {
            text: trimmed,
            updatedAt: new Date().toISOString(),
            elementXRatio: position?.elementXRatio ?? existing?.elementXRatio ?? DEFAULT_POSITION.elementXRatio,
            elementYRatio: position?.elementYRatio ?? existing?.elementYRatio ?? DEFAULT_POSITION.elementYRatio,
        };
    }
    writeMemoMap(projectId, pathname, current);
    return current;
}
export function deleteElementMemo(projectId, pathname, elementKey) {
    const current = readMemoMap(projectId, pathname);
    delete current[elementKey];
    writeMemoMap(projectId, pathname, current);
    return current;
}
//# sourceMappingURL=elementMemos.js.map