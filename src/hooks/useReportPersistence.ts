import { FEEDBACK_STORAGE_CHANGED_EVENT } from "@/constants/feedbackStorageEvents.js";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useCreateReportMutation, useDeleteReportMutation, useReportsQuery, useUpdateReportMutation } from "./report.query.js";
import { useCurrentPathname } from "./useCurrentPathname.js";
import { createReply as createReplyApi } from "./report.api.js";
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
import { casesToSearchText, getReportCases } from "@/utils/report/reportCases.js";
import { toDateKey } from "@/utils/panel/heatmapActivity.js";
import { buildRouteDetailsSummary } from "@/utils/panel/panelBootstrap.js";
import { getRouteDetailStatus } from "@/utils/panel/routeDetailStatus.js";
import { getFeedbackDisplayStatus, getLatestReply } from "@/utils/feedback/feedbackThread.js";
import { mergeRepliesIntoReport } from "@/utils/report/reportSummary.js";
import { resolveStorageAdapter } from "@/utils/shared/storage.js";
import type { ResolvedReplyHistoryConfig } from "@/utils/report/reportUi.js";
import { createReplyHistoryActions, EMPTY_REPLY_HISTORY_STATE, type ReplyHistoryState } from "./replyHistoryActions.js";

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
    fetchEnabled?: boolean;
    listFetchEnabled?: boolean;
    allReportsFetchEnabled?: boolean;
    replyHistory: ResolvedReplyHistoryConfig;
};

function buildReportSearchHaystack(report: ReportFeedback) {
    const latestReply = getLatestReply(report);
    const caseId = typeof report.fc_number === "number" ? `#fc-${report.fc_number} fc-${report.fc_number} ${report.fc_number}` : "";

    return [
        casesToSearchText(getReportCases(report)),
        report.author_name ?? "",
        report.report_id,
        report.status,
        report.pathname,
        report.category ?? "",
        caseId,
        latestReply?.message ?? "",
        latestReply?.author_name ?? "",
    ]
        .join(" ")
        .toLowerCase();
}

function filterReports(reports: ReportFeedback[], filters: ReportFilters) {
    return reports.filter((report) => {
        if (filters.status !== "all" && getRouteDetailStatus(report) !== filters.status) {
            return false;
        }

        if (filters.reportType !== "all" && report.report_type !== filters.reportType) {
            return false;
        }

        if (filters.dateKey) {
            const createdAt = new Date(report.created_at);

            if (Number.isNaN(createdAt.getTime()) || toDateKey(createdAt) !== filters.dateKey) {
                return false;
            }
        }

        if (!filters.keyword.trim()) {
            return true;
        }

        const keyword = filters.keyword.trim().toLowerCase();

        return buildReportSearchHaystack(report).includes(keyword);
    });
}

function enrichReports(reports: ReportFeedback[], replyHistoryByReportId: Record<string, ReplyHistoryState>) {
    return reports.map((report) => {
        const history = replyHistoryByReportId[report.id];

        if (!history?.initialized) {
            return report;
        }

        return mergeRepliesIntoReport(report, history.items);
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
    fetchEnabled = true,
    listFetchEnabled = true,
    allReportsFetchEnabled = false,
    replyHistory,
}: ReportPersistenceConfig) {
    const { adapter: storageAdapterInstance, usesLocalStorage, persistenceStatus } = useMemo(
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
    const [replyHistoryByReportId, setReplyHistoryByReportId] = useState<Record<string, ReplyHistoryState>>({});

    const [filters, setFilters] = useState<ReportFilters>({
        keyword: "",
        status: "all",
        reportType: "all",
        dateKey: null,
    });
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [listScope, setListScope] = useState<ReportListScope>("current");

    const clearLoadedReplies = useCallback(() => {
        setReplyHistoryByReportId({});
    }, []);

    const currentReportsQuery = useReportsQuery(storageAdapterInstance, currentPathname, "current", fetchEnabled && listFetchEnabled, clearLoadedReplies);
    const canFetchAllReports = Boolean(storageAdapterInstance.listAll);
    const shouldFetchAllReports = fetchEnabled && listFetchEnabled && canFetchAllReports && (allReportsFetchEnabled || listScope === "all");
    const allReportsQuery = useReportsQuery(storageAdapterInstance, currentPathname, "all", shouldFetchAllReports, clearLoadedReplies);
    const activeReportsQuery = listScope === "all" ? allReportsQuery : currentReportsQuery;
    const rawReports = activeReportsQuery.data;
    const reports = useMemo(() => enrichReports(rawReports, replyHistoryByReportId), [rawReports, replyHistoryByReportId]);
    const { error, isError, isLoading, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = activeReportsQuery;

    const refreshReportsAfterMutation = useCallback(
        (options?: { clearReplyHistory?: boolean }) => {
            if (options?.clearReplyHistory) {
                clearLoadedReplies();
            }

            if (!(fetchEnabled && listFetchEnabled)) {
                return;
            }

            void currentReportsQuery.refetch();

            if (shouldFetchAllReports) {
                void allReportsQuery.refetch();
            }
        },
        [allReportsQuery, clearLoadedReplies, currentReportsQuery, fetchEnabled, listFetchEnabled, shouldFetchAllReports],
    );

    useEffect(() => {
        if (typeof window === "undefined" || !usesLocalStorage) {
            return;
        }

        const handleExternalStorageChange = () => {
            refreshReportsAfterMutation({ clearReplyHistory: true });
        };

        window.addEventListener(FEEDBACK_STORAGE_CHANGED_EVENT, handleExternalStorageChange);

        return () => {
            window.removeEventListener(FEEDBACK_STORAGE_CHANGED_EVENT, handleExternalStorageChange);
        };
    }, [refreshReportsAfterMutation, usesLocalStorage]);

    const { mutateAsync: createFeedback, isPending: isCreating } = useCreateReportMutation(storageAdapterInstance, () => {
        refreshReportsAfterMutation();
    });
    const { mutateAsync: updateFeedback, isPending: isUpdating } = useUpdateReportMutation(storageAdapterInstance, () => {
        refreshReportsAfterMutation({ clearReplyHistory: true });
    });
    const { mutateAsync: deleteFeedback, isPending: isDeleting } = useDeleteReportMutation(storageAdapterInstance, () => {
        refreshReportsAfterMutation({ clearReplyHistory: true });
    });

    const getReportById = useCallback(
        (reportId: string) => rawReports.find((report) => report.id === reportId),
        [rawReports],
    );

    const {
        initReplyHistory,
        loadOlderReplies,
        goToOlderPaginationPage,
        goToNewerPaginationPage,
        appendReplyToHistory,
        resetReplyHistory,
    } = createReplyHistoryActions({
        adapter: storageAdapterInstance,
        usesLazyReplies,
        getReportById,
        replyHistoryByReportId,
        setReplyHistoryByReportId,
    });

    const loadRepliesIfNeeded = useCallback(
        async (report: ReportFeedback): Promise<ReportFeedback> => initReplyHistory(report, replyHistory),
        [initReplyHistory, replyHistory],
    );

    const createReply = useCallback(
        async (commentId: string, payload: CreateReplyPayload) => {
            const created = await createReplyApi(storageAdapterInstance, commentId, payload);
            const history = replyHistoryByReportId[commentId];

            if (history?.initialized) {
                appendReplyToHistory(commentId, created);
            } else if (usesLazyReplies) {
                const report = getReportById(commentId);

                if (report) {
                    await initReplyHistory(report, replyHistory);
                }
            }

            refreshReportsAfterMutation();

            return created;
        },
        [
            appendReplyToHistory,
            getReportById,
            initReplyHistory,
            refreshReportsAfterMutation,
            replyHistory,
            replyHistoryByReportId,
            storageAdapterInstance,
            usesLazyReplies,
        ],
    );

    const currentPageReports = useMemo(
        () => enrichReports(currentReportsQuery.data, replyHistoryByReportId),
        [currentReportsQuery.data, replyHistoryByReportId],
    );
    const allPageReports = useMemo(
        () => enrichReports(allReportsQuery.data ?? [], replyHistoryByReportId),
        [allReportsQuery.data, replyHistoryByReportId],
    );
    const filteredReports = useMemo(() => filterReports(reports, filters), [filters, reports]);
    const currentPageFilteredReports = useMemo(
        () => filterReports(currentPageReports, filters),
        [currentPageReports, filters],
    );
    const allPageFilteredReports = useMemo(() => filterReports(allPageReports, filters), [allPageReports, filters]);

    const routeDetailsStats = useMemo(
        () => buildRouteDetailsSummary(currentPageReports, fields, currentPathname),
        [currentPathname, currentPageReports, fields],
    );

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
        persistenceStatus,
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
        currentPageReports,
        allPageReports,
        filteredReports,
        currentPageFilteredReports,
        allPageFilteredReports,
        routeDetailsStats,
        selectedReport,
        isError,
        isReportsLoading: isLoading,
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
        replyHistory,
        replyHistoryByReportId,
        initReplyHistory,
        loadOlderReplies,
        goToOlderPaginationPage,
        goToNewerPaginationPage,
        resetReplyHistory,
    };
}

export type ReportPersistenceState = ReturnType<typeof useReportPersistence> & {
    storageAdapterInstance: ReportStorageAdapter;
};
