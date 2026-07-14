import type { CreateReportFeedbackPayload, ReportFeedback, ReportStorageAdapter, UpdateReportFeedbackPayload } from "../types/report.js";
import type { ReportListScope } from "../types/report-ui.js";
export declare const useReportsQuery: (adapter: ReportStorageAdapter, pathname: string, scope: ReportListScope, enabled?: boolean, onRefetch?: () => void) => {
    data: ReportFeedback[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    isFetched: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => Promise<void>;
    refetch: () => Promise<ReportFeedback[]>;
};
export declare const useCreateReportMutation: (adapter: ReportStorageAdapter, onSuccess?: () => void, onError?: (error: Error) => void) => {
    mutateAsync: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    isPending: boolean;
};
export declare const useUpdateReportMutation: (adapter: ReportStorageAdapter, onSuccess?: () => void, onError?: (error: Error) => void) => {
    mutateAsync: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    isPending: boolean;
};
export declare const useDeleteReportMutation: (adapter: ReportStorageAdapter, onSuccess?: () => void, onError?: (error: Error) => void) => {
    mutateAsync: (id: string) => Promise<void>;
    isPending: boolean;
};
//# sourceMappingURL=report.query.d.ts.map