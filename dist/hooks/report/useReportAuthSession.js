import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersonalKey } from "../usePersonalKey.js";
import { useSelfProfile } from "../useSelfProfile.js";
import { getAuthorIdFromPrivateKey, getAuthorNameFromPrivateKey, hasStoredPersonalKey, parsePrivateKeyBundle, publicKeysMatch, serializePublicKey, } from "../../utils/auth/personalKey.js";
import { buildPresentationViewers, resolveSessionActor } from "../../utils/report/reportTeam.js";
export function useReportAuthSession({ projectId, environment, authors, identify, requireReviewerKey, pixelsMode, }) {
    const { selfProfile, saveSelfProfile, markOnboardingComplete } = useSelfProfile(projectId, environment);
    const requiresReviewerKey = requireReviewerKey || authors.some((author) => Boolean(author.publicKey));
    const isPresentationMode = pixelsMode === "presentation";
    const { personalKey, publicKey, personalKeyRequired, personalKeyPendingRegistration, personalKeyCandidates, authorizedAuthors, issuePersonalKey, issueSelfKey, rotatePersonalKey, insertPersonalKey, clearPersonalKey, signPayload, } = usePersonalKey({
        enabled: isPresentationMode || !requiresReviewerKey || hasStoredPersonalKey(projectId, environment),
        requireKey: requiresReviewerKey,
        projectId,
        environment,
        identify,
        authors,
    });
    const activeIdentify = authorizedAuthors[0] ??
        (selfProfile?.authorId && selfProfile.name ? { id: selfProfile.authorId, name: selfProfile.name } : undefined) ??
        (personalKeyRequired ? undefined : identify);
    const presentationViewers = useMemo(() => buildPresentationViewers(identify, authors), [authors, identify]);
    const [presentationViewerId, setPresentationViewerId] = useState(null);
    const resolvedPresentationViewerId = useMemo(() => {
        if (!isPresentationMode || presentationViewers.length === 0) {
            return null;
        }
        if (presentationViewerId && presentationViewers.some((viewer) => viewer.id === presentationViewerId)) {
            return presentationViewerId;
        }
        return presentationViewers[0]?.id ?? null;
    }, [isPresentationMode, presentationViewerId, presentationViewers]);
    const authorSelectionLocked = Boolean(personalKey);
    const hasPersistedPersonalKey = hasStoredPersonalKey(projectId, environment);
    const isSelfAuthenticated = hasPersistedPersonalKey;
    const authDiagnostics = useMemo(() => {
        const parsedBundle = personalKey ? parsePrivateKeyBundle(personalKey) : null;
        const teamReviewer = parsedBundle ? authors.find((author) => author.id === parsedBundle.authorId) : null;
        const localAuthorName = (parsedBundle?.authorName ?? selfProfile?.name ?? "").trim();
        const expected = {
            projectId,
            environment: environment ?? "",
            authorId: teamReviewer?.id ?? null,
            authorName: teamReviewer?.name?.trim() || null,
            publicKey: teamReviewer?.publicKey?.trim() || null,
        };
        const actual = {
            projectId: parsedBundle?.projectId ?? null,
            environment: parsedBundle?.environment ?? "",
            authorId: parsedBundle?.authorId ?? null,
            authorName: localAuthorName || null,
            publicKey: parsedBundle ? serializePublicKey(parsedBundle.publicKey) : null,
        };
        const items = [
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
    const panelView = useMemo(() => {
        if (isPresentationMode || !requiresReviewerKey) {
            return "ready";
        }
        if (!hasPersistedPersonalKey) {
            return "onboarding";
        }
        if (selfProfile && !selfProfile.completed) {
            return "setup-complete";
        }
        const parsedBundle = personalKey ? parsePrivateKeyBundle(personalKey) : null;
        const teamReviewer = parsedBundle ? authors.find((author) => author.id === parsedBundle.authorId) : null;
        if (!teamReviewer) {
            return "setup-complete";
        }
        if (authDiagnostics.status === "matched") {
            return "ready";
        }
        return "key-issue";
    }, [authDiagnostics.status, authors, hasPersistedPersonalKey, isPresentationMode, personalKey, requiresReviewerKey, selfProfile]);
    useEffect(() => {
        if (selfProfile && !selfProfile.completed && hasPersistedPersonalKey && authorizedAuthors.length > 0) {
            markOnboardingComplete();
        }
    }, [authorizedAuthors.length, hasPersistedPersonalKey, markOnboardingComplete, selfProfile]);
    const completeOnboarding = useCallback(async ({ name }) => {
        const trimmedName = name.trim();
        const authorId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `self-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const issued = await issueSelfKey(authorId, trimmedName);
        saveSelfProfile({ name: trimmedName, authorId, completed: false });
        return { ...issued, authorId };
    }, [issueSelfKey, saveSelfProfile]);
    const restoreFromBackup = useCallback(async (backupKey) => {
        const result = await insertPersonalKey(backupKey);
        if (!result.saved) {
            return { restored: false, reason: result.reason };
        }
        if (!requiresReviewerKey && !result.authorized) {
            return { restored: false, reason: "unauthorized" };
        }
        const authorId = getAuthorIdFromPrivateKey(backupKey);
        const restoredName = getAuthorNameFromPrivateKey(backupKey);
        saveSelfProfile({
            name: restoredName ?? "",
            authorId: authorId ?? "",
            completed: result.authorized || !requiresReviewerKey,
        });
        return { restored: true, name: restoredName, authorized: result.authorized };
    }, [insertPersonalKey, requiresReviewerKey, saveSelfProfile]);
    const skipOnboarding = useCallback(() => {
        markOnboardingComplete();
    }, [markOnboardingComplete]);
    const sessionActor = useMemo(() => resolveSessionActor({
        isPresentationMode,
        presentationViewers,
        presentationViewerId: resolvedPresentationViewerId,
        activeIdentify,
    }), [activeIdentify, isPresentationMode, presentationViewers, resolvedPresentationViewerId]);
    const signCreatePayload = useCallback(async (payload) => {
        const auth = await signPayload("feedback:create", payload);
        return auth ? { ...payload, auth } : payload;
    }, [signPayload]);
    const signUpdatePayload = useCallback(async (payload) => {
        const auth = await signPayload("feedback:update", payload);
        return auth ? { ...payload, auth } : payload;
    }, [signPayload]);
    const signReplyPayload = useCallback(async (payload) => {
        const auth = await signPayload("reply:create", payload);
        return auth ? { ...payload, auth } : payload;
    }, [signPayload]);
    const applyPresentationViewer = useCallback(async (viewerId) => {
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
    }, [clearPersonalKey, insertPersonalKey, isPresentationMode, presentationViewers, saveSelfProfile]);
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
        completeOnboarding,
        restoreFromBackup,
        skipOnboarding,
        sessionActor,
        signCreatePayload,
        signUpdatePayload,
        signReplyPayload,
    };
}
//# sourceMappingURL=useReportAuthSession.js.map