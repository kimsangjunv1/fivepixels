import { describe, expect, it } from "vitest";
import { resolveReportVisibility } from "./reportVisibility.js";

describe("resolveReportVisibility", () => {
    it("resolves visibility object values", () => {
        expect(
            resolveReportVisibility({
                visibility: { enabled: false, devOnly: true, routeKey: "/a" },
            }),
        ).toEqual({
            enabled: false,
            devOnly: true,
            routeKey: "/a",
        });
    });

    it("uses defaults when visibility is omitted", () => {
        expect(resolveReportVisibility({})).toEqual({
            enabled: true,
            devOnly: false,
            routeKey: undefined,
        });
    });
});
