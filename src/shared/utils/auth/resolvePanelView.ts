import { isRemoteLoginMethod, usesRemoteAuthLogin, type FivePixelsSync } from "@/shared/constants/loginMethod.js";

export type PanelView = "onboarding" | "setup-complete" | "key-issue" | "ready";

export type ResolvePanelViewParams = {
    isPresentationMode: boolean;
    requiresReviewerKey: boolean;
    loginMethod: FivePixelsSync | null;
    /** When false with api/artemis sync, identity uses the local personal-key path. */
    requireAuth: boolean;
    remoteOnboardingCompleted: boolean;
    hasPersistedPersonalKey: boolean;
    selfProfileCompleted: boolean | undefined;
    hasTeamReviewer: boolean;
    authMatched: boolean;
};

export function resolvePanelView({
    isPresentationMode,
    requiresReviewerKey,
    loginMethod,
    requireAuth,
    remoteOnboardingCompleted,
    hasPersistedPersonalKey,
    selfProfileCompleted,
    hasTeamReviewer,
    authMatched,
}: ResolvePanelViewParams): PanelView {
    if (isPresentationMode) {
        return "ready";
    }

    if (usesRemoteAuthLogin(loginMethod, requireAuth)) {
        return remoteOnboardingCompleted ? "ready" : "onboarding";
    }

    // Remote storage without company login: local-style name + personal key identity.
    if (isRemoteLoginMethod(loginMethod) && !requireAuth) {
        if (!hasPersistedPersonalKey) {
            return "onboarding";
        }

        if (selfProfileCompleted === false) {
            return requiresReviewerKey ? "setup-complete" : "ready";
        }

        if (!requiresReviewerKey) {
            return "ready";
        }

        if (!hasTeamReviewer) {
            return "setup-complete";
        }

        if (authMatched) {
            return "ready";
        }

        return "key-issue";
    }

    if (!requiresReviewerKey) {
        return "ready";
    }

    if (!hasPersistedPersonalKey) {
        return "onboarding";
    }

    if (selfProfileCompleted === false) {
        return "setup-complete";
    }

    if (!hasTeamReviewer) {
        return "setup-complete";
    }

    if (authMatched) {
        return "ready";
    }

    return "key-issue";
}
