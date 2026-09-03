import { describe, expect, it } from "vitest";
import { ReportAuthError, resolveRegistrationError } from "./reportAuthError.js";

describe("resolveRegistrationError", () => {
    it("maps 400 and invalid-registration to input validation failure", () => {
        expect(resolveRegistrationError(new ReportAuthError("invalid-registration", "bad", 400))).toBe("invalid-registration");
        expect(resolveRegistrationError(new ReportAuthError("BAD_REQUEST", "400BAD_REQUEST", 400))).toBe("invalid-registration");
        expect(resolveRegistrationError({ status: 400, code: "BAD_REQUEST" })).toBe("invalid-registration");
    });

    it("maps 409 account-already-exists to duplicate identity", () => {
        expect(resolveRegistrationError(new ReportAuthError("account-already-exists", "taken", 409))).toBe("account-already-exists");
        expect(resolveRegistrationError({ status: 409, code: "account-already-exists" })).toBe("account-already-exists");
    });

    it("falls back to unknown for unrelated failures", () => {
        expect(resolveRegistrationError(new Error("network"))).toBe("unknown");
    });
});
