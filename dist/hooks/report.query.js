import { getActiveReportMessages } from "../i18n/index.js";
import { useCallback, useEffect, useState } from "react";
import { createReport, deleteReport, listAllReports, listReports, updateReport } from "./report.api.js";
const EMPTY_REPORTS = [];
const REPORT_LIST_PAGE_SIZE = 100;
export const useReportsQuery = (adapter, pathname, scope, enabled = true) => {
    const [data, setData] = useState(EMPTY_REPORTS);
    const [isLoading, setIsLoading] = useState(enabled);
    const [isFetching, setIsFetching] = useState(false);
    const [isFetched, setIsFetched] = useState(false);
    const [error, setError] = useState(null);
    const [nextCursor, setNextCursor] = useState();
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const refetch = useCallback(async () => {
        if (!enabled || !pathname) {
            setData(EMPTY_REPORTS);
            setIsLoading(false);
            return EMPTY_REPORTS;
        }
        setIsFetching(true);
        setError(null);
        try {
            const result = scope === "all"
                ? await listAllReports(adapter, { limit: REPORT_LIST_PAGE_SIZE })
                : { items: await listReports(adapter, pathname), nextCursor: undefined };
            const reports = result.items;
            setData(reports);
            setNextCursor(result.nextCursor);
            setIsFetched(true);
            return reports;
        }
        catch (nextError) {
            setError(nextError instanceof Error ? nextError : new Error(getActiveReportMessages().errors.loadFeedbackFailed));
            return EMPTY_REPORTS;
        }
        finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    }, [adapter, enabled, pathname, scope]);
    const fetchNextPage = useCallback(async () => {
        if (scope !== "all" || !nextCursor || isFetchingNextPage) {
            return;
        }
        setIsFetchingNextPage(true);
        try {
            const result = await listAllReports(adapter, {
                cursor: nextCursor,
                limit: REPORT_LIST_PAGE_SIZE,
            });
            setData((current) => [...current, ...result.items]);
            setNextCursor(result.nextCursor);
        }
        catch (nextError) {
            setError(nextError instanceof Error ? nextError : new Error(getActiveReportMessages().errors.loadFeedbackFailed));
        }
        finally {
            setIsFetchingNextPage(false);
        }
    }, [adapter, isFetchingNextPage, nextCursor, scope]);
    useEffect(() => {
        setIsLoading(enabled);
        void refetch();
    }, [enabled, refetch]);
    return {
        data,
        isLoading,
        isError: Boolean(error),
        error,
        isFetching,
        isFetched,
        hasNextPage: Boolean(nextCursor),
        isFetchingNextPage,
        fetchNextPage,
        refetch,
    };
};
export const useCreateReportMutation = (adapter, onSuccess, onError) => {
    const [isPending, setIsPending] = useState(false);
    const mutateAsync = useCallback(async (payload) => {
        setIsPending(true);
        try {
            const created = await createReport(adapter, payload);
            onSuccess?.();
            return created;
        }
        catch (error) {
            const nextError = error instanceof Error ? error : new Error(getActiveReportMessages().errors.createFeedbackFailed);
            onError?.(nextError);
            throw nextError;
        }
        finally {
            setIsPending(false);
        }
    }, [adapter, onError, onSuccess]);
    return { mutateAsync, isPending };
};
export const useUpdateReportMutation = (adapter, onSuccess, onError) => {
    const [isPending, setIsPending] = useState(false);
    const mutateAsync = useCallback(async (id, payload) => {
        setIsPending(true);
        try {
            const updated = await updateReport(adapter, id, payload);
            onSuccess?.();
            return updated;
        }
        catch (error) {
            const nextError = error instanceof Error ? error : new Error(getActiveReportMessages().errors.updateFeedbackFailed);
            onError?.(nextError);
            throw nextError;
        }
        finally {
            setIsPending(false);
        }
    }, [adapter, onError, onSuccess]);
    return { mutateAsync, isPending };
};
export const useDeleteReportMutation = (adapter, onSuccess, onError) => {
    const [isPending, setIsPending] = useState(false);
    const mutateAsync = useCallback(async (id) => {
        setIsPending(true);
        try {
            await deleteReport(adapter, id);
            onSuccess?.();
        }
        catch (error) {
            const nextError = error instanceof Error ? error : new Error(getActiveReportMessages().errors.deleteFeedbackFailed);
            onError?.(nextError);
            throw nextError;
        }
        finally {
            setIsPending(false);
        }
    }, [adapter, onError, onSuccess]);
    return { mutateAsync, isPending };
};
//# sourceMappingURL=report.query.js.map