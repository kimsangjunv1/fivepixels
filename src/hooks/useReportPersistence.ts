import { useEffect, useMemo, useState, useCallback } from "react";
import { useCreateReportMutation, useDeleteReportMutation, useReportsQuery, useUpdateReportMutation } from "./report.query.js";
import { useCurrentPathname } from "./useCurrentPathname.js";
import { createReply as createReplyApi, listReplies as listRepliesApi } from "./report.api.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ReportFeedback,
    ReportField,
    ReportPersistenceHandlers,
    ReportReply,
    ReportStorageAdapter,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import type { ReportFilters, ReportListScope } from "@/types/report-ui.js";
import { casesToSearchText } from "@/utils/reportCases.js";
import { getRouteDetailStatus, isCreatedToday } from "@/utils/routeDetailStatus.js";
import { getFeedbackDisplayStatus } from "@/utils/feedbackThread.js";
import { FEEDBACK_DISPLAY_STATUS_ORDER } from "@/constants/feedbackStatus.js";
import { mergeRepliesIntoReport, needsReplyLoad } from "@/utils/reportSummary.js";
import { resolveStorageAdapter } from "@/utils/storage.js";

export type ReportPersistenceConfig = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    fields: ReportField[];
    onList?: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onListAll?: ReportPersistenceHandlers["onListAll"];
    onListReplies?: ReportPersistenceHandlers["onListReplies"];
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onCreateReply?: ReportPersistenceHandlers["onCreateReply"];
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
        return [casesToSearchText(report.cases), report.report_id, report.status, report.pathname].join(" ").toLowerCase().includes(keyword);
    });
}

function enrichReports(reports: ReportFeedback[], repliesByReportId: Record<string, ReportReply[]>) {
    return reports.map((report) => {
        const loadedReplies = repliesByReportId[report.id];

        if (!loadedReplies) {
            return report;
        }

        return mergeRepliesIntoReport(report, loadedReplies);
    });
}

export function useReportPersistence({
    projectId,
    environment,
    appVersion,
    fields,
    onList,
    onListAll,
    onListReplies,
    onCreate,
    onCreateReply,
    onUpdate,
    onDelete,
    routeKey,
}: ReportPersistenceConfig) {
    const { adapter: storageAdapterInstance, usesLocalStorage } = useMemo(
        () =>
            resolveStorageAdapter({
                projectId,
                environment,
                appVersion,
                onList,
                onListAll,
                onListReplies,
                onCreate,
                onCreateReply,
                onUpdate,
                onDelete,
            }),
        [appVersion, environment, onCreate, onCreateReply, onDelete, onList, onListAll, onListReplies, onUpdate, projectId],
    );
    const canTransferFeedback = usesLocalStorage;
    const usesLazyReplies = Boolean(storageAdapterInstance.listReplies);
    const usesCreateReply = Boolean(storageAdapterInstance.createReply);
    const currentPathname = useCurrentPathname(routeKey);
    const [repliesByReportId, setRepliesByReportId] = useState<Record<string, ReportReply[]>>({});

    const [filters, setFilters] = useState<ReportFilters>({
        keyword: "",
        status: "all",
        reportType: "all",
    });
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [listScope, setListScope] = useState<ReportListScope>("current");

    const clearLoadedReplies = useCallback(() => {
        setRepliesByReportId({});
    }, []);

    const currentReportsQuery = useReportsQuery(storageAdapterInstance, currentPathname, "current", true, clearLoadedReplies);
    const allReportsQuery = useReportsQuery(
        storageAdapterInstance,
        currentPathname,
        "all",
        listScope === "all" && Boolean(storageAdapterInstance.listAll),
        clearLoadedReplies,
    );
    const activeReportsQuery = listScope === "all" ? allReportsQuery : currentReportsQuery;
    const rawReports = activeReportsQuery.data;
    const reports = useMemo(() => enrichReports(rawReports, repliesByReportId), [rawReports, repliesByReportId]);
    const { error, isError, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = activeReportsQuery;
    const { mutateAsync: createFeedback, isPending: isCreating } = useCreateReportMutation(storageAdapterInstance, () => {
        void refetch();
        if (listScope === "all") {
            void currentReportsQuery.refetch();
        }
    });
    const { mutateAsync: updateFeedback, isPending: isUpdating } = useUpdateReportMutation(storageAdapterInstance, () => {
        clearLoadedReplies();
        void refetch();
        if (listScope === "all") {
            void currentReportsQuery.refetch();
        }
    });
    const { mutateAsync: deleteFeedback, isPending: isDeleting } = useDeleteReportMutation(storageAdapterInstance, () => {
        clearLoadedReplies();
        void refetch();
        if (listScope === "all") {
            void currentReportsQuery.refetch();
        }
    });

    const loadRepliesIfNeeded = useCallback(
        async (report: ReportFeedback): Promise<ReportFeedback> => {
            if (!needsReplyLoad(report, usesLazyReplies)) {
                return report;
            }

            const replies = await listRepliesApi(storageAdapterInstance, report.id);
            setRepliesByReportId((current) => ({
                ...current,
                [report.id]: replies,
            }));

            return mergeRepliesIntoReport(report, replies);
        },
        [storageAdapterInstance, usesLazyReplies],
    );

    const createReply = useCallback(
        async (commentId: string, payload: CreateReplyPayload) => {
            const created = await createReplyApi(storageAdapterInstance, commentId, payload);

            if (usesLazyReplies) {
                const replies = await listRepliesApi(storageAdapterInstance, commentId);
                setRepliesByReportId((current) => ({
                    ...current,
                    [commentId]: replies,
                }));
            }

            void refetch();
            if (listScope === "all") {
                void currentReportsQuery.refetch();
            }

            return created;
        },
        [currentReportsQuery, listScope, refetch, storageAdapterInstance, usesLazyReplies],
    );

    const filteredReports = useMemo(() => filterReports(reports, filters), [filters, reports]);
    const currentPageFilteredReports = useMemo(
        () => filterReports(enrichReports(currentReportsQuery.data, repliesByReportId), filters),
        [currentReportsQuery.data, filters, repliesByReportId],
    );

    const routeDetailsStats = useMemo(() => {
        const currentPageReports = enrichReports(currentReportsQuery.data, repliesByReportId);
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
    }, [currentPathname, currentReportsQuery.data, fields, repliesByReportId]);

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
        usesLazyReplies,
        usesCreateReply,
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
        loadRepliesIfNeeded,
        createReply,
    };
}

export type ReportPersistenceState = ReturnType<typeof useReportPersistence> & {
    storageAdapterInstance: ReportStorageAdapter;
};
