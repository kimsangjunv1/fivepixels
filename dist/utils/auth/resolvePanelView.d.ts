import { type LoginMethod } from "../../constants/loginMethod.js";
export type PanelView = "onboarding" | "setup-complete" | "key-issue" | "ready";
export type ResolvePanelViewParams = {
    isPresentationMode: boolean;
    requiresReviewerKey: boolean;
    loginMethod: LoginMethod | null;
    remoteOnboardingCompleted: boolean;
    hasPersistedPersonalKey: boolean;
    selfProfileCompleted: boolean | undefined;
    hasTeamReviewer: boolean;
    authMatched: boolean;
};
export declare function resolvePanelView({ isPresentationMode, requiresReviewerKey, loginMethod, remoteOnboardingCompleted, hasPersistedPersonalKey, selfProfileCompleted, hasTeamReviewer, authMatched, }: ResolvePanelViewParams): PanelView;
//# sourceMappingURL=resolvePanelView.d.ts.map