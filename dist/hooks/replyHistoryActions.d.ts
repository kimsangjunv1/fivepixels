import { type Dispatch, type SetStateAction } from "react";
import type { ReportFeedback, ReportReply } from "../types/report.js";
import type { ResolvedReplyHistoryConfig } from "../utils/report/reportUi.js";
import type { ReportStorageAdapter } from "../types/report.js";
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
export declare const EMPTY_REPLY_HISTORY_STATE: ReplyHistoryState;
export declare function createReplyHistoryActions({ adapter, usesLazyReplies, getReportById, replyHistoryByReportId, setReplyHistoryByReportId, }: {
    adapter: ReportStorageAdapter;
    usesLazyReplies: boolean;
    getReportById: (reportId: string) => ReportFeedback | undefined;
    replyHistoryByReportId: Record<string, ReplyHistoryState>;
    setReplyHistoryByReportId: Dispatch<SetStateAction<Record<string, ReplyHistoryState>>>;
}): {
    initReplyHistory: (report: ReportFeedback, config: ResolvedReplyHistoryConfig) => Promise<ReportFeedback>;
    loadOlderReplies: (reportId: string, config: ResolvedReplyHistoryConfig) => Promise<void>;
    goToOlderPaginationPage: (reportId: string, config: ResolvedReplyHistoryConfig) => Promise<void>;
    goToNewerPaginationPage: (reportId: string, config: ResolvedReplyHistoryConfig) => void;
    appendReplyToHistory: (reportId: string, reply: ReportReply) => void;
    resetReplyHistory: (reportId?: string) => void;
};
//# sourceMappingURL=replyHistoryActions.d.ts.map