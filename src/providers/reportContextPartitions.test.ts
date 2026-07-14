import { describe, expect, it } from "vitest";
import { REPORT_DATA_KEYS, REPORT_PREFERENCE_KEYS, REPORT_SESSION_KEYS } from "./reportContextPartitions.js";

describe("reportContextPartitions", () => {
    it("keeps preference/session/data keys disjoint", () => {
        const preference = new Set<string>(REPORT_PREFERENCE_KEYS);
        const session = new Set<string>(REPORT_SESSION_KEYS);
        const data = new Set<string>(REPORT_DATA_KEYS);

        for (const key of preference) {
            expect(session.has(key)).toBe(false);
            expect(data.has(key)).toBe(false);
        }

        for (const key of session) {
            expect(data.has(key)).toBe(false);
        }
    });

    it("covers the expected slice sizes", () => {
        expect(REPORT_PREFERENCE_KEYS.length).toBeGreaterThan(40);
        expect(REPORT_SESSION_KEYS.length).toBeGreaterThan(80);
        expect(REPORT_DATA_KEYS.length).toBeGreaterThan(40);
        expect(REPORT_PREFERENCE_KEYS.length + REPORT_SESSION_KEYS.length + REPORT_DATA_KEYS.length).toBe(219);
    });
});
