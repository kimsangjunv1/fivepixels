import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatClockTime } from "../../../utils/shared/format.js";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
export function ThreadChildReply({ reply, authors, originalAuthorName, actorName }) {
    const authorName = reply.author_name?.trim() ?? "";
    return (_jsxs(ThreadTimelineRow, { time: formatClockTime(reply.created_at), replyIndicator: true, children: [_jsx("p", { className: "leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]", children: _jsx(MentionMessage, { message: reply.message, mentions: reply.mentions }) }), authorName ? (_jsx(ThreadAuthorMeta, { authorName: authorName, authors: authors, showMine: authorName === actorName, showCreator: authorName === originalAuthorName })) : null] }));
}
//# sourceMappingURL=ThreadChildReply.js.map