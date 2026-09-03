import { describe, expect, it } from "vitest";
import { REPORT_DATA_KEYS, REPORT_PREFERENCE_KEYS, REPORT_SESSION_KEYS } from "./reportContextPartitions.js";

describe("reportContextPartitions", () => {
    const preference = REPORT_PREFERENCE_KEYS as readonly string[];
    const session = REPORT_SESSION_KEYS as readonly string[];
    const data = REPORT_DATA_KEYS as readonly string[];

    it("keeps preference/session/data keys disjoint", () => {
        const preferenceSet = new Set(preference);
        const sessionSet = new Set(session);
        const dataSet = new Set(data);

        for (const key of preferenceSet) {
            expect(sessionSet.has(key), `preference∩session: ${key}`).toBe(false);
            expect(dataSet.has(key), `preference∩data: ${key}`).toBe(false);
        }

        for (const key of sessionSet) {
            expect(dataSet.has(key), `session∩data: ${key}`).toBe(false);
        }
    });

    it("has no duplicate keys within each partition array", () => {
        expect(new Set(preference).size).toBe(preference.length);
        expect(new Set(session).size).toBe(session.length);
        expect(new Set(data).size).toBe(data.length);
    });

    it("covers a non-empty union across all partitions", () => {
        const union = new Set<string>([...preference, ...session, ...data]);
        expect(preference.length).toBeGreaterThan(0);
        expect(session.length).toBeGreaterThan(0);
        expect(data.length).toBeGreaterThan(0);
        expect(union.size).toBe(preference.length + session.length + data.length);
        expect(union.size).toBeGreaterThan(preference.length);
        expect(union.size).toBeGreaterThan(session.length);
        expect(union.size).toBeGreaterThan(data.length);
    });
});
