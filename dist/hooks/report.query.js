import { getActiveReportMessages } from "../i18n/index.js";
import { useCallback, useEffect, useState } from "react";
import { createReport, deleteReport, listReports, updateReport } from "./report.api.js";
const EMPTY_REPORTS = [];
export const useReportsQuery = (adapter, pathname, enabled = true) => {
    const [data, setData] = useState(EMPTY_REPORTS);
    const [isLoading, setIsLoading] = useState(enabled);
    const [isFetching, setIsFetching] = useState(false);
    const [isFetched, setIsFetched] = useState(false);
    const [error, setError] = useState(null);
    const refetch = useCallback(async () => {
        if (!enabled || !pathname) {
            setData(EMPTY_REPORTS);
            setIsLoading(false);
            return EMPTY_REPORTS;
        }
        setIsFetching(true);
        setError(null);
        try {
            const reports = await listReports(adapter, pathname);
            setData(reports);
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
    }, [adapter, enabled, pathname]);
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