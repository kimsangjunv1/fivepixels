import type { CreateReportFeedbackPayload, CreateReplyPayload, ReportFeedback, ReportField, ReportPersistenceHandlers, ReportReply, ReportStorageAdapter, UpdateReportFeedbackPayload } from "../types/report.js";
import type { ReportFilters, ReportListScope } from "../types/report-ui.js";
export type ReportPersistenceConfig = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    fields: ReportField[];
    onList?: (params: {
        pathname: string;
    }) => Promise<ReportFeedback[]>;
    onListAll?: ReportPersistenceHandlers["onListAll"];
    onListReplies?: ReportPersistenceHandlers["onListReplies"];
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onCreateReply?: ReportPersistenceHandlers["onCreateReply"];
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    routeKey?: string;
};
export declare function useReportPersistence({ projectId, environment, appVersion, fields, onList, onListAll, onListReplies, onCreate, onCreateReply, onUpdate, onDelete, routeKey, }: ReportPersistenceConfig): {
    storageAdapterInstance: ReportStorageAdapter;
    canTransferFeedback: boolean;
    canListAllFeedback: boolean;
    usesLazyReplies: boolean;
    usesCreateReply: boolean;
    currentPathname: string;
    listScope: ReportListScope;
    setListScope: import("react").Dispatch<import("react").SetStateAction<ReportListScope>>;
    filters: ReportFilters;
    setFilters: import("react").Dispatch<import("react").SetStateAction<ReportFilters>>;
    selectedReportId: string | null;
    setSelectedReportId: import("react").Dispatch<import("react").SetStateAction<string | null>>;
    reports: ReportFeedback[];
    currentPageReports: ReportFeedback[];
    filteredReports: ReportFeedback[];
    currentPageFilteredReports: ReportFeedback[];
    routeDetailsStats: {
        pathname: string;
        statusRows: {
            status: import("../constants/feedbackStatus.js").FeedbackDisplayStatus;
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
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    queryErrorMessage: string | undefined;
    refetch: () => Promise<ReportFeedback[]>;
    createFeedback: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    updateFeedback: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    deleteFeedback: (id: string) => Promise<void>;
    loadRepliesIfNeeded: (report: ReportFeedback) => Promise<ReportFeedback>;
    createReply: (commentId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
};
export type ReportPersistenceState = ReturnType<typeof useReportPersistence> & {
    storageAdapterInstance: ReportStorageAdapter;
};
//# sourceMappingURL=useReportPersistence.d.ts.map