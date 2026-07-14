import type { ReportActivitySummaryParams, ReportActivitySummaryResult, ReportFeedback } from "../types/report.js";
type UseActivitySummaryOptions = {
    reports: ReportFeedback[];
    params: ReportActivitySummaryParams;
    onActivitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
};
export declare function useActivitySummary({ reports, params, onActivitySummary }: UseActivitySummaryOptions): {
    summary: ReportActivitySummaryResult;
    isFetching: boolean;
    usesRemoteSummary: boolean;
};
export {};
//# sourceMappingURL=useActivitySummary.d.ts.map