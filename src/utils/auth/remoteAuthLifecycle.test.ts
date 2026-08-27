import { describe, expect, it, vi } from "vitest";
import { applyRefreshUser, invokeOptionalLogout, isReportAuthUser, resolveRefreshSessionMethod } from "./remoteAuthLifecycle.js";

describe("remoteAuthLifecycle", () => {
    it("detects a valid auth user payload", () => {
        expect(isReportAuthUser({ id: "u1", name: "Ada" })).toBe(true);
        expect(isReportAuthUser({ id: "", name: "Ada" })).toBe(false);
        expect(isReportAuthUser(undefined)).toBe(false);
    });

    it("invokes logout only when a handler is provided", async () => {
        const logout = vi.fn(async () => undefined);

        await invokeOptionalLogout();
        expect(logout).not.toHaveBeenCalled();

        await invokeOptionalLogout(logout);
        expect(logout).toHaveBeenCalledTimes(1);
    });

    it("updates the session user when refresh returns a user", () => {
        expect(applyRefreshUser({ id: "u2", name: "Bea", email: "bea@example.com" })).toEqual({
            action: "update",
            user: { id: "u2", name: "Bea", email: "bea@example.com" },
        });
        expect(applyRefreshUser(undefined)).toEqual({ action: "keep" });
    });

    it("resolves refresh method from the current session or login method", () => {
        expect(resolveRefreshSessionMethod({ method: "artemis", user: { id: "1", name: "A" } }, "api")).toBe("artemis");
        expect(resolveRefreshSessionMethod(null, "artemis")).toBe("artemis");
        expect(resolveRefreshSessionMethod(null, "api")).toBe("api");
        expect(resolveRefreshSessionMethod(null, "local")).toBe("api");
    });
});
