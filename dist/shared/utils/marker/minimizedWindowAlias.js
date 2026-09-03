import { getMinimizedWindowAliasStorageKey } from "../../../shared/constants/storageKeys.js";
function readAliasMap(projectId) {
    if (typeof window === "undefined") {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(getMinimizedWindowAliasStorageKey(projectId));
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }
        const next = {};
        for (const [reportId, value] of Object.entries(parsed)) {
            if (typeof value === "string" && value.trim()) {
                next[reportId] = value.trim();
            }
        }
        return next;
    }
    catch {
        return {};
    }
}
function writeAliasMap(projectId, aliases) {
    try {
        window.localStorage.setItem(getMinimizedWindowAliasStorageKey(projectId), JSON.stringify(aliases));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function readMinimizedWindowAlias(projectId, reportId) {
    return readAliasMap(projectId)[reportId] ?? "";
}
export function writeMinimizedWindowAlias(projectId, reportId, alias) {
    const aliases = readAliasMap(projectId);
    const trimmed = alias.trim();
    if (!trimmed) {
        delete aliases[reportId];
    }
    else {
        aliases[reportId] = trimmed;
    }
    writeAliasMap(projectId, aliases);
    return trimmed;
}
//# sourceMappingURL=minimizedWindowAlias.js.map