import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListRepliesResult, ReportFeedback, ReportReply } from "@/types/report.js";
import type { ResolvedReplyHistoryConfig } from "@/utils/report/reportUi.js";
import { usesReplyAppendHistory, usesReplyPaginationMode } from "@/constants/replyHistory.js";
import {
    appendReplyUnique,
    getEmbeddedRepliesForHistory,
    getPaginationWindow,
    getTotalReplyCount,
    paginateSortedReplies,
    prependReplies,
    sortRepliesChronologically,
} from "@/utils/feedback/replyHistory.js";
import { listReplies as listRepliesApi } from "@/hooks/report.api.js";
import type { ReportStorageAdapter } from "@/types/report.js";

export type ReplyHistoryState = {
    items: ReportReply[];
    hasMoreOlder: boolean;
    hasNewerPage: boolean;
    isLoadingOlder: boolean;
    paginationPageIndex: number;
    totalCount: number;
    initialized: boolean;
    pageCache: Record<number, ReportReply[]>;
};

export const EMPTY_REPLY_HISTORY_STATE: ReplyHistoryState = {
    items: [],
    hasMoreOlder: false,
    hasNewerPage: false,
    isLoadingOlder: false,
    paginationPageIndex: 0,
    totalCount: 0,
    initialized: false,
    pageCache: {},
};

async function fetchReplyPage(
    adapter: ReportStorageAdapter,
    report: ReportFeedback,
    usesLazyReplies: boolean,
    pageSize: number,
    cursor?: string,
): Promise<ListRepliesResult> {
    if (usesLazyReplies) {
        return listRepliesApi(adapter, report.id, {
            limit: pageSize,
            cursor,
            direction: "older",
        });
    }

    return paginateSortedReplies(getEmbeddedRepliesForHistory(report), {
        limit: pageSize,
        cursor,
        direction: "older",
    });
}

function buildInitialPaginationState(report: ReportFeedback, pageResult: ListRepliesResult): ReplyHistoryState {
    const totalCount = pageResult.totalCount ?? getTotalReplyCount(report);

    return {
        items: pageResult.items,
        hasMoreOlder: pageResult.hasMore,
        hasNewerPage: false,
        isLoadingOlder: false,
        paginationPageIndex: 0,
        totalCount,
        initialized: true,
        pageCache: {
            0: pageResult.items,
        },
    };
}

function buildInitialAppendState(report: ReportFeedback, pageResult: ListRepliesResult): ReplyHistoryState {
    const totalCount = pageResult.totalCount ?? getTotalReplyCount(report);

    return {
        items: pageResult.items,
        hasMoreOlder: pageResult.hasMore,
        hasNewerPage: false,
        isLoadingOlder: false,
        paginationPageIndex: 0,
        totalCount,
        initialized: true,
        pageCache: {},
    };
}

function flattenPageCache(pageCache: Record<number, ReportReply[]>): ReportReply[] {
    const pages = Object.keys(pageCache)
        .map((key) => Number(key))
        .sort((left, right) => left - right);

    return sortRepliesChronologically(pages.flatMap((pageIndex) => pageCache[pageIndex] ?? []));
}

export function createReplyHistoryActions({
    adapter,
    usesLazyReplies,
    getReportById,
    replyHistoryByReportId,
    setReplyHistoryByReportId,
}: {
    adapter: ReportStorageAdapter;
    usesLazyReplies: boolean;
    getReportById: (reportId: string) => ReportFeedback | undefined;
    replyHistoryByReportId: Record<string, ReplyHistoryState>;
    setReplyHistoryByReportId: Dispatch<SetStateAction<Record<string, ReplyHistoryState>>>;
}) {
    const initReplyHistory = useCallback(
        async (report: ReportFeedback, config: ResolvedReplyHistoryConfig): Promise<ReportFeedback> => {
            const existing = replyHistoryByReportId[report.id];

            if (existing?.initialized) {
                return {
                    ...report,
                    replies: existing.items,
                    reply_count: existing.totalCount,
                };
            }

            setReplyHistoryByReportId((current) => ({
                ...current,
                [report.id]: {
                    ...EMPTY_REPLY_HISTORY_STATE,
                    isLoadingOlder: true,
                },
            }));

            try {
                const pageResult = await fetchReplyPage(adapter, report, usesLazyReplies, config.pageSize);
                const nextState = usesReplyPaginationMode(config.mode)
                    ? buildInitialPaginationState(report, pageResult)
                    : buildInitialAppendState(report, pageResult);

                setReplyHistoryByReportId((current) => ({
                    ...current,
                    [report.id]: nextState,
                }));

                return {
                    ...report,
                    replies: nextState.items,
                    reply_count: nextState.totalCount,
                };
            } catch {
                setReplyHistoryByReportId((current) => ({
                    ...current,
                    [report.id]: EMPTY_REPLY_HISTORY_STATE,
                }));

                return report;
            }
        },
        [adapter, replyHistoryByReportId, setReplyHistoryByReportId, usesLazyReplies],
    );

    const loadOlderReplies = useCallback(
        async (reportId: string, config: ResolvedReplyHistoryConfig) => {
            const state = replyHistoryByReportId[reportId];

            if (!state?.initialized || state.isLoadingOlder || !state.hasMoreOlder || !usesReplyAppendHistory(config.mode)) {
                return;
            }

            const report = getReportById(reportId);

            if (!report) {
                return;
            }

            setReplyHistoryByReportId((current) => ({
                ...current,
                [reportId]: {
                    ...state,
                    isLoadingOlder: true,
                },
            }));

            try {
                const oldestId = state.items[0]?.id;
                const pageResult = await fetchReplyPage(adapter, report, usesLazyReplies, config.pageSize, oldestId);

                setReplyHistoryByReportId((current) => {
                    const currentState = current[reportId] ?? state;

                    return {
                        ...current,
                        [reportId]: {
                            ...currentState,
                            items: prependReplies(currentState.items, pageResult.items),
                            hasMoreOlder: pageResult.hasMore,
                            isLoadingOlder: false,
                        },
                    };
                });
            } catch {
                setReplyHistoryByReportId((current) => ({
                    ...current,
                    [reportId]: {
                        ...state,
                        isLoadingOlder: false,
                    },
                }));
            }
        },
        [adapter, getReportById, replyHistoryByReportId, setReplyHistoryByReportId, usesLazyReplies],
    );

    const goToOlderPaginationPage = useCallback(
        async (reportId: string, config: ResolvedReplyHistoryConfig) => {
            const state = replyHistoryByReportId[reportId];

            if (!state?.initialized || state.isLoadingOlder || !state.hasMoreOlder || !usesReplyPaginationMode(config.mode)) {
                return;
            }

            const report = getReportById(reportId);

            if (!report) {
                return;
            }

            const nextPageIndex = state.paginationPageIndex + 1;
            const cachedPage = state.pageCache[nextPageIndex];

            if (cachedPage) {
                const window = getPaginationWindow(flattenPageCache(state.pageCache), nextPageIndex, config.pageSize, state.totalCount);

                setReplyHistoryByReportId((current) => ({
                    ...current,
                    [reportId]: {
                        ...state,
                        items: cachedPage,
                        paginationPageIndex: nextPageIndex,
                        hasMoreOlder: window.hasOlderPage,
                        hasNewerPage: window.hasNewerPage,
                    },
                }));

                return;
            }

            setReplyHistoryByReportId((current) => ({
                ...current,
                [reportId]: {
                    ...state,
                    isLoadingOlder: true,
                },
            }));

            try {
                const oldestId = state.items[0]?.id;
                const pageResult = await fetchReplyPage(adapter, report, usesLazyReplies, config.pageSize, oldestId);

                setReplyHistoryByReportId((current) => {
                    const currentState = current[reportId] ?? state;
                    const totalCount = pageResult.totalCount ?? currentState.totalCount;
                    const nextCache = {
                        ...currentState.pageCache,
                        [nextPageIndex]: pageResult.items,
                    };
                    const window = getPaginationWindow(flattenPageCache(nextCache), nextPageIndex, config.pageSize, totalCount);

                    return {
                        ...current,
                        [reportId]: {
                            ...currentState,
                            items: pageResult.items,
                            paginationPageIndex: nextPageIndex,
                            hasMoreOlder: pageResult.hasMore || window.hasOlderPage,
                            hasNewerPage: true,
                            isLoadingOlder: false,
                            totalCount,
                            pageCache: nextCache,
                        },
                    };
                });
            } catch {
                setReplyHistoryByReportId((current) => ({
                    ...current,
                    [reportId]: {
                        ...state,
                        isLoadingOlder: false,
                    },
                }));
            }
        },
        [adapter, getReportById, replyHistoryByReportId, setReplyHistoryByReportId, usesLazyReplies],
    );

    const goToNewerPaginationPage = useCallback(
        (reportId: string, config: ResolvedReplyHistoryConfig) => {
            const state = replyHistoryByReportId[reportId];

            if (!state?.initialized || !usesReplyPaginationMode(config.mode) || state.paginationPageIndex <= 0) {
                return;
            }

            const nextPageIndex = state.paginationPageIndex - 1;
            const cachedPage = state.pageCache[nextPageIndex];

            if (!cachedPage) {
                return;
            }

            const window = getPaginationWindow(flattenPageCache(state.pageCache), nextPageIndex, config.pageSize, state.totalCount);

            setReplyHistoryByReportId((current) => ({
                ...current,
                [reportId]: {
                    ...state,
                    items: cachedPage,
                    paginationPageIndex: nextPageIndex,
                    hasMoreOlder: window.hasOlderPage,
                    hasNewerPage: window.hasNewerPage,
                },
            }));
        },
        [replyHistoryByReportId, setReplyHistoryByReportId],
    );

    const appendReplyToHistory = useCallback(
        (reportId: string, reply: ReportReply) => {
            setReplyHistoryByReportId((current) => {
                const state = current[reportId];

                if (!state?.initialized) {
                    return current;
                }

                const nextItems = appendReplyUnique(state.items, reply);
                const activePageItems = state.pageCache[state.paginationPageIndex] ?? state.items;
                const nextPageItems = appendReplyUnique(activePageItems, reply);

                return {
                    ...current,
                    [reportId]: {
                        ...state,
                        items: nextItems,
                        totalCount: state.totalCount + 1,
                        pageCache: {
                            ...state.pageCache,
                            [state.paginationPageIndex]: nextPageItems,
                        },
                    },
                };
            });
        },
        [setReplyHistoryByReportId],
    );

    const resetReplyHistory = useCallback(
        (reportId?: string) => {
            if (!reportId) {
                setReplyHistoryByReportId({});
                return;
            }

            setReplyHistoryByReportId((current) => {
                const next = { ...current };
                delete next[reportId];
                return next;
            });
        },
        [setReplyHistoryByReportId],
    );

    return {
        initReplyHistory,
        loadOlderReplies,
        goToOlderPaginationPage,
        goToNewerPaginationPage,
        appendReplyToHistory,
        resetReplyHistory,
    };
}
