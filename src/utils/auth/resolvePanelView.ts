import { isRemoteLoginMethod, type FivePixelsSync } from "@/constants/loginMethod.js";

export type PanelView = "onboarding" | "setup-complete" | "key-issue" | "ready";

export type ResolvePanelViewParams = {
    isPresentationMode: boolean;
    requiresReviewerKey: boolean;
    loginMethod: FivePixelsSync | null;
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
    remoteOnboardingCompleted,
    hasPersistedPersonalKey,
    selfProfileCompleted,
    hasTeamReviewer,
    authMatched,
}: ResolvePanelViewParams): PanelView {
    if (isPresentationMode) {
        return "ready";
    }

    if (isRemoteLoginMethod(loginMethod)) {
        return remoteOnboardingCompleted ? "ready" : "onboarding";
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
