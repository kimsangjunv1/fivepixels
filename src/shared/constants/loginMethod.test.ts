import { describe, expect, it } from "vitest";
import { resolveFivePixelsSync, resolveRequireAuth, usesRemoteAuthLogin } from "./loginMethod.js";

describe("loginMethod helpers", () => {
    it("resolves sync defaults to local", () => {
        expect(resolveFivePixelsSync(undefined)).toBe("local");
        expect(resolveFivePixelsSync("api")).toBe("api");
    });

    it("defaults requireAuth to true for remote sync and false for local", () => {
        expect(resolveRequireAuth("local")).toBe(false);
        expect(resolveRequireAuth("api")).toBe(true);
        expect(resolveRequireAuth("artemis")).toBe(true);
        expect(resolveRequireAuth("api", false)).toBe(false);
        expect(resolveRequireAuth("local", true)).toBe(false);
    });

    it("uses remote auth login only when sync is remote and requireAuth is true", () => {
        expect(usesRemoteAuthLogin("api", true)).toBe(true);
        expect(usesRemoteAuthLogin("api", false)).toBe(false);
        expect(usesRemoteAuthLogin("local", true)).toBe(false);
    });
});
