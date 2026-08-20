import { isRemoteLoginMethod } from "../../constants/loginMethod.js";
export function resolvePanelView({ isPresentationMode, requiresReviewerKey, loginMethod, remoteOnboardingCompleted, hasPersistedPersonalKey, selfProfileCompleted, hasTeamReviewer, authMatched, }) {
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
//# sourceMappingURL=resolvePanelView.js.map