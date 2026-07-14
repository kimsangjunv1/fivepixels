import { useEffect, useMemo, useState } from "react";
import { buildActivitySummaryFromReports } from "../utils/heatmapActivity.js";
export function useActivitySummary({ reports, params, onActivitySummary }) {
    const clientSummary = useMemo(() => buildActivitySummaryFromReports(reports, params), [params, reports]);
    const [remoteSummary, setRemoteSummary] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    useEffect(() => {
        if (!onActivitySummary) {
            setRemoteSummary(null);
            setIsFetching(false);
            return;
        }
        let cancelled = false;
        setIsFetching(true);
        void onActivitySummary(params)
            .then((result) => {
            if (!cancelled) {
                setRemoteSummary(result);
            }
        })
            .catch(() => {
            if (!cancelled) {
                setRemoteSummary(null);
            }
        })
            .finally(() => {
            if (!cancelled) {
                setIsFetching(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [onActivitySummary, params]);
    return {
        summary: remoteSummary ?? clientSummary,
        isFetching,
        usesRemoteSummary: Boolean(onActivitySummary && remoteSummary),
    };
}
//# sourceMappingURL=useActivitySummary.js.map