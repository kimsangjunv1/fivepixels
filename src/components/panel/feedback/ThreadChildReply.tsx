import type { ReportAuthor, ReportReply } from "@/types/report.js";
import { formatClockTime } from "@/utils/shared/format.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { FeedAuthorAvatar } from "./feed/FeedAuthorAvatar.js";
import { FeedCommentMeta } from "./feed/FeedCommentMeta.js";
import { ThreadLayoutShell } from "./feed/ThreadLayoutShell.js";

type ThreadChildReplyProps = {
    reply: ReportReply;
    authors: ReportAuthor[];
    originalAuthorName: string;
    actorName: string;
};

export function ThreadChildReply({ reply, authors, originalAuthorName, actorName }: ThreadChildReplyProps) {
    const { threadLayout } = useReportPreferences();
    const authorName = reply.author_name?.trim() ?? "";
    const isFeed = threadLayout === "feed";

    return (
        <ThreadLayoutShell
            classicTime={formatClockTime(reply.created_at)}
            classicReplyIndicator
            nested={isFeed}
            density="comment"
            feedNode={authorName ? <FeedAuthorAvatar name={authorName} size="sm" /> : undefined}
        >
            {isFeed && authorName ? (
                <FeedCommentMeta
                    authorName={authorName}
                    createdAt={reply.created_at}
                    authors={authors}
                />
            ) : null}

            <p className={`leading-[1.45] text-[var(--adaptive-text-primary)] ${isFeed ? "mt-[2px] text-[13px]" : "text-[13px]"}`}>
                <MentionMessage
                    message={reply.message}
                    mentions={reply.mentions}
                />
            </p>

            {!isFeed && authorName ? (
                <ThreadAuthorMeta
                    authorName={authorName}
                    authors={authors}
                    showMine={authorName === actorName}
                    showCreator={authorName === originalAuthorName}
                />
            ) : null}
        </ThreadLayoutShell>
    );
}
