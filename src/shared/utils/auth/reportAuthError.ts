export type ReportAuthErrorCode = "invalid-registration" | "account-already-exists" | "bad-request" | "unauthorized" | "auth-unavailable";

export type RegistrationErrorKind = "invalid-registration" | "account-already-exists" | "unknown";

type ErrorLike = {
    code?: unknown;
    status?: unknown;
    message?: unknown;
    name?: unknown;
};

export class ReportAuthError extends Error {
    readonly code: string;
    readonly status?: number;

    constructor(code: string, message?: string, status?: number) {
        super(message ?? code);
        this.name = "ReportAuthError";
        this.code = code;
        this.status = status;
    }
}

function readErrorLike(error: unknown): ErrorLike {
    if (error instanceof ReportAuthError) {
        return { code: error.code, status: error.status, message: error.message, name: error.name };
    }

    if (typeof error === "object" && error !== null) {
        return error as ErrorLike;
    }

    if (typeof error === "string") {
        return { message: error };
    }

    return {};
}

function normalizeToken(value: unknown): string {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/[_ ]+/g, "-") : "";
}

export function resolveRegistrationError(error: unknown): RegistrationErrorKind {
    const like = readErrorLike(error);
    const code = normalizeToken(like.code);
    const message = normalizeToken(like.message);
    const status = typeof like.status === "number" ? like.status : Number.parseInt(String(like.status ?? ""), 10);
    const combined = `${code} ${message}`;

    if (status === 409 || code === "account-already-exists" || combined.includes("account-already-exists")) {
        return "account-already-exists";
    }

    if (
        status === 400 ||
        code === "invalid-registration" ||
        code === "bad-request" ||
        combined.includes("invalid-registration") ||
        combined.includes("400bad-request") ||
        combined.includes("bad-request")
    ) {
        return "invalid-registration";
    }

    return "unknown";
}
