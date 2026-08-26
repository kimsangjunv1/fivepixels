import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatClockTime } from "../../../utils/shared/format.js";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { FeedAuthorAvatar } from "./feed/FeedAuthorAvatar.js";
import { FeedCommentMeta } from "./feed/FeedCommentMeta.js";
import { ThreadLayoutShell } from "./feed/ThreadLayoutShell.js";
export function ThreadChildReply({ reply, authors, originalAuthorName, actorName }) {
    const { threadLayout } = useReportPreferences();
    const authorName = reply.author_name?.trim() ?? "";
    const isFeed = threadLayout === "feed";
    return (_jsxs(ThreadLayoutShell, { classicTime: formatClockTime(reply.created_at), classicReplyIndicator: true, nested: isFeed, density: "comment", feedNode: authorName ? _jsx(FeedAuthorAvatar, { name: authorName, size: "sm" }) : undefined, children: [isFeed && authorName ? (_jsx(FeedCommentMeta, { authorName: authorName, createdAt: reply.created_at, authors: authors })) : null, _jsx("p", { className: `leading-[1.45] text-[var(--adaptive-text-primary)] ${isFeed ? "mt-[2px] text-[13px]" : "text-[13px]"}`, children: _jsx(MentionMessage, { message: reply.message, mentions: reply.mentions }) }), !isFeed && authorName ? (_jsx(ThreadAuthorMeta, { authorName: authorName, authors: authors, showMine: authorName === actorName, showCreator: authorName === originalAuthorName })) : null] }));
}
//# sourceMappingURL=ThreadChildReply.js.map