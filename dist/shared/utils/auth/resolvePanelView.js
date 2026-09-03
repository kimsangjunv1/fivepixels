import { isRemoteLoginMethod, usesRemoteAuthLogin } from "../../../shared/constants/loginMethod.js";
export function resolvePanelView({ isPresentationMode, requiresReviewerKey, loginMethod, requireAuth, remoteOnboardingCompleted, hasPersistedPersonalKey, selfProfileCompleted, hasTeamReviewer, authMatched, }) {
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
//# sourceMappingURL=resolvePanelView.js.map