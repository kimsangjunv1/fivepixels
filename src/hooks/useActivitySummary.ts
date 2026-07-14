import { useEffect, useMemo, useState } from "react";
import type { ReportActivitySummaryParams, ReportActivitySummaryResult, ReportFeedback } from "@/types/report.js";
import { buildActivitySummaryFromReports } from "@/utils/heatmapActivity.js";

type UseActivitySummaryOptions = {
    reports: ReportFeedback[];
    params: ReportActivitySummaryParams;
    onActivitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
};

export function useActivitySummary({ reports, params, onActivitySummary }: UseActivitySummaryOptions) {
    const clientSummary = useMemo(
        () => buildActivitySummaryFromReports(reports, params),
        [params, reports],
    );
    const [remoteSummary, setRemoteSummary] = useState<ReportActivitySummaryResult | null>(null);
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
