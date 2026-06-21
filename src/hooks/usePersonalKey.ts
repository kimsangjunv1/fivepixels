import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReportAuthor, ReportIdentify } from "@/types/report.js";
import {
    createPersonalKey,
    parsePersonalKey,
    readPersonalKey,
    resolvePersonalKeyAuthor,
    resolvePersonalKeyOwner,
    savePersonalKey,
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
        let active = true;

        if (!enabled) {
            setPersonalKey(null);
            setIsReady(true);
            return;
        }

        setIsReady(false);
        void readPersonalKey(projectId, environment, identify, authors).then((key) => {
            if (active) {
                setPersonalKey(key);
                setIsReady(true);
            }
        });

        return () => {
            active = false;
        };
    }, [authors, enabled, environment, identify, projectId]);

    const authorizedAuthors = useMemo(() => {
        if (!enabled) {
            return authors;
        }

        const payload = personalKey ? parsePersonalKey(personalKey) : null;
        const author = payload ? resolvePersonalKeyAuthor(payload, identify, authors) : undefined;
        return author ? [author] : [];
    }, [authors, enabled, identify, personalKey]);

    const issuePersonalKey = useCallback(async () => {
        const owner = resolvePersonalKeyOwner(identify, authors);

        if (!owner) {
            return null;
        }

        const key = createPersonalKey(projectId, environment, owner.id);
        await savePersonalKey(projectId, environment, key, identify, authors);
        setPersonalKey(key);
        return key;
    }, [authors, environment, identify, projectId]);

    const insertPersonalKey = useCallback(
        async (key: string) => {
            const saved = await savePersonalKey(projectId, environment, key, identify, authors);

            if (saved) {
                setPersonalKey(key.trim());
            }

            return saved;
        },
        [authors, environment, identify, projectId],
    );

    return {
        personalKey,
        personalKeyRequired: enabled && isReady && !personalKey,
        authorizedAuthors,
        issuePersonalKey,
        insertPersonalKey,
    };
}
