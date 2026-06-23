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
} from "@/utils/personalKey.js";

type UsePersonalKeyOptions = {
    enabled: boolean;
    projectId: string;
    environment?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
};

export function usePersonalKey({ enabled, projectId, environment, identify, authors }: UsePersonalKeyOptions) {
    const [personalKey, setPersonalKey] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(!enabled);

    useEffect(() => {
        if (!enabled) {
            setPersonalKey(null);
            setIsReady(true);
            return;
        }

        setPersonalKey(readPersonalKey(projectId, environment));
        setIsReady(true);
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
            const saved = savePersonalKey(projectId, environment, key);

            if (saved) {
                setPersonalKey(key.trim());
            }

            const bundle = saved ? parsePrivateKeyBundle(key) : null;
            return bundle
                ? {
                      authorized: Boolean(resolvePersonalKeyAuthor(bundle, identify, authors)),
                  }
                : null;
        },
        [authors, environment, identify, projectId],
    );

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

    return {
        personalKey,
        publicKey: personalKey ? getPublicKeyFromPrivateKey(personalKey) : null,
        personalKeyRequired: enabled && isReady && !authorizedAuthor,
        personalKeyPendingRegistration: enabled && Boolean(personalKey) && !authorizedAuthor,
        personalKeyCandidates: authors,
        authorizedAuthors: enabled ? (authorizedAuthor ? [authorizedAuthor] : []) : authors,
        issuePersonalKey,
        rotatePersonalKey,
        insertPersonalKey,
        signPayload,
    };
}
