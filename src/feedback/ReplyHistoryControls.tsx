import { ProcessingDots } from "@/components/ui/ProcessingDots.js";
import { usesReplyInfiniteScroll, usesReplyLoadMoreButton, usesReplyPaginationMode } from "@/constants/replyHistory.js";
import { useReportPreferences, useReportData } from "@/providers/reportContext.js";
import type { ReplyHistoryState } from "@/hooks/replyHistoryActions.js";

type ReplyHistoryControlsProps = {
    reportId: string;
    history: ReplyHistoryState | undefined;
};

export function ReplyHistoryControls({ reportId, history }: ReplyHistoryControlsProps) {
    const { messages } = useReportPreferences();
    const { replyHistory, loadOlderReplies, goToOlderPaginationPage, goToNewerPaginationPage } = useReportData();

    if (!history?.initialized) {
        return history?.isLoadingOlder ? (
            <div className="flex items-center justify-center gap-[6px] py-[8px] text-[12px] text-[var(--adaptive-black500)]">
                <ProcessingDots />
                <span>{messages.feedbackList.loadingMore}</span>
            </div>
        ) : null;
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

    return (
        <div className="flex flex-col items-center gap-[6px] py-[8px]">
            {history.isLoadingOlder ? (
                <div className="flex items-center justify-center gap-[6px] text-[12px] text-[var(--adaptive-black500)]">
                    <ProcessingDots />
                    <span>{messages.feedbackList.loadingMore}</span>
                </div>
            ) : null}

            {showPagination ? (
                <div className="flex items-center gap-[8px] text-[12px] text-[var(--adaptive-black600)]">
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={!history.hasNewerPage || history.isLoadingOlder}
                        onClick={() => goToNewerPaginationPage(reportId, replyHistory)}
                        className="rounded-[6px] px-[8px] py-[4px] font-semibold hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {messages.thread.replyPaginationNewer}
                    </button>
                    <span className="font-medium text-[var(--adaptive-black500)]">
                        {messages.thread.replyPaginationStatus(currentPageNumber, totalPages)}
                    </span>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={!history.hasMoreOlder || history.isLoadingOlder}
                        onClick={handleLoadOlder}
                        className="rounded-[6px] px-[8px] py-[4px] font-semibold hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {messages.thread.replyPaginationOlder}
                    </button>
                </div>
            ) : null}

            {showLoadMoreButton && history.hasMoreOlder ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={history.isLoadingOlder}
                    onClick={handleLoadOlder}
                    className="rounded-[999px] border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {messages.thread.loadMoreReplies(replyHistory.pageSize)}
                </button>
            ) : null}

            {!showPagination && !showLoadMoreButton && usesReplyInfiniteScroll(replyHistory.mode) && history.hasMoreOlder && !history.isLoadingOlder ? (
                <p className="text-[12px] text-[var(--adaptive-black500)]">{messages.thread.scrollHintUp}</p>
            ) : null}
        </div>
    );
}
