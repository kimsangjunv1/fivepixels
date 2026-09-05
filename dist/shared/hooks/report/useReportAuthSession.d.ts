import { type FivePixelsSync } from "../../../shared/constants/loginMethod.js";
import { type PanelView } from "../../../shared/utils/auth/resolvePanelView.js";
import type { CreateReplyPayload, CreateReportFeedbackPayload, FivePixelsMode, ReportApiLoginPayload, ReportApiRegisterPayload, ReportAuthHandlers, ReportAuthUser, ReportAuthor, ReportIdentify, UpdateReportFeedbackPayload } from "../../../shared/types/report.js";
export type { PanelView };
type AuthDiagnosticsField = "projectId" | "environment" | "authorId" | "authorName" | "publicKey";
type AuthDiagnosticsStatus = "matched" | "failed" | "disabled";
type AuthDiagnosticsReason = "reviewer-key-not-enforced" | "missing-personal-key" | "invalid-personal-key-format" | "project-mismatch" | "environment-mismatch" | "missing-team-author" | "author-id-mismatch" | "author-name-mismatch" | "missing-team-public-key" | "public-key-mismatch" | "matched";
type AuthDiagnosticsItem = {
    field: AuthDiagnosticsField;
    expected: string | null;
    actual: string | null;
    matched: boolean;
};
export type AuthDiagnostics = {
    status: AuthDiagnosticsStatus;
    reason: AuthDiagnosticsReason;
    items: AuthDiagnosticsItem[];
    expected: Record<AuthDiagnosticsField, string | null>;
    actual: Record<AuthDiagnosticsField, string | null>;
};
export type AuthBootstrapState = "idle" | "pending" | "ready" | "failed";
export type UseReportAuthSessionParams = {
    projectId: string;
    environment?: string;
    authors: ReportAuthor[];
    identify?: ReportIdentify;
    requireReviewerKey: boolean;
    pixelsMode: FivePixelsMode;
    sync?: FivePixelsSync;
    requireAuth?: boolean;
    onApiLogin?: ReportAuthHandlers["onApiLogin"];
    onApiRegister?: ReportAuthHandlers["onApiRegister"];
    onApiLogout?: ReportAuthHandlers["onApiLogout"];
    onApiRefresh?: ReportAuthHandlers["onApiRefresh"];
    onArtemisLogin?: ReportAuthHandlers["onArtemisLogin"];
};
export declare function useReportAuthSession({ projectId, environment, authors, identify, requireReviewerKey, pixelsMode, sync: syncProp, requireAuth: requireAuthProp, onApiLogin, onApiRegister, onApiLogout, onApiRefresh, onArtemisLogin, }: UseReportAuthSessionParams): {
    selfProfile: import("../useSelfProfile.js").SelfProfile | null;
    saveSelfProfile: (profile: import("../useSelfProfile.js").SelfProfile) => void;
    markOnboardingComplete: () => void;
    requiresReviewerKey: boolean;
    isPresentationMode: boolean;
    personalKey: string | null;
    publicKey: string | null;
    personalKeyRequired: boolean;
    personalKeyPendingRegistration: boolean;
    personalKeyCandidates: ReportAuthor[];
    authorizedAuthors: ReportIdentify[];
    issuePersonalKey: (authorId?: string) => Promise<{
        privateKey: string;
        publicKey: string;
    } | null>;
    issueSelfKey: (authorId: string, authorName?: string) => Promise<{
        privateKey: string;
        publicKey: string;
    }>;
    rotatePersonalKey: () => Promise<{
        privateKey: string;
        publicKey: string;
    } | null>;
    insertPersonalKey: (key: string) => Promise<{
        saved: false;
        reason: "invalid";
        authorized?: undefined;
    } | {
        saved: false;
        reason: "project-mismatch";
        authorized?: undefined;
    } | {
        saved: true;
        authorized: boolean;
        reason?: undefined;
    }>;
    clearPersonalKey: () => void;
    signPayload: (action: import("../../../shared/types/report.js").ReportAuthAction, payload: unknown) => Promise<import("../../../shared/types/report.js").ReportAuthProof | null>;
    activeIdentify: ReportIdentify;
    presentationViewers: import("../../../shared/utils/report/reportTeam.js").PresentationViewer[];
    presentationViewerId: string | null;
    setPresentationViewerId: import("react").Dispatch<import("react").SetStateAction<string | null>>;
    resolvedPresentationViewerId: string | null;
    applyPresentationViewer: (viewerId: string | null) => Promise<void>;
    authorSelectionLocked: boolean;
    hasPersistedPersonalKey: boolean;
    isSelfAuthenticated: boolean;
    authDiagnostics: AuthDiagnostics;
    panelView: PanelView;
    authBootstrapState: AuthBootstrapState;
    isAuthBootstrapping: boolean;
    loginMethod: "local" | "api" | "artemis";
    requireAuth: boolean;
    loginWithApi: (payload: ReportApiLoginPayload) => Promise<ReportAuthUser>;
    registerWithApi: (payload: ReportApiRegisterPayload) => Promise<void>;
    logoutWithApi: () => Promise<void>;
    refreshWithApi: () => Promise<ReportAuthUser | undefined>;
    loginWithArtemis: () => Promise<ReportAuthUser>;
    completeRemoteOnboarding: () => void;
    completeOnboarding: ({ name }: {
        name: string;
    }) => Promise<{
        authorId: string;
        privateKey: string;
        publicKey: string;
    }>;
    restoreFromBackup: (backupKey: string) => Promise<{
        restored: false;
        reason: "invalid" | "project-mismatch";
        name?: undefined;
        authorized?: undefined;
    } | {
        restored: false;
        reason: "unauthorized";
        name?: undefined;
        authorized?: undefined;
    } | {
        restored: true;
        name: string | null;
        authorized: boolean;
        reason?: undefined;
    }>;
    skipOnboarding: () => void;
    sessionActor: import("../../../shared/utils/report/reportTeam.js").SessionActor | null;
    signCreatePayload: (payload: CreateReportFeedbackPayload) => Promise<CreateReportFeedbackPayload>;
    signUpdatePayload: (payload: UpdateReportFeedbackPayload) => Promise<Partial<Pick<import("../../../shared/types/report.js").ReportFeedback, "auth" | "cases" | "replies" | "status" | "report_id" | "report_type" | "category" | "field_values" | "integrations">>>;
    signReplyPayload: (payload: CreateReplyPayload) => Promise<CreateReplyPayload>;
};
//# sourceMappingURL=useReportAuthSession.d.ts.map