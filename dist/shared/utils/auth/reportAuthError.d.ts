export type ReportAuthErrorCode = "invalid-registration" | "account-already-exists" | "bad-request" | "unauthorized" | "auth-unavailable";
export type RegistrationErrorKind = "invalid-registration" | "account-already-exists" | "unknown";
export declare class ReportAuthError extends Error {
    readonly code: string;
    readonly status?: number;
    constructor(code: string, message?: string, status?: number);
}
export declare function resolveRegistrationError(error: unknown): RegistrationErrorKind;
//# sourceMappingURL=reportAuthError.d.ts.map