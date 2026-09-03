import { getMinimizedWindowAliasStorageKey } from "@/shared/constants/storageKeys.js";

type AliasMap = Record<string, string>;

function readAliasMap(projectId: string): AliasMap {
    if (typeof window === "undefined") {
        return {};
    }

    try {
        const raw = window.localStorage.getItem(getMinimizedWindowAliasStorageKey(projectId));

        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw) as unknown;

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }

        const next: AliasMap = {};

        for (const [reportId, value] of Object.entries(parsed)) {
            if (typeof value === "string" && value.trim()) {
                next[reportId] = value.trim();
            }
        }

        return next;
    } catch {
        return {};
    }
}

function writeAliasMap(projectId: string, aliases: AliasMap) {
    try {
        window.localStorage.setItem(getMinimizedWindowAliasStorageKey(projectId), JSON.stringify(aliases));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function readMinimizedWindowAlias(projectId: string, reportId: string) {
    return readAliasMap(projectId)[reportId] ?? "";
}

export function writeMinimizedWindowAlias(projectId: string, reportId: string, alias: string) {
    const aliases = readAliasMap(projectId);
    const trimmed = alias.trim();

    if (!trimmed) {
        delete aliases[reportId];
    } else {
        aliases[reportId] = trimmed;
    }

    writeAliasMap(projectId, aliases);

    return trimmed;
}
