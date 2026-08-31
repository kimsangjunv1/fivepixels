import { useEffect, useMemo, useRef, useState } from "react";
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
    const onListReviewersRef = useRef(onListReviewers);

    useEffect(() => {
        onListReviewersRef.current = onListReviewers;
    }, [onListReviewers]);

    useEffect(() => {
        if (persistenceMode !== "API" || !onListReviewersRef.current || !authorizedAuthorId) {
            setApiTeamMembers(null);
            return;
        }

        let cancelled = false;

        void onListReviewersRef
            .current()
            .then((members) => {
                if (!cancelled) {
                    setApiTeamMembers(members);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setApiTeamMembers(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [authorizedAuthorId, persistenceMode]);

    const teamActor = useMemo(
        () => resolveTeamActor(authorizedAuthorId, teamReviewers, apiTeamMembers, persistenceMode),
        [apiTeamMembers, authorizedAuthorId, persistenceMode, teamReviewers],
    );

    return { teamActor, apiTeamMembers };
}
