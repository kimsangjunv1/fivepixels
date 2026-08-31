import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReportAuthor } from "@/types/report.js";
import type { PersistenceStatus } from "@/utils/shared/storage.js";
import { resolveTeamActor } from "@/utils/report/teamManagement.js";

type UseReportTeamActorParams = {
    authorizedAuthorId: string | null;
    teamReviewers: ReportAuthor[];
    persistenceMode: PersistenceStatus["mode"];
    onListReviewers?: () => Promise<ReportAuthor[]>;
};

export function useReportTeamActor({ authorizedAuthorId, teamReviewers, persistenceMode, onListReviewers }: UseReportTeamActorParams) {
    const [apiTeamMembers, setApiTeamMembers] = useState<ReportAuthor[] | null>(null);
    const [apiTeamMembersLoading, setApiTeamMembersLoading] = useState(false);
    const onListReviewersRef = useRef(onListReviewers);

    useEffect(() => {
        onListReviewersRef.current = onListReviewers;
    }, [onListReviewers]);

    const refreshTeamMembers = useCallback(async (): Promise<ReportAuthor[] | null> => {
        if (persistenceMode !== "API" || !onListReviewersRef.current || !authorizedAuthorId) {
            setApiTeamMembers(null);
            return null;
        }

        setApiTeamMembersLoading(true);
        try {
            const members = await onListReviewersRef.current();
            setApiTeamMembers(members);
            return members;
        } catch {
            setApiTeamMembers(null);
            return null;
        } finally {
            setApiTeamMembersLoading(false);
        }
    }, [authorizedAuthorId, persistenceMode]);

    useEffect(() => {
        void refreshTeamMembers();
    }, [refreshTeamMembers]);

    const teamActor = useMemo(
        () => resolveTeamActor(authorizedAuthorId, teamReviewers, apiTeamMembers, persistenceMode),
        [apiTeamMembers, authorizedAuthorId, persistenceMode, teamReviewers],
    );

    return { teamActor, apiTeamMembers, apiTeamMembersLoading, refreshTeamMembers };
}
