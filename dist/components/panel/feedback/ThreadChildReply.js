import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MentionMessage } from "./MentionMessage.js";
import { ThreadAuthorMeta } from "./ThreadAuthorMeta.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
export function ThreadChildReply({ reply, originalAuthorName }) {
    return (_jsxs(ThreadTimelineRow, { children: [_jsx("p", { className: "leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]", children: _jsx(MentionMessage, { message: reply.message, mentions: reply.mentions }) }), reply.author_name ? (_jsx(ThreadAuthorMeta, { authorName: reply.author_name, createdAt: reply.created_at, showCreator: reply.author_name.trim() === originalAuthorName })) : null] }));
}
//# sourceMappingURL=ThreadChildReply.js.map