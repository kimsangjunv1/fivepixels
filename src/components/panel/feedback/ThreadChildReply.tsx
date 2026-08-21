import type { ReportAuthor, ReportReply } from "@/types/report.js";
import { formatClockTime } from "@/utils/shared/format.js";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";

type ThreadChildReplyProps = {
    reply: ReportReply;
    authors: ReportAuthor[];
    originalAuthorName: string;
    actorName: string;
};

export function ThreadChildReply({ reply, authors, originalAuthorName, actorName }: ThreadChildReplyProps) {
    const authorName = reply.author_name?.trim() ?? "";

    return (
        <ThreadTimelineRow
            time={formatClockTime(reply.created_at)}
            replyIndicator
        >
            <p className="leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]">
                <MentionMessage
                    message={reply.message}
                    mentions={reply.mentions}
                />
            </p>

            {authorName ? (
                <ThreadAuthorMeta
                    authorName={authorName}
                    authors={authors}
                    showMine={authorName === actorName}
                    showCreator={authorName === originalAuthorName}
                />
            ) : null}
        </ThreadTimelineRow>
    );
}
