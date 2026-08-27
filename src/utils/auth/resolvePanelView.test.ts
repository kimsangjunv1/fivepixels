import { describe, expect, it } from "vitest";
import { resolvePanelView } from "./resolvePanelView.js";

describe("resolvePanelView", () => {
    const localBase = {
        isPresentationMode: false,
        requiresReviewerKey: true,
        loginMethod: "local" as const,
        requireAuth: false,
        remoteOnboardingCompleted: false,
        hasPersistedPersonalKey: false,
        selfProfileCompleted: undefined as boolean | undefined,
        hasTeamReviewer: false,
        authMatched: false,
    };

    it("keeps local users in onboarding until a personal key exists", () => {
        expect(resolvePanelView(localBase)).toBe("onboarding");
    });

    it("shows the developer approval panel after a local key is issued", () => {
        expect(
            resolvePanelView({
                ...localBase,
                hasPersistedPersonalKey: true,
                selfProfileCompleted: false,
            }),
        ).toBe("setup-complete");
    });

    it("skips the developer approval panel for completed API login", () => {
        expect(
            resolvePanelView({
                ...localBase,
                loginMethod: "api",
                requireAuth: true,
                remoteOnboardingCompleted: true,
                selfProfileCompleted: true,
            }),
        ).toBe("ready");
    });

    it("skips the developer approval panel for completed Artemis login", () => {
        expect(
            resolvePanelView({
                ...localBase,
                loginMethod: "artemis",
                requireAuth: true,
                remoteOnboardingCompleted: true,
                hasPersistedPersonalKey: false,
            }),
        ).toBe("ready");
    });

    it("stays in onboarding until API or Artemis setup finishes", () => {
        expect(
            resolvePanelView({
                ...localBase,
                loginMethod: "api",
                requireAuth: true,
                remoteOnboardingCompleted: false,
                hasPersistedPersonalKey: true,
                selfProfileCompleted: false,
            }),
        ).toBe("onboarding");
    });

    it("stays in onboarding when selfProfile is completed but remote auth session is missing", () => {
        expect(
            resolvePanelView({
                ...localBase,
                loginMethod: "api",
                requireAuth: true,
                remoteOnboardingCompleted: false,
                selfProfileCompleted: true,
                hasPersistedPersonalKey: true,
            }),
        ).toBe("onboarding");
    });

    it("uses personal-key onboarding when api sync has requireAuth false", () => {
        expect(
            resolvePanelView({
                ...localBase,
                loginMethod: "api",
                requireAuth: false,
                requiresReviewerKey: false,
                remoteOnboardingCompleted: false,
                hasPersistedPersonalKey: false,
            }),
        ).toBe("onboarding");

        expect(
            resolvePanelView({
                ...localBase,
                loginMethod: "api",
                requireAuth: false,
                requiresReviewerKey: false,
                hasPersistedPersonalKey: true,
                selfProfileCompleted: false,
            }),
        ).toBe("ready");
    });
});
