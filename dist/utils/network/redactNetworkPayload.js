const SENSITIVE_HEADER_NAMES = new Set(["authorization", "cookie", "set-cookie", "x-api-key"]);
const SENSITIVE_JSON_KEYS = /password|token|secret|credential|api[_-]?key/i;
export function redactHeaderValue(name, value) {
    if (SENSITIVE_HEADER_NAMES.has(name.toLowerCase())) {
        return "[redacted]";
    }
    return value;
}
export function redactJsonLikeText(text) {
    if (!text.trim()) {
        return text;
    }
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(redactJsonValue(parsed), null, 2);
    }
    catch {
        return text;
    }
}
function redactJsonValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => redactJsonValue(item));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, nested]) => [
            key,
            SENSITIVE_JSON_KEYS.test(key) ? "[redacted]" : redactJsonValue(nested),
        ]));
    }
    return value;
}
//# sourceMappingURL=redactNetworkPayload.js.map