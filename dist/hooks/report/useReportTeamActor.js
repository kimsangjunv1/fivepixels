import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveTeamActor } from "../../utils/report/teamManagement.js";
export function useReportTeamActor({ authorizedAuthorId, teamReviewers, persistenceMode, onListReviewers }) {
    const [apiTeamMembers, setApiTeamMembers] = useState(null);
    const [apiTeamMembersLoading, setApiTeamMembersLoading] = useState(false);
    const onListReviewersRef = useRef(onListReviewers);
    const hasListReviewers = Boolean(onListReviewers);
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
            setApiTeamMembers(members);
            return members;
        }
        catch {
            setApiTeamMembers(null);
            return null;
        }
        finally {
            setApiTeamMembersLoading(false);
        }
    }, [authorizedAuthorId, persistenceMode]);
    useEffect(() => {
        if (persistenceMode !== "API" || !authorizedAuthorId) {
            setApiTeamMembers(null);
            return;
        }
        if (!hasListReviewers) {
            return;
        }
        void refreshTeamMembers();
    }, [authorizedAuthorId, hasListReviewers, persistenceMode, refreshTeamMembers]);
    const teamActor = useMemo(() => resolveTeamActor(authorizedAuthorId, teamReviewers, apiTeamMembers, persistenceMode), [apiTeamMembers, authorizedAuthorId, persistenceMode, teamReviewers]);
    return { teamActor, apiTeamMembers, apiTeamMembersLoading, refreshTeamMembers };
}
//# sourceMappingURL=useReportTeamActor.js.map