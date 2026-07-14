import { getPersonalKeyStorageKey } from "../constants/storageKeys.js";
const PRIVATE_KEY_PREFIX = "stpk2";
const PUBLIC_KEY_PREFIX = "stpub1";
const ALGORITHM = { name: "ECDSA", namedCurve: "P-256" };
function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function decodeBase64Url(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}
function encodeBytes(value) {
    let binary = "";
    for (const byte of new Uint8Array(value)) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function decodeBytes(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
function stableValue(value) {
    if (Array.isArray(value)) {
        return value.map(stableValue);
    }
    if (value && typeof value === "object") {
        return Object.keys(value)
            .sort()
            .reduce((result, key) => {
            if (key !== "auth") {
                result[key] = stableValue(value[key]);
            }
            return result;
        }, {});
    }
    return value;
}
export function createReportAuthMessage(params) {
    return JSON.stringify(stableValue({
        version: 1,
        projectId: params.projectId,
        environment: params.environment ?? "",
        action: params.action,
        authorId: params.authorId,
        signedAt: params.signedAt,
        payload: params.payload,
    }));
}
export function serializePublicKey(key) {
    return `${PUBLIC_KEY_PREFIX}.${encodeBase64Url(JSON.stringify(key))}`;
}
export function parsePublicKey(key) {
    const [prefix, encoded, ...rest] = key.trim().split(".");
    if (prefix !== PUBLIC_KEY_PREFIX || !encoded || rest.length > 0) {
        return null;
    }
    try {
        return JSON.parse(decodeBase64Url(encoded));
    }
    catch {
        return null;
    }
}
export function publicKeysMatch(left, right) {
    if (left.trim() === right.trim()) {
        return true;
    }
    const leftJwk = parsePublicKey(left);
    const rightJwk = parsePublicKey(right);
    if (!leftJwk || !rightJwk) {
        return false;
    }
    return leftJwk.kty === rightJwk.kty && leftJwk.crv === rightJwk.crv && leftJwk.x === rightJwk.x && leftJwk.y === rightJwk.y;
}
export function serializePrivateKeyBundle(bundle) {
    return `${PRIVATE_KEY_PREFIX}.${encodeBase64Url(JSON.stringify(bundle))}`;
}
export function parsePrivateKeyBundle(key) {
    const [prefix, encoded, ...rest] = key.trim().split(".");
    if (prefix !== PRIVATE_KEY_PREFIX || !encoded || rest.length > 0) {
        return null;
    }
    try {
        const bundle = JSON.parse(decodeBase64Url(encoded));
        return bundle.projectId && bundle.authorId && bundle.privateKey && bundle.publicKey ? bundle : null;
    }
    catch {
        return null;
    }
}
export function resolvePersonalKeyOwner(identify, authors) {
    return identify ?? (authors.length === 1 ? authors[0] : undefined);
}
export async function createReviewerKeyPair(projectId, environment, authorId, authorName) {
    const keyPair = (await crypto.subtle.generateKey(ALGORITHM, true, ["sign", "verify"]));
    const trimmedName = authorName?.trim();
    const bundle = {
        projectId,
        ...(environment ? { environment } : {}),
        authorId,
        ...(trimmedName ? { authorName: trimmedName } : {}),
        privateKey: await crypto.subtle.exportKey("jwk", keyPair.privateKey),
        publicKey: await crypto.subtle.exportKey("jwk", keyPair.publicKey),
    };
    return {
        privateKey: serializePrivateKeyBundle(bundle),
        publicKey: serializePublicKey(bundle.publicKey),
    };
}
export function resolvePersonalKeyAuthor(bundle, identify, authors) {
    const author = identify?.id === bundle.authorId ? identify : authors.find((item) => item.id === bundle.authorId);
    const configuredAuthor = authors.find((item) => item.id === bundle.authorId);
    const publicKey = serializePublicKey(bundle.publicKey);
    const localAuthorName = bundle.authorName?.trim() ?? "";
    const configuredAuthorName = configuredAuthor?.name?.trim() ?? "";
    if (!author || !configuredAuthor?.publicKey || !publicKeysMatch(configuredAuthor.publicKey, publicKey)) {
        return undefined;
    }
    if (localAuthorName && configuredAuthorName && localAuthorName !== configuredAuthorName) {
        return undefined;
    }
    return author;
}
export function savePersonalKey(projectId, environment, key) {
    const bundle = parsePrivateKeyBundle(key);
    if (!bundle ||
        bundle.projectId !== projectId ||
        (bundle.environment ?? "") !== (environment ?? "")) {
        return false;
    }
    localStorage.setItem(getPersonalKeyStorageKey(projectId, environment), key.trim());
    return true;
}
export function readPersonalKey(projectId, environment) {
    const key = localStorage.getItem(getPersonalKeyStorageKey(projectId, environment));
    if (!key || !savePersonalKey(projectId, environment, key)) {
        localStorage.removeItem(getPersonalKeyStorageKey(projectId, environment));
        return null;
    }
    return key;
}
export function hasStoredPersonalKey(projectId, environment) {
    if (typeof localStorage === "undefined") {
        return false;
    }
    try {
        return Boolean(localStorage.getItem(getPersonalKeyStorageKey(projectId, environment)));
    }
    catch {
        return false;
    }
}
export function removePersonalKey(projectId, environment) {
    if (typeof localStorage === "undefined") {
        return;
    }
    try {
        localStorage.removeItem(getPersonalKeyStorageKey(projectId, environment));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function getPublicKeyFromPrivateKey(key) {
    const bundle = parsePrivateKeyBundle(key);
    return bundle ? serializePublicKey(bundle.publicKey) : null;
}
export function getAuthorIdFromPrivateKey(key) {
    const bundle = parsePrivateKeyBundle(key);
    return bundle ? bundle.authorId : null;
}
export function getAuthorNameFromPrivateKey(key) {
    const bundle = parsePrivateKeyBundle(key);
    return bundle?.authorName?.trim() || null;
}
export async function signReportPayload(key, params) {
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
    const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, new TextEncoder().encode(message));
    return {
        author_id: bundle.authorId,
        algorithm: "ECDSA-P256-SHA256",
        action: params.action,
        signed_at: signedAt,
        signature: encodeBytes(signature),
    };
}
export async function verifyReportAuthProof(params) {
    const publicJwk = parsePublicKey(params.publicKey);
    if (!publicJwk ||
        params.proof.algorithm !== "ECDSA-P256-SHA256" ||
        params.proof.action !== params.action) {
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
        return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publicKey, decodeBytes(params.proof.signature), new TextEncoder().encode(message));
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=personalKey.js.map