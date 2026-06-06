import type { CreateReportFeedbackPayload, ReportFeedback, ReportField, ReportStorageAdapter, UpdateReportFeedbackPayload } from "../types/report.js";
import type { ReportFilters } from "../types/report-ui.js";
export type ReportPersistenceConfig = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    fields: ReportField[];
    onList?: (params: {
        pathname: string;
    }) => Promise<ReportFeedback[]>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    routeKey?: string;
};
export declare function useReportPersistence({ projectId, environment, appVersion, fields, onList, onCreate, onUpdate, onDelete, routeKey, }: ReportPersistenceConfig): {
    storageAdapterInstance: ReportStorageAdapter;
    canTransferFeedback: boolean;
    currentPathname: string;
    filters: ReportFilters;
    setFilters: import("react").Dispatch<import("react").SetStateAction<ReportFilters>>;
    selectedReportId: string | null;
    setSelectedReportId: import("react").Dispatch<import("react").SetStateAction<string | null>>;
    reports: ReportFeedback[];
    filteredReports: ReportFeedback[];
    routeDetailsStats: {
        pathname: string;
        statusRows: {
            status: import("../utils/routeDetailStatus.js").RouteDetailStatus;
            all: number;
            today: number;
        }[];
        fieldCounts: {
            key: string;
            label: string;
            type: "textarea" | "checkbox";
            count: number;
        }[];
    };
    selectedReport: ReportFeedback;
    isError: boolean;
    isFetching: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    queryErrorMessage: string | undefined;
    refetch: () => Promise<ReportFeedback[]>;
    createFeedback: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    updateFeedback: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    deleteFeedback: (id: string) => Promise<void>;
};
export type ReportPersistenceState = ReturnType<typeof useReportPersistence> & {
    storageAdapterInstance: ReportStorageAdapter;
};
//# sourceMappingURL=useReportPersistence.d.ts.map