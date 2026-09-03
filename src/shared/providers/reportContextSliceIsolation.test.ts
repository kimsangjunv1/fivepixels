import { describe, expect, it } from "vitest";
import { pickReportSlice, REPORT_DATA_KEYS, REPORT_PREFERENCE_KEYS, REPORT_SESSION_KEYS } from "./reportContextPartitions.js";

/**
 * Documents that slice objects are key-picked independently: changing a DATA key
 * does not alter PREFERENCE / SESSION pick identity when those deps are unchanged.
 * (Provider uses these deps for useMemo isolation — see useReportContextSlices.)
 */
describe("pickReportSlice isolation smoke", () => {
    const allKeys = [...REPORT_PREFERENCE_KEYS, ...REPORT_SESSION_KEYS, ...REPORT_DATA_KEYS] as const;

    function buildState(overrides: Record<string, unknown> = {}) {
        const state = {} as Record<string, unknown>;
        for (const key of allKeys) {
            state[key] = `stable:${key}`;
        }
        return { ...state, ...overrides };
    }

    it("returns only the requested partition keys", () => {
        const state = buildState({ mode: "view", locale: "en", reports: ["a"] });
        const preferences = pickReportSlice(state, REPORT_PREFERENCE_KEYS);
        const session = pickReportSlice(state, REPORT_SESSION_KEYS);
        const data = pickReportSlice(state, REPORT_DATA_KEYS);

        expect(Object.keys(preferences).sort()).toEqual([...REPORT_PREFERENCE_KEYS].sort());
        expect(Object.keys(session).sort()).toEqual([...REPORT_SESSION_KEYS].sort());
        expect(Object.keys(data).sort()).toEqual([...REPORT_DATA_KEYS].sort());

        expect(preferences).not.toHaveProperty("mode");
        expect(preferences).not.toHaveProperty("reports");
        expect(session).not.toHaveProperty("locale");
        expect(session).not.toHaveProperty("reports");
        expect(data).not.toHaveProperty("locale");
        expect(data).not.toHaveProperty("mode");
    });

    it("preference/session picks stay reference-equal for unchanged deps when only data changes", () => {
        const base = buildState();
        const prefA = pickReportSlice(base, REPORT_PREFERENCE_KEYS);
        const sessionA = pickReportSlice(base, REPORT_SESSION_KEYS);
        const dataA = pickReportSlice(base, REPORT_DATA_KEYS);

        const withDataChange = buildState({ reports: ["changed"], isFetching: true });
        const prefB = pickReportSlice(withDataChange, REPORT_PREFERENCE_KEYS);
        const sessionB = pickReportSlice(withDataChange, REPORT_SESSION_KEYS);
        const dataB = pickReportSlice(withDataChange, REPORT_DATA_KEYS);

        // Value equality for untouched partitions (useMemo would skip rebuild when deps match)
        for (const key of REPORT_PREFERENCE_KEYS) {
            expect(prefB[key as keyof typeof prefB]).toBe(prefA[key as keyof typeof prefA]);
        }
        for (const key of REPORT_SESSION_KEYS) {
            expect(sessionB[key as keyof typeof sessionB]).toBe(sessionA[key as keyof typeof sessionA]);
        }

        expect(dataB).not.toEqual(dataA);
        expect(dataB.reports).toEqual(["changed"]);
        expect(dataB.isFetching).toBe(true);
    });

    it("covers ReportContextValue-shaped simulation: every partition key present exactly once", () => {
        const state = buildState();
        const preference = pickReportSlice(state, REPORT_PREFERENCE_KEYS);
        const session = pickReportSlice(state, REPORT_SESSION_KEYS);
        const data = pickReportSlice(state, REPORT_DATA_KEYS);

        const facadeKeys = new Set([...Object.keys(preference), ...Object.keys(session), ...Object.keys(data)]);
        expect(facadeKeys.size).toBe(allKeys.length);
        expect(facadeKeys.size).toBe(REPORT_PREFERENCE_KEYS.length + REPORT_SESSION_KEYS.length + REPORT_DATA_KEYS.length);

        for (const key of allKeys) {
            expect(facadeKeys.has(key)).toBe(true);
        }
    });
});
