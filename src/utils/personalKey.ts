import { getPersonalKeyStorageKey } from "@/constants/storageKeys.js";
import type {
    ReportAuthAction,
    ReportAuthProof,
    ReportAuthor,
    ReportIdentify,
} from "@/types/report.js";

const PRIVATE_KEY_PREFIX = "stpk2";
const PUBLIC_KEY_PREFIX = "stpub1";
const ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const;

type ReviewerKeyBundle = {
    projectId: string;
    environment?: string;
    authorId: string;
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
};

function encodeBase64Url(value: string) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function encodeBytes(value: ArrayBuffer) {
    let binary = "";

    for (const byte of new Uint8Array(value)) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBytes(value: string) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function stableValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(stableValue);
    }

    if (value && typeof value === "object") {
        return Object.keys(value as Record<string, unknown>)
            .sort()
            .reduce<Record<string, unknown>>((result, key) => {
                if (key !== "auth") {
                    result[key] = stableValue((value as Record<string, unknown>)[key]);
                }

                return result;
            }, {});
    }

    return value;
}

export function createReportAuthMessage(params: {
    projectId: string;
    environment?: string;
    action: ReportAuthAction;
    authorId: string;
    signedAt: string;
    payload: unknown;
}) {
    return JSON.stringify(
        stableValue({
            version: 1,
            projectId: params.projectId,
            environment: params.environment ?? "",
            action: params.action,
            authorId: params.authorId,
            signedAt: params.signedAt,
            payload: params.payload,
        }),
    );
}

export function serializePublicKey(key: JsonWebKey) {
    return `${PUBLIC_KEY_PREFIX}.${encodeBase64Url(JSON.stringify(key))}`;
}

export function parsePublicKey(key: string): JsonWebKey | null {
    const [prefix, encoded, ...rest] = key.trim().split(".");

    if (prefix !== PUBLIC_KEY_PREFIX || !encoded || rest.length > 0) {
        return null;
    }

    try {
        return JSON.parse(decodeBase64Url(encoded)) as JsonWebKey;
    } catch {
        return null;
    }
}

export function serializePrivateKeyBundle(bundle: ReviewerKeyBundle) {
    return `${PRIVATE_KEY_PREFIX}.${encodeBase64Url(JSON.stringify(bundle))}`;
}

export function parsePrivateKeyBundle(key: string): ReviewerKeyBundle | null {
    const [prefix, encoded, ...rest] = key.trim().split(".");

    if (prefix !== PRIVATE_KEY_PREFIX || !encoded || rest.length > 0) {
        return null;
    }

    try {
        const bundle = JSON.parse(decodeBase64Url(encoded)) as ReviewerKeyBundle;
        return bundle.projectId && bundle.authorId && bundle.privateKey && bundle.publicKey ? bundle : null;
    } catch {
        return null;
    }
}

export function resolvePersonalKeyOwner(identify: ReportIdentify | undefined, authors: ReportAuthor[]) {
    return identify ?? (authors.length === 1 ? authors[0] : undefined);
}

export async function createReviewerKeyPair(
    projectId: string,
    environment: string | undefined,
    authorId: string,
) {
    const keyPair = (await crypto.subtle.generateKey(ALGORITHM, true, ["sign", "verify"])) as CryptoKeyPair;
    const bundle: ReviewerKeyBundle = {
        projectId,
        ...(environment ? { environment } : {}),
        authorId,
        privateKey: await crypto.subtle.exportKey("jwk", keyPair.privateKey),
        publicKey: await crypto.subtle.exportKey("jwk", keyPair.publicKey),
    };

    return {
        privateKey: serializePrivateKeyBundle(bundle),
        publicKey: serializePublicKey(bundle.publicKey),
    };
}

export function resolvePersonalKeyAuthor(
    bundle: ReviewerKeyBundle,
    identify: ReportIdentify | undefined,
    authors: ReportAuthor[],
) {
    const author = identify?.id === bundle.authorId ? identify : authors.find((item) => item.id === bundle.authorId);
    const configuredAuthor = authors.find((item) => item.id === bundle.authorId);
    const publicKey = serializePublicKey(bundle.publicKey);

    if (!author || !configuredAuthor?.publicKey || configuredAuthor.publicKey !== publicKey) {
        return undefined;
    }

    return author;
}

export function savePersonalKey(projectId: string, environment: string | undefined, key: string) {
    const bundle = parsePrivateKeyBundle(key);

    if (
        !bundle ||
        bundle.projectId !== projectId ||
        (bundle.environment ?? "") !== (environment ?? "")
    ) {
        return false;
    }

    localStorage.setItem(getPersonalKeyStorageKey(projectId, environment), key.trim());
    return true;
}

export function readPersonalKey(projectId: string, environment: string | undefined) {
    const key = localStorage.getItem(getPersonalKeyStorageKey(projectId, environment));

    if (!key || !savePersonalKey(projectId, environment, key)) {
        localStorage.removeItem(getPersonalKeyStorageKey(projectId, environment));
        return null;
    }

    return key;
}

export function getPublicKeyFromPrivateKey(key: string) {
    const bundle = parsePrivateKeyBundle(key);
    return bundle ? serializePublicKey(bundle.publicKey) : null;
}

export async function signReportPayload(
    key: string,
    params: {
        projectId: string;
        environment?: string;
        action: ReportAuthAction;
        payload: unknown;
    },
): Promise<ReportAuthProof> {
    const bundle = parsePrivateKeyBundle(key);

    if (!bundle) {
        throw new Error("Invalid reviewer private key");
    }

    const signedAt = new Date().toISOString();
    const message = createReportAuthMessage({
        ...params,
        authorId: bundle.authorId,
        signedAt,
    });
    const privateKey = await crypto.subtle.importKey("jwk", bundle.privateKey, ALGORITHM, false, ["sign"]);
    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        privateKey,
        new TextEncoder().encode(message),
    );

    return {
        author_id: bundle.authorId,
        algorithm: "ECDSA-P256-SHA256",
        action: params.action,
        signed_at: signedAt,
        signature: encodeBytes(signature),
    };
}

export async function verifyReportAuthProof(params: {
    proof: ReportAuthProof;
    publicKey: string;
    projectId: string;
    environment?: string;
    action: ReportAuthAction;
    payload: unknown;
}) {
    const publicJwk = parsePublicKey(params.publicKey);

    if (
        !publicJwk ||
        params.proof.algorithm !== "ECDSA-P256-SHA256" ||
        params.proof.action !== params.action
    ) {
        return false;
    }

    try {
        const publicKey = await crypto.subtle.importKey("jwk", publicJwk, ALGORITHM, false, ["verify"]);
        const message = createReportAuthMessage({
            projectId: params.projectId,
            environment: params.environment,
            action: params.action,
            authorId: params.proof.author_id,
            signedAt: params.proof.signed_at,
            payload: params.payload,
        });

        return crypto.subtle.verify(
            { name: "ECDSA", hash: "SHA-256" },
            publicKey,
            decodeBytes(params.proof.signature),
            new TextEncoder().encode(message),
        );
    } catch {
        return false;
    }
}
