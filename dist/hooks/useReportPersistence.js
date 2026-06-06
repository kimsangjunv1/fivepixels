import { useEffect, useMemo, useState } from "react";
import { useCreateReportMutation, useDeleteReportMutation, useReportsQuery, useUpdateReportMutation } from "./report.query.js";
import { useCurrentPathname } from "./useCurrentPathname.js";
import { getRouteDetailStatus, isCreatedToday, ROUTE_DETAIL_STATUS_ORDER } from "../utils/routeDetailStatus.js";
import { hasGitHubIssue } from "../utils/githubIntegration.js";
import { resolveStorageAdapter } from "../utils/storage.js";
export function useReportPersistence({ projectId, environment, appVersion, fields, onList, onCreate, onUpdate, onDelete, routeKey, }) {
    const { adapter: storageAdapterInstance, usesLocalStorage } = useMemo(() => resolveStorageAdapter({ projectId, environment, appVersion, onList, onCreate, onUpdate, onDelete }), [appVersion, environment, onCreate, onDelete, onList, onUpdate, projectId]);
    const canTransferFeedback = usesLocalStorage;
    const currentPathname = useCurrentPathname(routeKey);
    const [filters, setFilters] = useState({
        keyword: "",
        status: "all",
        reportType: "all",
        githubIssue: "all",
    });
    const [selectedReportId, setSelectedReportId] = useState(null);
    const { data: reports, error, isError, isFetching, refetch } = useReportsQuery(storageAdapterInstance, currentPathname, true);
    const { mutateAsync: createFeedback, isPending: isCreating } = useCreateReportMutation(storageAdapterInstance, () => {
        void refetch();
    });
    const { mutateAsync: updateFeedback, isPending: isUpdating } = useUpdateReportMutation(storageAdapterInstance, () => {
        void refetch();
    });
    const { mutateAsync: deleteFeedback, isPending: isDeleting } = useDeleteReportMutation(storageAdapterInstance, () => {
        void refetch();
    });
    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            if (filters.status !== "all" && getRouteDetailStatus(report) !== filters.status) {
                return false;
            }
            if (filters.reportType !== "all" && report.report_type !== filters.reportType) {
                return false;
            }
            if (filters.githubIssue === "issued" && !hasGitHubIssue(report)) {
                return false;
            }
            if (filters.githubIssue === "not_issued" && hasGitHubIssue(report)) {
                return false;
            }
            if (!filters.keyword.trim()) {
                return true;
            }
            const keyword = filters.keyword.trim().toLowerCase();
            return [report.message, report.report_id, report.status].join(" ").toLowerCase().includes(keyword);
        });
    }, [filters.githubIssue, filters.keyword, filters.reportType, filters.status, reports]);
    const routeDetailsStats = useMemo(() => {
        const statusRows = ROUTE_DETAIL_STATUS_ORDER.map((status) => ({
            status,
            all: 0,
            today: 0,
        }));
        const statusIndex = new Map(statusRows.map((row, index) => [row.status, index]));
        for (const report of reports) {
            const status = getRouteDetailStatus(report);
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
            const count = reports.filter((report) => {
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
    }, [currentPathname, fields, reports]);
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
        currentPathname,
        filters,
        setFilters,
        selectedReportId,
        setSelectedReportId,
        reports,
        filteredReports,
        routeDetailsStats,
        selectedReport,
        isError,
        isFetching,
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
//# sourceMappingURL=useReportPersistence.js.map