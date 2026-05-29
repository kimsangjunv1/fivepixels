import type { CreateReportFeedbackPayload, ReportFeedback, ReportStorageAdapter, UpdateReportFeedbackPayload } from "../model/report.type.js";
export declare const useReportsQuery: (adapter: ReportStorageAdapter, pathname: string, enabled?: boolean) => {
    data: ReportFeedback[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    isFetched: boolean;
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
//# sourceMappingURL=report.query.d.ts.map