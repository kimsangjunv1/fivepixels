import { getPersonalKeyStorageKey } from "@/constants/storageKeys.js";
import type { ReportAuthor, ReportIdentify } from "@/types/report.js";

const PERSONAL_KEY_PREFIX = "stpk1";

type PersonalKeyPayload = {
    projectId: string;
    environment?: string;
    authorId: string;
    secret: string;
};

type StoredPersonalKey = PersonalKeyPayload & {
    key: string;
    hash: string;
};

function encode(value: string) {
    return encodeURIComponent(value);
}

function decode(value: string) {
    return decodeURIComponent(value);
}

function createSecret() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function hashPersonalKey(key: string) {
    if (typeof crypto !== "undefined" && crypto.subtle) {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    return key;
}

export function createPersonalKey(projectId: string, environment: string | undefined, authorId: string) {
    return [PERSONAL_KEY_PREFIX, encode(projectId), encode(environment ?? ""), encode(authorId), createSecret()].join(".");
}

export function parsePersonalKey(key: string): PersonalKeyPayload | null {
    const [prefix, projectId, environment, authorId, secret, ...rest] = key.trim().split(".");

    if (prefix !== PERSONAL_KEY_PREFIX || !projectId || !authorId || !secret || rest.length > 0) {
        return null;
    }

    try {
        return {
            projectId: decode(projectId),
            ...(environment ? { environment: decode(environment) } : {}),
            authorId: decode(authorId),
            secret,
        };
    } catch {
        return null;
    }
}

export function resolvePersonalKeyAuthor(
    payload: PersonalKeyPayload,
    identify: ReportIdentify | undefined,
    authors: ReportAuthor[],
) {
    if (identify?.id === payload.authorId) {
        return identify;
    }

    return authors.find((author) => author.id === payload.authorId);
}

export function resolvePersonalKeyOwner(identify: ReportIdentify | undefined, authors: ReportAuthor[]) {
    return identify ?? (authors.length === 1 ? authors[0] : undefined);
}

export async function savePersonalKey(
    projectId: string,
    environment: string | undefined,
    key: string,
    identify: ReportIdentify | undefined,
    authors: ReportAuthor[],
) {
    const payload = parsePersonalKey(key);

    if (
        !payload ||
        payload.projectId !== projectId ||
        (payload.environment ?? "") !== (environment ?? "") ||
        !resolvePersonalKeyAuthor(payload, identify, authors)
    ) {
        return false;
    }

    const stored: StoredPersonalKey = {
        ...payload,
        key: key.trim(),
        hash: await hashPersonalKey(key.trim()),
    };
    localStorage.setItem(getPersonalKeyStorageKey(projectId, environment), JSON.stringify(stored));
    return true;
}

export async function readPersonalKey(
    projectId: string,
    environment: string | undefined,
    identify: ReportIdentify | undefined,
    authors: ReportAuthor[],
) {
    const raw = localStorage.getItem(getPersonalKeyStorageKey(projectId, environment));

    if (!raw) {
        return null;
    }

    try {
        const stored = JSON.parse(raw) as StoredPersonalKey;
        const valid = await savePersonalKey(projectId, environment, stored.key, identify, authors);

        if (!valid || stored.hash !== (await hashPersonalKey(stored.key))) {
            localStorage.removeItem(getPersonalKeyStorageKey(projectId, environment));
            return null;
        }

        return stored.key;
    } catch {
        localStorage.removeItem(getPersonalKeyStorageKey(projectId, environment));
        return null;
    }
}
