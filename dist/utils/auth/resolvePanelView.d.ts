import { type FivePixelsSync } from "../../constants/loginMethod.js";
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
export declare function resolvePanelView({ isPresentationMode, requiresReviewerKey, loginMethod, requireAuth, remoteOnboardingCompleted, hasPersistedPersonalKey, selfProfileCompleted, hasTeamReviewer, authMatched, }: ResolvePanelViewParams): PanelView;
//# sourceMappingURL=resolvePanelView.d.ts.map