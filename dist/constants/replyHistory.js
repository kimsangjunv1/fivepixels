import { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE } from "../utils/feedback/replyHistory.js";
export { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE };
export function usesReplyLoadMoreButton(mode) {
    return mode === "load-more-button" || mode === "button-and-scroll";
}
export function usesReplyInfiniteScroll(mode) {
    return mode === "infinite-scroll" || mode === "button-and-scroll";
}
export function usesReplyPaginationMode(mode) {
    return mode === "pagination";
}
export function usesReplyAppendHistory(mode) {
    return mode !== "pagination";
}
//# sourceMappingURL=replyHistory.js.map