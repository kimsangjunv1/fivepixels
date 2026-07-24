import type { ReportReply } from "@/types/report.js";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";

type ThreadChildReplyProps = {
    reply: ReportReply;
    originalAuthorName: string;
};

export function ThreadChildReply({ reply, originalAuthorName }: ThreadChildReplyProps) {
    return (
        <ThreadTimelineRow>
            <p className="leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]">
                <MentionMessage
                    message={reply.message}
                    mentions={reply.mentions}
                />
            </p>

            {reply.author_name ? (
                <ThreadAuthorMeta
                    authorName={reply.author_name}
                    createdAt={reply.created_at}
                    showCreator={reply.author_name.trim() === originalAuthorName}
                />
            ) : null}
        </ThreadTimelineRow>
    );
}
