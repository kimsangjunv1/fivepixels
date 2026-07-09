import { useCallback, useEffect, useMemo, useState } from "react";
import { createReviewerKeyPair, getPublicKeyFromPrivateKey, parsePrivateKeyBundle, readPersonalKey, resolvePersonalKeyAuthor, resolvePersonalKeyOwner, savePersonalKey, signReportPayload, removePersonalKey, } from "../utils/personalKey.js";
const EMPTY_AUTHORIZED_AUTHORS = [];
export function usePersonalKey({ enabled, requireKey, projectId, environment, identify, authors }) {
    const [personalKey, setPersonalKey] = useState(() => (enabled ? readPersonalKey(projectId, environment) : null));
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
    const authorizedAuthor = useMemo(() => (keyBundle ? resolvePersonalKeyAuthor(keyBundle, identify, authors) : undefined), [authors, identify, keyBundle]);
    const issuePersonalKey = useCallback(async (authorId) => {
        const owner = authors.find((author) => author.id === authorId) ?? resolvePersonalKeyOwner(identify, authors);
        if (!owner) {
            return null;
        }
        const issued = await createReviewerKeyPair(projectId, environment, owner.id);
        savePersonalKey(projectId, environment, issued.privateKey);
        setPersonalKey(issued.privateKey);
        return issued;
    }, [authors, environment, identify, projectId]);
    const issueSelfKey = useCallback(async (authorId, authorName) => {
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
    const insertPersonalKey = useCallback(async (key) => {
        const bundle = parsePrivateKeyBundle(key);
        if (!bundle) {
            return { saved: false, reason: "invalid" };
        }
        if (bundle.projectId !== projectId || (bundle.environment ?? "") !== (environment ?? "")) {
            return { saved: false, reason: "project-mismatch" };
        }
        const saved = savePersonalKey(projectId, environment, key);
        if (saved) {
            setPersonalKey(key.trim());
        }
        return {
            saved: true,
            authorized: Boolean(resolvePersonalKeyAuthor(bundle, identify, authors)),
        };
    }, [authors, environment, identify, projectId]);
    const clearPersonalKey = useCallback(() => {
        removePersonalKey(projectId, environment);
        setPersonalKey(null);
    }, [environment, projectId]);
    const signPayload = useCallback(async (action, payload) => {
        if (!personalKey || !authorizedAuthor) {
            return null;
        }
        return signReportPayload(personalKey, {
            projectId,
            environment,
            action,
            payload,
        });
    }, [authorizedAuthor, environment, personalKey, projectId]);
    const authorizedAuthors = useMemo(() => (requireKey ? (authorizedAuthor ? [authorizedAuthor] : EMPTY_AUTHORIZED_AUTHORS) : authors), [authorizedAuthor, authors, requireKey]);
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
//# sourceMappingURL=usePersonalKey.js.map