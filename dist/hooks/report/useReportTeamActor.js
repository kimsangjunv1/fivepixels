import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterJoinedTeamMembers, resolveTeamActor } from "../../utils/report/teamManagement.js";
export function useReportTeamActor({ authorizedAuthorId, teamReviewers, persistenceMode, onListReviewers }) {
    const [apiTeamDirectory, setApiTeamDirectory] = useState(null);
    const [apiTeamMembersLoading, setApiTeamMembersLoading] = useState(false);
    const apiTeamMembers = useMemo(() => (apiTeamDirectory ? filterJoinedTeamMembers(apiTeamDirectory) : null), [apiTeamDirectory]);
    const onListReviewersRef = useRef(onListReviewers);
    useEffect(() => {
        onListReviewersRef.current = onListReviewers;
    }, [onListReviewers]);
    const refreshTeamMembers = useCallback(async () => {
        if (persistenceMode !== "API" || !onListReviewersRef.current || !authorizedAuthorId) {
            return null;
        }
        setApiTeamMembersLoading(true);
        try {
            const members = await onListReviewersRef.current();
            setApiTeamDirectory(members);
            return members;
        }
        catch {
            setApiTeamDirectory(null);
            return null;
        }
        finally {
            setApiTeamMembersLoading(false);
        }
    }, [authorizedAuthorId, persistenceMode]);
    useEffect(() => {
        if (persistenceMode !== "API" || !onListReviewersRef.current || !authorizedAuthorId) {
            setApiTeamDirectory(null);
            return;
        }
        let cancelled = false;
        setApiTeamMembersLoading(true);
        void onListReviewersRef
            .current()
            .then((members) => {
            if (!cancelled) {
                setApiTeamDirectory(members);
            }
        })
            .catch(() => {
            if (!cancelled) {
                setApiTeamDirectory(null);
            }
        })
            .finally(() => {
            if (!cancelled) {
                setApiTeamMembersLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [authorizedAuthorId, persistenceMode]);
    const teamActor = useMemo(() => resolveTeamActor(authorizedAuthorId, teamReviewers, apiTeamMembers, persistenceMode), [apiTeamMembers, authorizedAuthorId, persistenceMode, teamReviewers]);
    return { teamActor, apiTeamDirectory, apiTeamMembers, apiTeamMembersLoading, refreshTeamMembers };
}
//# sourceMappingURL=useReportTeamActor.js.map