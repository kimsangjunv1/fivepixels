export class ReportAuthError extends Error {
    constructor(code, message, status) {
        super(message ?? code);
        this.name = "ReportAuthError";
        this.code = code;
        this.status = status;
    }
}
function readErrorLike(error) {
    if (error instanceof ReportAuthError) {
        return { code: error.code, status: error.status, message: error.message, name: error.name };
    }
    if (typeof error === "object" && error !== null) {
        return error;
    }
    if (typeof error === "string") {
        return { message: error };
    }
    return {};
}
function normalizeToken(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/[_ ]+/g, "-") : "";
}
export function resolveRegistrationError(error) {
    const like = readErrorLike(error);
    const code = normalizeToken(like.code);
    const message = normalizeToken(like.message);
    const status = typeof like.status === "number" ? like.status : Number.parseInt(String(like.status ?? ""), 10);
    const combined = `${code} ${message}`;
    if (status === 409 || code === "account-already-exists" || combined.includes("account-already-exists")) {
        return "account-already-exists";
    }
    if (status === 400 ||
        code === "invalid-registration" ||
        code === "bad-request" ||
        combined.includes("invalid-registration") ||
        combined.includes("400bad-request") ||
        combined.includes("bad-request")) {
        return "invalid-registration";
    }
    return "unknown";
}
//# sourceMappingURL=reportAuthError.js.map