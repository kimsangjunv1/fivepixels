import { useEffect, useMemo, useState } from "react";
import { useCreateReportMutation, useDeleteReportMutation, useReportsQuery, useUpdateReportMutation } from "./report.query.js";
import { useCurrentPathname } from "./useCurrentPathname.js";
import type {
    CreateReportFeedbackPayload,
    ReportFeedback,
    ReportField,
    ReportPersistenceHandlers,
    ReportStorageAdapter,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import type { ReportFilters, ReportListScope } from "@/types/report-ui.js";
import { getRouteDetailStatus, isCreatedToday } from "@/utils/routeDetailStatus.js";
import { getFeedbackDisplayStatus } from "@/utils/feedbackThread.js";
import { FEEDBACK_DISPLAY_STATUS_ORDER } from "@/constants/feedbackStatus.js";
import { resolveStorageAdapter } from "@/utils/storage.js";

export type ReportPersistenceConfig = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    fields: ReportField[];
    onList?: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onListAll?: ReportPersistenceHandlers["onListAll"];
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    routeKey?: string;
};

function filterReports(reports: ReportFeedback[], filters: ReportFilters) {
    return reports.filter((report) => {
        if (filters.status !== "all" && getRouteDetailStatus(report) !== filters.status) {
            return false;
        }

        if (filters.reportType !== "all" && report.report_type !== filters.reportType) {
            return false;
        }

        if (!filters.keyword.trim()) {
            return true;
        }

        const keyword = filters.keyword.trim().toLowerCase();
        return [report.message, report.report_id, report.status, report.pathname].join(" ").toLowerCase().includes(keyword);
    });
}

export function useReportPersistence({
    projectId,
    environment,
    appVersion,
    fields,
    onList,
    onListAll,
    onCreate,
    onUpdate,
    onDelete,
    routeKey,
}: ReportPersistenceConfig) {
    const { adapter: storageAdapterInstance, usesLocalStorage } = useMemo(
        () => resolveStorageAdapter({ projectId, environment, appVersion, onList, onListAll, onCreate, onUpdate, onDelete }),
        [appVersion, environment, onCreate, onDelete, onList, onListAll, onUpdate, projectId],
    );
    const canTransferFeedback = usesLocalStorage;
    const currentPathname = useCurrentPathname(routeKey);

    const [filters, setFilters] = useState<ReportFilters>({
        keyword: "",
        status: "all",
        reportType: "all",
    });
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [listScope, setListScope] = useState<ReportListScope>("current");

    const currentReportsQuery = useReportsQuery(storageAdapterInstance, currentPathname, "current", true);
    const allReportsQuery = useReportsQuery(
        storageAdapterInstance,
        currentPathname,
        "all",
        listScope === "all" && Boolean(storageAdapterInstance.listAll),
    );
    const activeReportsQuery = listScope === "all" ? allReportsQuery : currentReportsQuery;
    const reports = activeReportsQuery.data;
    const { error, isError, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = activeReportsQuery;
    const { mutateAsync: createFeedback, isPending: isCreating } = useCreateReportMutation(storageAdapterInstance, () => {
        void refetch();
        if (listScope === "all") {
            void currentReportsQuery.refetch();
        }
    });
    const { mutateAsync: updateFeedback, isPending: isUpdating } = useUpdateReportMutation(storageAdapterInstance, () => {
        void refetch();
        if (listScope === "all") {
            void currentReportsQuery.refetch();
        }
    });
    const { mutateAsync: deleteFeedback, isPending: isDeleting } = useDeleteReportMutation(storageAdapterInstance, () => {
        void refetch();
        if (listScope === "all") {
            void currentReportsQuery.refetch();
        }
    });

    const filteredReports = useMemo(() => filterReports(reports, filters), [filters, reports]);
    const currentPageFilteredReports = useMemo(
        () => filterReports(currentReportsQuery.data, filters),
        [currentReportsQuery.data, filters],
    );

    const routeDetailsStats = useMemo(() => {
        const currentPageReports = currentReportsQuery.data;
        const statusRows = FEEDBACK_DISPLAY_STATUS_ORDER.map((status) => ({
            status,
            all: 0,
            today: 0,
        }));

        const statusIndex = new Map(statusRows.map((row, index) => [row.status, index]));

        for (const report of currentPageReports) {
            const status = getFeedbackDisplayStatus(report, true);
            const index = statusIndex.get(status);

            if (index === undefined) {
                continue;
            }

            statusRows[index].all += 1;

            if (isCreatedToday(report.created_at)) {
                statusRows[index].today += 1;
            }
        }

        const fieldCounts = fields
            .filter((field) => field.key !== "message")
            .map((field) => {
                const count = currentPageReports.filter((report) => {
                    if (field.type === "checkbox") {
                        return report.field_values[field.key] === true;
                    }

                    return String(report.field_values[field.key] ?? "").trim().length > 0;
                }).length;

                return {
                    key: field.key,
                    label: field.label,
                    type: field.type,
                    count,
                };
            });

        return {
            pathname: currentPathname,
            statusRows,
            fieldCounts,
        };
    }, [currentPathname, currentReportsQuery.data, fields]);

    const selectedReport = useMemo(() => {
        return filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;
    }, [filteredReports, selectedReportId]);

    useEffect(() => {
        if (!selectedReportId) {
            return;
        }

        if (!filteredReports.some((report) => report.id === selectedReportId)) {
            setSelectedReportId(filteredReports[0]?.id ?? null);
        }
    }, [filteredReports, selectedReportId]);

    return {
        storageAdapterInstance,
        canTransferFeedback,
        canListAllFeedback: Boolean(storageAdapterInstance.listAll),
        currentPathname,
        listScope,
        setListScope,
        filters,
        setFilters,
        selectedReportId,
        setSelectedReportId,
        reports,
        filteredReports,
        currentPageFilteredReports,
        routeDetailsStats,
        selectedReport,
        isError,
        isFetching,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isCreating,
        isUpdating,
        isDeleting,
        queryErrorMessage: error?.message,
        refetch,
        createFeedback,
        updateFeedback,
        deleteFeedback,
    };
}

export type ReportPersistenceState = ReturnType<typeof useReportPersistence> & {
    storageAdapterInstance: ReportStorageAdapter;
};
