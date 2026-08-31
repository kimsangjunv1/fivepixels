import { useEffect, useMemo, useRef, useState } from "react";
import { resolveTeamActor } from "../../utils/report/teamManagement.js";
export function useReportTeamActor({ authorizedAuthorId, teamReviewers, persistenceMode, onListReviewers }) {
    const [apiTeamMembers, setApiTeamMembers] = useState(null);
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
    const teamActor = useMemo(() => resolveTeamActor(authorizedAuthorId, teamReviewers, apiTeamMembers, persistenceMode), [apiTeamMembers, authorizedAuthorId, persistenceMode, teamReviewers]);
    return { teamActor, apiTeamMembers };
}
//# sourceMappingURL=useReportTeamActor.js.map