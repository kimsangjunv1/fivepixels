import type { ReportReply } from "@/types/report.js";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";

type ThreadChildReplyProps = {
    reply: ReportReply;
    originalAuthorName: string;
    actorName: string;
};

export function ThreadChildReply({ reply, originalAuthorName, actorName }: ThreadChildReplyProps) {
    const authorName = reply.author_name?.trim() ?? "";

    return (
        <ThreadTimelineRow>
            <p className="leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]">
                <MentionMessage
                    message={reply.message}
                    mentions={reply.mentions}
                />
            </p>

            {authorName ? (
                <ThreadAuthorMeta
                    authorName={authorName}
                    createdAt={reply.created_at}
                    showMine={authorName === actorName}
                    showCreator={authorName === originalAuthorName}
                />
            ) : null}
        </ThreadTimelineRow>
    );
}
