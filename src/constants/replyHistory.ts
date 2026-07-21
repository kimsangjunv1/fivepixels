import type { ReplyHistoryLoadMode } from "@/types/report.js";
import { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE } from "@/utils/feedback/replyHistory.js";

export { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE };

export function usesReplyLoadMoreButton(mode: ReplyHistoryLoadMode): boolean {
    return mode === "load-more-button" || mode === "button-and-scroll";
}

export function usesReplyInfiniteScroll(mode: ReplyHistoryLoadMode): boolean {
    return mode === "infinite-scroll" || mode === "button-and-scroll";
}

export function usesReplyPaginationMode(mode: ReplyHistoryLoadMode): boolean {
    return mode === "pagination";
}

export function usesReplyAppendHistory(mode: ReplyHistoryLoadMode): boolean {
    return mode !== "pagination";
}
