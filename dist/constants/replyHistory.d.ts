import type { ReplyHistoryLoadMode } from "../types/report.js";
import { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE } from "../utils/replyHistory.js";
export { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE };
export declare function usesReplyLoadMoreButton(mode: ReplyHistoryLoadMode): boolean;
export declare function usesReplyInfiniteScroll(mode: ReplyHistoryLoadMode): boolean;
export declare function usesReplyPaginationMode(mode: ReplyHistoryLoadMode): boolean;
export declare function usesReplyAppendHistory(mode: ReplyHistoryLoadMode): boolean;
//# sourceMappingURL=replyHistory.d.ts.map