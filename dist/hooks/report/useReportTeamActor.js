import { useEffect, useMemo, useState } from "react";
import { resolveTeamActor } from "../../utils/report/teamManagement.js";
export function useReportTeamActor({ authorizedAuthorId, teamReviewers, persistenceMode, onListReviewers }) {
    const [apiTeamMembers, setApiTeamMembers] = useState(null);
    useEffect(() => {
        if (persistenceMode !== "API" || !onListReviewers || !authorizedAuthorId) {
            setApiTeamMembers(null);
            return;
        }
        let cancelled = false;
        void onListReviewers()
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
    }, [authorizedAuthorId, onListReviewers, persistenceMode]);
    const teamActor = useMemo(() => resolveTeamActor(authorizedAuthorId, teamReviewers, apiTeamMembers, persistenceMode), [apiTeamMembers, authorizedAuthorId, persistenceMode, teamReviewers]);
    return { teamActor, apiTeamMembers };
}
//# sourceMappingURL=useReportTeamActor.js.map