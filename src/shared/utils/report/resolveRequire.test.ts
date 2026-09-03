import { describe, expect, it } from "vitest";
import { resolveFivePixelsRequire } from "./resolveRequire.js";

describe("resolveFivePixelsRequire", () => {
    it("defaults authLogin true for remote sync and reviewerKey false", () => {
        expect(resolveFivePixelsRequire({ sync: "api" })).toEqual({ authLogin: true, reviewerKey: false });
        expect(resolveFivePixelsRequire({ sync: "local" })).toEqual({ authLogin: false, reviewerKey: false });
    });

    it("prefers require.authLogin over deprecated requireAuth", () => {
        expect(
            resolveFivePixelsRequire({
                sync: "api",
                require: { authLogin: false },
                requireAuth: true,
            }),
        ).toEqual({ authLogin: false, reviewerKey: false });
    });

    it("falls back to deprecated requireAuth when require.authLogin is omitted", () => {
        expect(resolveFivePixelsRequire({ sync: "api", requireAuth: false })).toEqual({
            authLogin: false,
            reviewerKey: false,
        });
    });

    it("prefers require.reviewerKey over team.requireReviewerKey", () => {
        expect(
            resolveFivePixelsRequire({
                sync: "api",
                require: { reviewerKey: true },
                teamRequireReviewerKey: false,
            }),
        ).toEqual({ authLogin: true, reviewerKey: true });
    });

    it("falls back to deprecated teamRequireReviewerKey", () => {
        expect(
            resolveFivePixelsRequire({
                sync: "api",
                require: { authLogin: false },
                teamRequireReviewerKey: true,
            }),
        ).toEqual({ authLogin: false, reviewerKey: true });
    });
});
