import { describe, expect, it } from "vitest";
import { resolveReportVisibility } from "./reportVisibility.js";

describe("resolveReportVisibility", () => {
    it("prefers visibility object values over legacy flat props", () => {
        expect(
            resolveReportVisibility({
                visibility: { enabled: false, devOnly: true, routeKey: "/a" },
                enabled: true,
                devOnly: false,
                routeKey: "/b",
                pathname: "/c",
            }),
        ).toEqual({
            enabled: false,
            devOnly: true,
            routeKey: "/a",
        });
    });

    it("falls back to legacy flat props", () => {
        expect(
            resolveReportVisibility({
                devOnly: true,
                routeKey: "/legacy",
            }),
        ).toEqual({
            enabled: true,
            devOnly: true,
            routeKey: "/legacy",
        });
    });
});
