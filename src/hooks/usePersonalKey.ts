import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReportAuthAction, ReportAuthor, ReportIdentify } from "@/types/report.js";
import {
    createReviewerKeyPair,
    getPublicKeyFromPrivateKey,
    parsePrivateKeyBundle,
    readPersonalKey,
    resolvePersonalKeyAuthor,
    resolvePersonalKeyOwner,
    savePersonalKey,
    signReportPayload,
    removePersonalKey,
} from "@/utils/auth/personalKey.js";

const EMPTY_AUTHORIZED_AUTHORS: ReportAuthor[] = [];

type UsePersonalKeyOptions = {
    enabled: boolean;
    requireKey: boolean;
    projectId: string;
    environment?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
};

export function usePersonalKey({ enabled, requireKey, projectId, environment, identify, authors }: UsePersonalKeyOptions) {
    const [personalKey, setPersonalKey] = useState<string | null>(() => (enabled ? readPersonalKey(projectId, environment) : null));

    useEffect(() => {
        if (!enabled) {
            setPersonalKey(null);
            return;
        }

        const sync = () => {
            setPersonalKey(readPersonalKey(projectId, environment));
        };

        sync();
        window.addEventListener("focus", sync);
        window.addEventListener("storage", sync);
        document.addEventListener("visibilitychange", sync);

        return () => {
            window.removeEventListener("focus", sync);
            window.removeEventListener("storage", sync);
            document.removeEventListener("visibilitychange", sync);
        };
    }, [enabled, environment, projectId]);

    const keyBundle = useMemo(() => (personalKey ? parsePrivateKeyBundle(personalKey) : null), [personalKey]);
    const authorizedAuthor = useMemo(
        () => (keyBundle ? resolvePersonalKeyAuthor(keyBundle, identify, authors) : undefined),
        [authors, identify, keyBundle],
    );

    const issuePersonalKey = useCallback(async (authorId?: string) => {
        const owner = authors.find((author) => author.id === authorId) ?? resolvePersonalKeyOwner(identify, authors);

        if (!owner) {
            return null;
        }

        const issued = await createReviewerKeyPair(projectId, environment, owner.id);
        savePersonalKey(projectId, environment, issued.privateKey);
        setPersonalKey(issued.privateKey);
        return issued;
    }, [authors, environment, identify, projectId]);

    const issueSelfKey = useCallback(async (authorId: string, authorName?: string) => {
        const issued = await createReviewerKeyPair(projectId, environment, authorId, authorName);
        savePersonalKey(projectId, environment, issued.privateKey);
        setPersonalKey(issued.privateKey);
        return issued;
    }, [environment, projectId]);

    const rotatePersonalKey = useCallback(async () => {
        if (!authorizedAuthor) {
            return null;
        }

        const issued = await createReviewerKeyPair(projectId, environment, authorizedAuthor.id);
        savePersonalKey(projectId, environment, issued.privateKey);
        setPersonalKey(issued.privateKey);
        return issued;
    }, [authorizedAuthor, environment, projectId]);

    const insertPersonalKey = useCallback(
        async (key: string) => {
            const bundle = parsePrivateKeyBundle(key);

            if (!bundle) {
                return { saved: false as const, reason: "invalid" as const };
            }

            if (bundle.projectId !== projectId || (bundle.environment ?? "") !== (environment ?? "")) {
                return { saved: false as const, reason: "project-mismatch" as const };
            }

            const saved = savePersonalKey(projectId, environment, key);

            if (saved) {
                setPersonalKey(key.trim());
            }

            return {
                saved: true as const,
                authorized: Boolean(resolvePersonalKeyAuthor(bundle, identify, authors)),
            };
        },
        [authors, environment, identify, projectId],
    );

    const clearPersonalKey = useCallback(() => {
        removePersonalKey(projectId, environment);
        setPersonalKey(null);
    }, [environment, projectId]);

    const signPayload = useCallback(
        async (action: ReportAuthAction, payload: unknown) => {
            if (!personalKey || !authorizedAuthor) {
                return null;
            }

            return signReportPayload(personalKey, {
                projectId,
                environment,
                action,
                payload,
            });
        },
        [authorizedAuthor, environment, personalKey, projectId],
    );

    const authorizedAuthors = useMemo(
        () => (requireKey ? (authorizedAuthor ? [authorizedAuthor] : EMPTY_AUTHORIZED_AUTHORS) : authors),
        [authorizedAuthor, authors, requireKey],
    );

    return {
        personalKey,
        publicKey: personalKey ? getPublicKeyFromPrivateKey(personalKey) : null,
        personalKeyRequired: requireKey && !personalKey,
        personalKeyPendingRegistration: requireKey && Boolean(personalKey) && !authorizedAuthor,
        personalKeyCandidates: authors,
        authorizedAuthors,
        issuePersonalKey,
        issueSelfKey,
        rotatePersonalKey,
        insertPersonalKey,
        clearPersonalKey,
        signPayload,
    };
}
