import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProcessingDots } from "../../../components/ui/ProcessingDots.js";
import { usesReplyInfiniteScroll, usesReplyLoadMoreButton, usesReplyPaginationMode } from "../../../constants/replyHistory.js";
import { useReport } from "../../../providers/reportContext.js";
export function ReplyHistoryControls({ reportId, history }) {
    const { messages, replyHistory, loadOlderReplies, goToOlderPaginationPage, goToNewerPaginationPage } = useReport();
    if (!history?.initialized) {
        return history?.isLoadingOlder ? (_jsxs("div", { className: "flex items-center justify-center gap-[6px] py-[8px] text-[12px] text-[var(--adaptive-black500)]", children: [_jsx(ProcessingDots, {}), _jsx("span", { children: messages.feedbackList.loadingMore })] })) : null;
    }
    const showPagination = usesReplyPaginationMode(replyHistory.mode);
    const showLoadMoreButton = usesReplyLoadMoreButton(replyHistory.mode);
    const totalPages = Math.max(1, Math.ceil(history.totalCount / replyHistory.pageSize));
    const currentPageNumber = totalPages - history.paginationPageIndex;
    const handleLoadOlder = () => {
        if (history.isLoadingOlder) {
            return;
        }
        if (showPagination) {
            void goToOlderPaginationPage(reportId, replyHistory);
            return;
        }
        void loadOlderReplies(reportId, replyHistory);
    };
    return (_jsxs("div", { className: "flex flex-col items-center gap-[6px] py-[8px]", children: [history.isLoadingOlder ? (_jsxs("div", { className: "flex items-center justify-center gap-[6px] text-[12px] text-[var(--adaptive-black500)]", children: [_jsx(ProcessingDots, {}), _jsx("span", { children: messages.feedbackList.loadingMore })] })) : null, showPagination ? (_jsxs("div", { className: "flex items-center gap-[8px] text-[12px] text-[var(--adaptive-black600)]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: !history.hasNewerPage || history.isLoadingOlder, onClick: () => goToNewerPaginationPage(reportId, replyHistory), className: "rounded-[6px] px-[8px] py-[4px] font-semibold hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-40", children: messages.thread.replyPaginationNewer }), _jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: messages.thread.replyPaginationStatus(currentPageNumber, totalPages) }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: !history.hasMoreOlder || history.isLoadingOlder, onClick: handleLoadOlder, className: "rounded-[6px] px-[8px] py-[4px] font-semibold hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-40", children: messages.thread.replyPaginationOlder })] })) : null, showLoadMoreButton && history.hasMoreOlder ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: history.isLoadingOlder, onClick: handleLoadOlder, className: "rounded-[999px] border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50", children: messages.thread.loadMoreReplies(replyHistory.pageSize) })) : null, !showPagination && !showLoadMoreButton && usesReplyInfiniteScroll(replyHistory.mode) && history.hasMoreOlder && !history.isLoadingOlder ? (_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: messages.thread.scrollHintUp })) : null] }));
}
//# sourceMappingURL=ReplyHistoryControls.js.map