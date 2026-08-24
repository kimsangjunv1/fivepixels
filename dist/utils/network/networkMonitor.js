import { parseApiFlowUrl } from "./formatApiFlowEntry.js";
const MAX_ENTRIES = 100;
const MAX_BODY_LENGTH = 32768;
const FAILURE_ALERT_TTL_MS = 30000;
let installCount = 0;
let originalFetch = null;
let originalXhrOpen = null;
let originalXhrSend = null;
let entries = [];
let dismissedFailureAlertId = null;
const listeners = new Set();
let failureAlertTimeoutId = null;
const EMPTY_SNAPSHOT = { entries: [], activeFailureAlert: null };
let cachedSnapshot = EMPTY_SNAPSHOT;
let entryCounter = 0;
function createEntryId() {
    entryCounter += 1;
    return `api-flow-${entryCounter}-${Date.now()}`;
}
function resolveActiveFailureAlert() {
    const latestFailure = entries.find((entry) => !entry.ok) ?? null;
    if (!latestFailure || latestFailure.id === dismissedFailureAlertId) {
        return null;
    }
    if (Date.now() - latestFailure.timestamp > FAILURE_ALERT_TTL_MS) {
        return null;
    }
    return latestFailure;
}
function scheduleFailureAlertExpiry(entry) {
    if (typeof window === "undefined") {
        return;
    }
    if (failureAlertTimeoutId !== null) {
        window.clearTimeout(failureAlertTimeoutId);
    }
    const remainingMs = FAILURE_ALERT_TTL_MS - (Date.now() - entry.timestamp);
    if (remainingMs <= 0) {
        failureAlertTimeoutId = null;
        return;
    }
    failureAlertTimeoutId = window.setTimeout(() => {
        failureAlertTimeoutId = null;
        emitChange();
    }, remainingMs);
}
function rebuildSnapshot() {
    const activeFailureAlert = resolveActiveFailureAlert();
    cachedSnapshot = {
        entries,
        activeFailureAlert,
    };
    if (activeFailureAlert) {
        scheduleFailureAlertExpiry(activeFailureAlert);
        return;
    }
    if (typeof window !== "undefined" && failureAlertTimeoutId !== null) {
        window.clearTimeout(failureAlertTimeoutId);
        failureAlertTimeoutId = null;
    }
}
function emitChange() {
    rebuildSnapshot();
    for (const listener of listeners) {
        listener();
    }
}
function truncateBody(text) {
    if (text.length <= MAX_BODY_LENGTH) {
        return text;
    }
    return `${text.slice(0, MAX_BODY_LENGTH)}\n… [truncated]`;
}
function serializeRequestBody(body) {
    if (body == null) {
        return null;
    }
    if (typeof body === "string") {
        return truncateBody(body);
    }
    if (body instanceof URLSearchParams) {
        return truncateBody(body.toString());
    }
    if (body instanceof FormData) {
        return "[FormData]";
    }
    if (body instanceof Blob) {
        return `[Blob ${body.type || "unknown"}]`;
    }
    if (body instanceof ArrayBuffer) {
        return `[ArrayBuffer ${body.byteLength} bytes]`;
    }
    return "[unsupported request body]";
}
function pushEntry(entry) {
    entries = [entry, ...entries].slice(0, MAX_ENTRIES);
    if (!entry.ok) {
        dismissedFailureAlertId = null;
    }
    emitChange();
}
function buildEntryBase(method, url) {
    const parsed = parseApiFlowUrl(url);
    return {
        id: createEntryId(),
        timestamp: Date.now(),
        method: method.toUpperCase(),
        url,
        pathname: parsed.pathname,
        queryParams: parsed.queryParams,
    };
}
async function readResponseBody(response) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/") || contentType.includes("application/octet-stream")) {
        return `[binary ${contentType}]`;
    }
    try {
        const text = await response.clone().text();
        return truncateBody(text);
    }
    catch {
        return null;
    }
}
function finalizeEntry(base, params) {
    pushEntry({
        ...base,
        status: params.status,
        ok: params.ok,
        durationMs: Date.now() - params.startedAt,
        requestBody: params.requestBody,
        responseBody: params.responseBody,
        errorMessage: params.errorMessage,
        failureKind: params.failureKind,
    });
}
async function readRequestBodyFromRequest(request) {
    try {
        const cloned = request.clone();
        const text = await cloned.text();
        return text ? truncateBody(text) : null;
    }
    catch {
        return null;
    }
}
function toRequest(input, init) {
    if (input instanceof Request) {
        return init ? new Request(input, init) : input;
    }
    const base = typeof window !== "undefined" ? window.location.href : "http://localhost/";
    const resolved = input instanceof URL ? input : new URL(String(input), base);
    return new Request(resolved, init);
}
async function recordFetch(input, init) {
    if (!originalFetch) {
        return undefined;
    }
    const startedAt = Date.now();
    const request = toRequest(input, init);
    const method = request.method;
    const url = request.url;
    const base = buildEntryBase(method, url);
    const requestBody = init?.body != null
        ? serializeRequestBody(init.body)
        : request.method === "GET" || request.method === "HEAD"
            ? null
            : await readRequestBodyFromRequest(request);
    try {
        const response = await originalFetch(request);
        const responseBody = await readResponseBody(response);
        const ok = response.ok;
        finalizeEntry(base, {
            startedAt,
            status: response.status,
            ok,
            requestBody,
            responseBody,
            errorMessage: ok ? null : response.statusText || null,
            failureKind: ok ? null : "http",
        });
        return response;
    }
    catch (error) {
        finalizeEntry(base, {
            startedAt,
            status: null,
            ok: false,
            requestBody,
            responseBody: null,
            errorMessage: error instanceof Error ? error.message : String(error),
            failureKind: "network",
        });
        throw error;
    }
}
function patchFetch() {
    if (typeof window === "undefined" || originalFetch) {
        return;
    }
    originalFetch = window.fetch.bind(window);
    window.fetch = ((input, init) => recordFetch(input, init));
}
function restoreFetch() {
    if (typeof window === "undefined" || !originalFetch) {
        return;
    }
    window.fetch = originalFetch;
    originalFetch = null;
}
function patchXhr() {
    if (typeof window === "undefined" || originalXhrOpen) {
        return;
    }
    originalXhrOpen = XMLHttpRequest.prototype.open;
    originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function open(method, url, async, username, password) {
        const tracked = this;
        tracked.__fpMethod = method;
        tracked.__fpUrl = typeof url === "string" ? url : url.toString();
        return originalXhrOpen.call(this, method, url, async ?? true, username, password);
    };
    XMLHttpRequest.prototype.send = function send(body) {
        const tracked = this;
        const method = tracked.__fpMethod ?? "GET";
        const url = tracked.__fpUrl ?? "";
        const base = buildEntryBase(method, url);
        const requestBody = serializeRequestBody(body ?? null);
        const startedAt = Date.now();
        let recorded = false;
        const finalizeFromXhr = (failureKind, errorMessage) => {
            if (recorded) {
                return;
            }
            recorded = true;
            const status = tracked.status || null;
            const ok = tracked.status >= 200 && tracked.status < 400 && failureKind === null;
            finalizeEntry(base, {
                startedAt,
                status,
                ok,
                requestBody,
                responseBody: typeof tracked.responseText === "string" && tracked.responseText ? truncateBody(tracked.responseText) : null,
                errorMessage,
                failureKind,
            });
        };
        this.addEventListener("loadend", () => {
            if (recorded) {
                return;
            }
            if (tracked.status === 0) {
                finalizeFromXhr("network", "Network request failed");
                return;
            }
            if (tracked.status >= 400) {
                finalizeFromXhr("http", tracked.statusText || null);
                return;
            }
            finalizeFromXhr(null, null);
        }, { once: true });
        this.addEventListener("error", () => {
            finalizeFromXhr("network", "Network request failed");
        }, { once: true });
        this.addEventListener("timeout", () => {
            finalizeFromXhr("network", "Network request timed out");
        }, { once: true });
        return originalXhrSend.call(this, body);
    };
}
function restoreXhr() {
    if (typeof window === "undefined" || !originalXhrOpen || !originalXhrSend) {
        return;
    }
    XMLHttpRequest.prototype.open = originalXhrOpen;
    XMLHttpRequest.prototype.send = originalXhrSend;
    originalXhrOpen = null;
    originalXhrSend = null;
}
export function installNetworkMonitor() {
    installCount += 1;
    if (installCount !== 1) {
        return;
    }
    patchFetch();
    patchXhr();
}
export function uninstallNetworkMonitor() {
    installCount = Math.max(0, installCount - 1);
    if (installCount !== 0) {
        return;
    }
    restoreFetch();
    restoreXhr();
}
export function subscribeNetworkMonitor(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
export function getNetworkMonitorSnapshot() {
    return cachedSnapshot;
}
export function getServerNetworkMonitorSnapshot() {
    return EMPTY_SNAPSHOT;
}
export function dismissNetworkFailureAlert(entryId) {
    dismissedFailureAlertId = entryId;
    emitChange();
}
export function clearNetworkMonitorEntries() {
    entries = [];
    dismissedFailureAlertId = null;
    emitChange();
}
export function getApiFlowEntryById(entryId) {
    return entries.find((entry) => entry.id === entryId);
}
/** Test helper */
export function resetNetworkMonitorForTests() {
    entries = [];
    dismissedFailureAlertId = null;
    entryCounter = 0;
    installCount = 0;
    cachedSnapshot = EMPTY_SNAPSHOT;
    if (typeof window !== "undefined" && failureAlertTimeoutId !== null) {
        window.clearTimeout(failureAlertTimeoutId);
        failureAlertTimeoutId = null;
    }
    restoreFetch();
    restoreXhr();
    listeners.clear();
}
//# sourceMappingURL=networkMonitor.js.map