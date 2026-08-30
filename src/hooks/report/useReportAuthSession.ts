import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveFivePixelsSync, resolveRequireAuth, usesRemoteAuthLogin, type FivePixelsSync } from "@/constants/loginMethod.js";
import { usePersonalKey } from "../usePersonalKey.js";
import { useSelfProfile } from "../useSelfProfile.js";
import {
    getAuthorIdFromPrivateKey,
    getAuthorNameFromPrivateKey,
    hasStoredPersonalKey,
    parsePrivateKeyBundle,
    publicKeysMatch,
    serializePublicKey,
} from "@/utils/auth/personalKey.js";
import {
    clearRemoteAuthSession,
    readRemoteAuthSession,
    saveLoginMethod,
    saveRemoteAuthSession,
    type RemoteAuthSession,
} from "@/utils/auth/loginSession.js";
import { applyRefreshUser, invokeOptionalLogout, resolveRefreshSessionMethod, resolveRemoteOnboardingCompleted } from "@/utils/auth/remoteAuthLifecycle.js";
import { ReportAuthError } from "@/utils/auth/reportAuthError.js";
import { resolvePanelView, type PanelView } from "@/utils/auth/resolvePanelView.js";
import { buildPresentationViewers, resolveSessionActor } from "@/utils/report/reportTeam.js";
import type {
    CreateReplyPayload,
    CreateReportFeedbackPayload,
    FivePixelsMode,
    ReportApiLoginPayload,
    ReportApiRegisterPayload,
    ReportAuthHandlers,
    ReportAuthUser,
    ReportAuthor,
    ReportIdentify,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";

export type { PanelView };

type AuthDiagnosticsField = "projectId" | "environment" | "authorId" | "authorName" | "publicKey";
type AuthDiagnosticsStatus = "matched" | "failed" | "disabled";
type AuthDiagnosticsReason =
    | "reviewer-key-not-enforced"
    | "missing-personal-key"
    | "invalid-personal-key-format"
    | "project-mismatch"
    | "environment-mismatch"
    | "missing-team-author"
    | "author-id-mismatch"
    | "author-name-mismatch"
    | "missing-team-public-key"
    | "public-key-mismatch"
    | "matched";

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

export function useReportAuthSession({
    projectId,
    environment,
    authors,
    identify,
    requireReviewerKey,
    pixelsMode,
    sync: syncProp,
    requireAuth: requireAuthProp,
    onApiLogin,
    onApiRegister,
    onApiLogout,
    onApiRefresh,
    onArtemisLogin,
}: UseReportAuthSessionParams) {
    const sync = resolveFivePixelsSync(syncProp);
    const requireAuth = resolveRequireAuth(sync, requireAuthProp);
    const { selfProfile, saveSelfProfile, markOnboardingComplete } = useSelfProfile(projectId, environment);
    const requiresReviewerKey = requireReviewerKey || authors.some((author) => Boolean(author.publicKey));
    const isPresentationMode = pixelsMode === "presentation";
    const [remoteSession, setRemoteSession] = useState<RemoteAuthSession | null>(() => {
        const stored = readRemoteAuthSession(projectId, environment);
        if (!stored) {
            return null;
        }
        if (!usesRemoteAuthLogin(sync, requireAuth) || stored.method !== sync) {
            return null;
        }
        return stored;
    });
    const {
        personalKey,
        publicKey,
        personalKeyRequired: personalKeyRequiredFromKey,
        personalKeyPendingRegistration,
        personalKeyCandidates,
        authorizedAuthors: personalKeyAuthorizedAuthors,
        issuePersonalKey,
        issueSelfKey,
        rotatePersonalKey,
        insertPersonalKey,
        clearPersonalKey,
        signPayload,
    } = usePersonalKey({
        enabled: isPresentationMode || !requiresReviewerKey || hasStoredPersonalKey(projectId, environment),
        requireKey: requiresReviewerKey,
        projectId,
        environment,
        identify,
        authors,
    });
    const loginMethod = sync;
    const isRemoteAuth = usesRemoteAuthLogin(loginMethod, requireAuth);
    const shouldBootstrapRemoteAuth = isRemoteAuth && Boolean(remoteSession) && Boolean(selfProfile?.completed) && Boolean(onApiRefresh);
    const [authBootstrapState, setAuthBootstrapState] = useState<AuthBootstrapState>(() => (shouldBootstrapRemoteAuth ? "pending" : "ready"));
    const authBootstrapKeyRef = useRef(`${projectId}:${environment ?? ""}:${remoteSession?.user.id ?? ""}`);
    useEffect(() => {
        const nextKey = `${projectId}:${environment ?? ""}:${remoteSession?.user.id ?? ""}`;

        if (authBootstrapKeyRef.current !== nextKey) {
            authBootstrapKeyRef.current = nextKey;
            setAuthBootstrapState(shouldBootstrapRemoteAuth ? "pending" : "ready");
        }
    }, [environment, projectId, remoteSession?.user.id, shouldBootstrapRemoteAuth]);

    const remoteOnboardingCompleted = resolveRemoteOnboardingCompleted(isRemoteAuth, selfProfile?.completed, remoteSession);
    const remoteAuthor = useMemo<ReportAuthor | null>(() => {
        const authorId = selfProfile?.authorId || remoteSession?.user.id;
        const name = selfProfile?.name || remoteSession?.user.name;

        if (!isRemoteAuth || !authorId || !name) {
            return null;
        }

        return authors.find((author) => author.id === authorId) ?? { id: authorId, name };
    }, [authors, isRemoteAuth, remoteSession?.user.id, remoteSession?.user.name, selfProfile?.authorId, selfProfile?.name]);
    const authorizedAuthors = remoteOnboardingCompleted && remoteAuthor ? [remoteAuthor] : personalKeyAuthorizedAuthors;
    const personalKeyRequired = remoteOnboardingCompleted ? false : personalKeyRequiredFromKey;
    const activeIdentify =
        authorizedAuthors[0] ??
        (selfProfile?.authorId && selfProfile.name ? { id: selfProfile.authorId, name: selfProfile.name } : undefined) ??
        (personalKeyRequired ? undefined : identify);
    const presentationViewers = useMemo(() => buildPresentationViewers(identify, authors), [authors, identify]);
    const [presentationViewerId, setPresentationViewerId] = useState<string | null>(null);

    useEffect(() => {
        saveLoginMethod(projectId, environment, sync);

        if (!usesRemoteAuthLogin(sync, requireAuth)) {
            clearRemoteAuthSession(projectId, environment);
            setRemoteSession(null);
            return;
        }

        const stored = readRemoteAuthSession(projectId, environment);
        if (!stored || stored.method !== sync) {
            clearRemoteAuthSession(projectId, environment);
            setRemoteSession(null);
            return;
        }

        setRemoteSession(stored);
    }, [environment, projectId, requireAuth, sync]);

    const resolvedPresentationViewerId = useMemo(() => {
        if (!isPresentationMode || presentationViewers.length === 0) {
            return null;
        }

        if (presentationViewerId && presentationViewers.some((viewer) => viewer.id === presentationViewerId)) {
            return presentationViewerId;
        }

        return presentationViewers[0]?.id ?? null;
    }, [isPresentationMode, presentationViewerId, presentationViewers]);

    const sessionActor = useMemo(
        () =>
            resolveSessionActor({
                isPresentationMode,
                presentationViewers,
                presentationViewerId: resolvedPresentationViewerId,
                activeIdentify,
            }),
        [activeIdentify, isPresentationMode, presentationViewers, resolvedPresentationViewerId],
    );

    /** Lock author when a personal key exists, or when company login established the session actor. */
    const authorSelectionLocked = Boolean(personalKey) || (isRemoteAuth && Boolean(sessionActor?.name));
    const hasPersistedPersonalKey = hasStoredPersonalKey(projectId, environment);
    const isSelfAuthenticated = hasPersistedPersonalKey || remoteOnboardingCompleted;
    const authDiagnostics = useMemo<AuthDiagnostics>(() => {
        const parsedBundle = personalKey ? parsePrivateKeyBundle(personalKey) : null;
        const teamReviewer = parsedBundle ? authors.find((author) => author.id === parsedBundle.authorId) : null;
        const localAuthorName = (parsedBundle?.authorName ?? selfProfile?.name ?? "").trim();
        const expected: Record<AuthDiagnosticsField, string | null> = {
            projectId,
            environment: environment ?? "",
            authorId: teamReviewer?.id ?? null,
            authorName: teamReviewer?.name?.trim() || null,
            publicKey: teamReviewer?.publicKey?.trim() || null,
        };
        const actual: Record<AuthDiagnosticsField, string | null> = {
            projectId: parsedBundle?.projectId ?? null,
            environment: parsedBundle?.environment ?? "",
            authorId: parsedBundle?.authorId ?? null,
            authorName: localAuthorName || null,
            publicKey: parsedBundle ? serializePublicKey(parsedBundle.publicKey) : null,
        };
        const items: AuthDiagnosticsItem[] = [
            { field: "projectId", expected: expected.projectId, actual: actual.projectId, matched: expected.projectId === actual.projectId },
            {
                field: "environment",
                expected: expected.environment,
                actual: actual.environment,
                matched: (expected.environment ?? "") === (actual.environment ?? ""),
            },
            { field: "authorId", expected: expected.authorId, actual: actual.authorId, matched: expected.authorId === actual.authorId },
            {
                field: "authorName",
                expected: expected.authorName,
                actual: actual.authorName,
                matched: Boolean(expected.authorName && actual.authorName && expected.authorName === actual.authorName),
            },
            {
                field: "publicKey",
                expected: expected.publicKey,
                actual: actual.publicKey,
                matched: Boolean(expected.publicKey && actual.publicKey && publicKeysMatch(expected.publicKey, actual.publicKey)),
            },
        ];

        if (!requiresReviewerKey) {
            return { status: "disabled", reason: "reviewer-key-not-enforced", items, expected, actual };
        }
        if (!personalKey) {
            return { status: "failed", reason: "missing-personal-key", items, expected, actual };
        }
        if (!parsedBundle) {
            return { status: "failed", reason: "invalid-personal-key-format", items, expected, actual };
        }
        if (parsedBundle.projectId !== projectId) {
            return { status: "failed", reason: "project-mismatch", items, expected, actual };
        }
        if ((parsedBundle.environment ?? "") !== (environment ?? "")) {
            return { status: "failed", reason: "environment-mismatch", items, expected, actual };
        }
        if (!teamReviewer) {
            return { status: "failed", reason: "missing-team-author", items, expected, actual };
        }
        if (expected.authorName && actual.authorName && expected.authorName !== actual.authorName) {
            return { status: "failed", reason: "author-name-mismatch", items, expected, actual };
        }
        if (!teamReviewer.publicKey?.trim()) {
            return { status: "failed", reason: "missing-team-public-key", items, expected, actual };
        }
        if (!actual.publicKey || !publicKeysMatch(teamReviewer.publicKey, actual.publicKey)) {
            return { status: "failed", reason: "public-key-mismatch", items, expected, actual };
        }

        return { status: "matched", reason: "matched", items, expected, actual };
    }, [authors, environment, personalKey, projectId, requiresReviewerKey, selfProfile?.name]);

    const panelView = useMemo<PanelView>(
        () =>
            resolvePanelView({
                isPresentationMode,
                requiresReviewerKey,
                loginMethod,
                requireAuth,
                remoteOnboardingCompleted,
                hasPersistedPersonalKey,
                selfProfileCompleted: selfProfile?.completed,
                hasTeamReviewer: Boolean(personalKey && authors.find((author) => author.id === parsePrivateKeyBundle(personalKey)?.authorId)),
                authMatched: authDiagnostics.status === "matched",
            }),
        [
            authDiagnostics.status,
            authors,
            hasPersistedPersonalKey,
            isPresentationMode,
            loginMethod,
            personalKey,
            remoteOnboardingCompleted,
            requireAuth,
            requiresReviewerKey,
            selfProfile?.completed,
        ],
    );

    useEffect(() => {
        if (isRemoteAuth) {
            return;
        }

        if (selfProfile && !selfProfile.completed && hasPersistedPersonalKey && authorizedAuthors.length > 0) {
            markOnboardingComplete();
        }
    }, [authorizedAuthors.length, hasPersistedPersonalKey, isRemoteAuth, markOnboardingComplete, selfProfile]);

    const completeOnboarding = useCallback(
        async ({ name }: { name: string }) => {
            const trimmedName = name.trim();
            const authorId =
                typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `self-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const issued = await issueSelfKey(authorId, trimmedName);
            saveSelfProfile({ name: trimmedName, authorId, completed: false });
            return { ...issued, authorId };
        },
        [issueSelfKey, saveSelfProfile],
    );

    const restoreFromBackup = useCallback(
        async (backupKey: string) => {
            const result = await insertPersonalKey(backupKey);

            if (!result.saved) {
                return { restored: false as const, reason: result.reason };
            }

            if (!requiresReviewerKey && !result.authorized) {
                return { restored: false as const, reason: "unauthorized" as const };
            }

            const authorId = getAuthorIdFromPrivateKey(backupKey);
            const restoredName = getAuthorNameFromPrivateKey(backupKey);
            saveSelfProfile({
                name: restoredName ?? "",
                authorId: authorId ?? "",
                completed: result.authorized || !requiresReviewerKey,
            });

            return { restored: true as const, name: restoredName, authorized: result.authorized };
        },
        [insertPersonalKey, requiresReviewerKey, saveSelfProfile],
    );

    const skipOnboarding = useCallback(() => {
        markOnboardingComplete();
    }, [markOnboardingComplete]);

    const persistRemoteUser = useCallback(
        (method: "api" | "artemis", user: ReportAuthUser, options?: { resetOnboarding?: boolean }) => {
            const session = { method, user };
            const resetOnboarding = options?.resetOnboarding ?? !selfProfile?.completed;
            saveLoginMethod(projectId, environment, method);
            saveRemoteAuthSession(projectId, environment, session);
            setRemoteSession(session);
            setAuthBootstrapState("ready");
            saveSelfProfile({
                name: user.name.trim(),
                authorId: user.id,
                completed: resetOnboarding ? false : Boolean(selfProfile?.completed),
            });
        },
        [environment, projectId, saveSelfProfile, selfProfile?.completed],
    );

    const loginWithApi = useCallback(
        async (payload: ReportApiLoginPayload) => {
            if (!onApiLogin) {
                throw new ReportAuthError("auth-unavailable", "API login is not configured.");
            }

            const user = await onApiLogin(payload);
            persistRemoteUser("api", user);
            return user;
        },
        [onApiLogin, persistRemoteUser],
    );

    const registerWithApi = useCallback(
        async (payload: ReportApiRegisterPayload) => {
            if (!onApiRegister) {
                throw new ReportAuthError("auth-unavailable", "API registration is not configured.");
            }

            await onApiRegister(payload);
        },
        [onApiRegister],
    );

    const loginWithArtemis = useCallback(async () => {
        if (!onArtemisLogin) {
            throw new ReportAuthError("auth-unavailable", "Artemis login is not configured.");
        }

        const user = await onArtemisLogin();
        persistRemoteUser("artemis", user);
        return user;
    }, [onArtemisLogin, persistRemoteUser]);

    const logoutWithApi = useCallback(async () => {
        try {
            await invokeOptionalLogout(onApiLogout);
        } finally {
            clearRemoteAuthSession(projectId, environment);
            setRemoteSession(null);
            clearPersonalKey();
            setAuthBootstrapState("ready");
        }
    }, [clearPersonalKey, environment, onApiLogout, projectId]);

    const refreshWithApi = useCallback(async () => {
        if (!onApiRefresh) {
            throw new ReportAuthError("auth-unavailable", "API token refresh is not configured.");
        }

        const returned = await onApiRefresh();
        const result = applyRefreshUser(returned);

        if (result.action === "update") {
            const method = resolveRefreshSessionMethod(remoteSession, loginMethod);
            persistRemoteUser(method, result.user, { resetOnboarding: false });
            return result.user;
        }

        return remoteSession?.user;
    }, [loginMethod, onApiRefresh, persistRemoteUser, remoteSession]);

    useEffect(() => {
        if (authBootstrapState !== "pending" || !onApiRefresh || !remoteSession) {
            return;
        }

        let cancelled = false;

        void (async () => {
            try {
                await refreshWithApi();

                if (!cancelled) {
                    setAuthBootstrapState("ready");
                }
            } catch {
                if (cancelled) {
                    return;
                }

                clearRemoteAuthSession(projectId, environment);
                setRemoteSession(null);
                setAuthBootstrapState("failed");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [authBootstrapState, environment, onApiRefresh, projectId, refreshWithApi, remoteSession]);

    const completeRemoteOnboarding = useCallback(() => {
        markOnboardingComplete();
    }, [markOnboardingComplete]);

    const signCreatePayload = useCallback(
        async (payload: CreateReportFeedbackPayload) => {
            const auth = await signPayload("feedback:create", payload);
            return auth ? { ...payload, auth } : payload;
        },
        [signPayload],
    );

    const signUpdatePayload = useCallback(
        async (payload: UpdateReportFeedbackPayload) => {
            const auth = await signPayload("feedback:update", payload);
            return auth ? { ...payload, auth } : payload;
        },
        [signPayload],
    );

    const signReplyPayload = useCallback(
        async (payload: CreateReplyPayload) => {
            const auth = await signPayload("reply:create", payload);
            return auth ? { ...payload, auth } : payload;
        },
        [signPayload],
    );

    const applyPresentationViewer = useCallback(
        async (viewerId: string | null) => {
            if (!isPresentationMode) {
                return;
            }

            const viewer = presentationViewers.find((item) => item.id === viewerId) ?? presentationViewers[0];

            if (!viewer) {
                return;
            }

            setPresentationViewerId(viewer.id);
            saveSelfProfile({
                name: viewer.name,
                authorId: viewer.id,
                completed: true,
            });

            if (viewer.privateKey) {
                await insertPersonalKey(viewer.privateKey);
                return;
            }

            clearPersonalKey();
        },
        [clearPersonalKey, insertPersonalKey, isPresentationMode, presentationViewers, saveSelfProfile],
    );

    useEffect(() => {
        if (!isPresentationMode || presentationViewers.length === 0 || !resolvedPresentationViewerId) {
            return;
        }

        void applyPresentationViewer(resolvedPresentationViewerId);
    }, [applyPresentationViewer, isPresentationMode, presentationViewers.length, resolvedPresentationViewerId]);

    return {
        selfProfile,
        saveSelfProfile,
        markOnboardingComplete,
        requiresReviewerKey,
        isPresentationMode,
        personalKey,
        publicKey,
        personalKeyRequired,
        personalKeyPendingRegistration,
        personalKeyCandidates,
        authorizedAuthors,
        issuePersonalKey,
        issueSelfKey,
        rotatePersonalKey,
        insertPersonalKey,
        clearPersonalKey,
        signPayload,
        activeIdentify,
        presentationViewers,
        presentationViewerId,
        setPresentationViewerId,
        resolvedPresentationViewerId,
        applyPresentationViewer,
        authorSelectionLocked,
        hasPersistedPersonalKey,
        isSelfAuthenticated,
        authDiagnostics,
        panelView,
        authBootstrapState,
        isAuthBootstrapping: authBootstrapState === "pending",
        loginMethod,
        requireAuth,
        loginWithApi,
        registerWithApi,
        logoutWithApi,
        refreshWithApi,
        loginWithArtemis,
        completeRemoteOnboarding,
        completeOnboarding,
        restoreFromBackup,
        skipOnboarding,
        sessionActor,
        signCreatePayload,
        signUpdatePayload,
        signReplyPayload,
    };
}
